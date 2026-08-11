import crypto from 'node:crypto';
import ms from 'ms';
import { ApiError } from '../../helpers/ApiError';
import { recordAuditLog } from '../audit-log/auditLog.service';
import { doctorRepository } from '../doctor/doctor.repository';
import { patientRepository } from '../patient/patient.repository';
import { healthOfficerRepository } from '../health-officer/healthOfficer.repository';
import { notificationService } from '../notification/notification.service';
import { consultationRepository } from '../consultation/consultation.repository';
import { appointmentRepository } from './appointment.repository';
import {
  emitAppointmentCancelled,
  emitAppointmentCreated,
  emitAppointmentUpdated,
  participantUserIds,
} from './appointment.socket';
import type {
  BookAppointmentInput,
  ListAppointmentsQuery,
  RequestActor,
  RescheduleAppointmentInput,
} from './appointment.types';

async function notifyParticipant(
  userId: string | undefined,
  title: string,
  body: string,
  appointmentId: string,
): Promise<void> {
  if (!userId) return;
  await notificationService.notify({
    userId,
    type: 'appointment',
    title,
    body,
    relatedEntityType: 'Appointment',
    relatedEntityId: appointmentId,
  });
}

const DEFAULT_SLOT_DURATION_MS = ms('30m');

async function resolveScopedFilter(actor: RequestActor, query: ListAppointmentsQuery) {
  if (actor.role === 'patient') {
    const patient = await patientRepository.findByUserId(actor.userId);
    if (!patient) throw ApiError.notFound('Patient profile not found');
    return { ...query, patientId: patient._id.toString() };
  }

  if (actor.role === 'doctor') {
    const doctor = await doctorRepository.findByUserId(actor.userId);
    if (!doctor) throw ApiError.notFound('Doctor profile not found');
    return { ...query, doctorId: doctor._id.toString() };
  }

  if (actor.role === 'health_officer') {
    if (!actor.hospitalId) throw ApiError.notFound('Health officer is not assigned to a hospital');
    return { ...query, hospitalId: actor.hospitalId };
  }

  if (actor.role === 'admin') {
    // An admin only ever manages their own hospital — force the scope from the
    // signed JWT claim rather than trusting a client-supplied hospitalId, which
    // would otherwise leak every hospital's appointments to any admin.
    if (!actor.hospitalId) throw ApiError.notFound('Admin profile not found');
    return { ...query, hospitalId: actor.hospitalId };
  }

  return query;
}

export const appointmentService = {
  /** Bookable only by a Health Officer, always on a patient's behalf (input.patientId required). */
  async book(actorUserId: string, actorRole: string, input: BookAppointmentInput) {
    if (actorRole !== 'health_officer') {
      throw ApiError.forbidden('Only a health officer can book appointments');
    }

    const officer = await healthOfficerRepository.findByUserId(actorUserId);
    if (!officer) throw ApiError.notFound('Health officer profile not found');

    const patient = await patientRepository.findById(input.patientId);
    if (!patient) throw ApiError.badRequest('A patient must be specified');

    const doctor = await doctorRepository.findById(input.doctorId);
    if (!doctor) throw ApiError.notFound('Doctor not found');

    const scheduledStart = new Date(input.scheduledStart);
    if (Number.isNaN(scheduledStart.getTime())) {
      throw ApiError.badRequest('Invalid appointment start time');
    }
    const scheduledEnd = input.scheduledEnd
      ? new Date(input.scheduledEnd)
      : new Date(scheduledStart.getTime() + DEFAULT_SLOT_DURATION_MS);

    const conflict = await appointmentRepository.findConflicting(
      input.doctorId,
      scheduledStart,
      scheduledEnd,
    );
    if (conflict) {
      throw ApiError.conflict('This doctor is not available at the selected time');
    }

    const appointment = await appointmentRepository.create({
      patientId: patient._id.toString(),
      doctorId: input.doctorId,
      hospitalId: input.hospitalId,
      healthOfficerId: officer._id.toString(),
      scheduledStart,
      scheduledEnd,
      // The appointment system is video-consultation-only — ignore whatever
      // the client sends and always book video, regardless of input.
      type: 'video',
      reasonForVisit: input.reasonForVisit,
      createdBy: actorUserId,
    });

    const populated = await appointmentRepository.findById(appointment._id.toString());
    if (populated) {
      emitAppointmentCreated(populated);
      const { doctorUserId } = participantUserIds(populated);
      await notifyParticipant(
        doctorUserId,
        'New appointment request',
        `A patient requested an appointment on ${scheduledStart.toLocaleString()}.`,
        appointment._id.toString(),
      );
    }

    await recordAuditLog({
      actorId: actorUserId,
      hospitalId: appointment.hospitalId.toString(),
      action: 'appointment.booked',
      entityType: 'Appointment',
      entityId: appointment._id.toString(),
    });

    return populated ?? appointment;
  },

  async list(actor: RequestActor, query: ListAppointmentsQuery) {
    const scopedQuery = await resolveScopedFilter(actor, query);
    return appointmentRepository.findMany(scopedQuery);
  },

  async getById(id: string) {
    const appointment = await appointmentRepository.findById(id);
    if (!appointment) throw ApiError.notFound('Appointment not found');
    return appointment;
  },

  async confirm(id: string, actorUserId: string) {
    const appointment = await appointmentRepository.findById(id);
    if (!appointment) throw ApiError.notFound('Appointment not found');
    if (appointment.status !== 'pending') {
      throw ApiError.badRequest('Only pending appointments can be confirmed');
    }

    const videoRoomId = appointment.type === 'video' ? crypto.randomUUID() : undefined;
    const updated = await appointmentRepository.updateStatus(id, 'confirmed', {});
    if (videoRoomId && updated) {
      updated.videoRoomId = videoRoomId;
      await updated.save();
    }

    if (updated) {
      emitAppointmentUpdated(updated);
      const { patientUserId } = participantUserIds(updated);
      await notifyParticipant(
        patientUserId,
        'Appointment confirmed',
        `Your appointment on ${updated.scheduledStart.toLocaleString()} has been confirmed.`,
        id,
      );
    }
    await recordAuditLog({
      actorId: actorUserId,
      hospitalId: updated?.hospitalId?.toString(),
      action: 'appointment.confirmed',
      entityType: 'Appointment',
      entityId: id,
    });

    return updated;
  },

  /** Bookable only by a Health Officer, and only before the consultation has actually started. */
  async reschedule(id: string, actorUserId: string, actorRole: string, input: RescheduleAppointmentInput) {
    if (actorRole !== 'health_officer') {
      throw ApiError.forbidden('Only a health officer can reschedule appointments');
    }

    const appointment = await appointmentRepository.findById(id);
    if (!appointment) throw ApiError.notFound('Appointment not found');
    if (['completed', 'cancelled', 'no_show'].includes(appointment.status)) {
      throw ApiError.badRequest(`Cannot reschedule an appointment that is already ${appointment.status}`);
    }

    const consultation = await consultationRepository.findByAppointmentId(id);
    if (consultation?.status === 'in_progress') {
      throw ApiError.badRequest('Cannot reschedule — the consultation has already started');
    }

    const scheduledStart = new Date(input.scheduledStart);
    if (Number.isNaN(scheduledStart.getTime())) {
      throw ApiError.badRequest('Invalid appointment start time');
    }
    const scheduledEnd = input.scheduledEnd
      ? new Date(input.scheduledEnd)
      : new Date(scheduledStart.getTime() + DEFAULT_SLOT_DURATION_MS);

    // appointment.doctorId comes back populated (a full Doctor profile doc, not
    // a bare id) from appointmentRepository.findById — unwrap its _id rather
    // than stringifying the populated document itself.
    const doctorId = String((appointment.doctorId as unknown as { _id?: unknown })._id ?? appointment.doctorId);
    const conflict = await appointmentRepository.findConflicting(
      doctorId,
      scheduledStart,
      scheduledEnd,
      id,
    );
    if (conflict) {
      throw ApiError.conflict('This doctor is not available at the selected time');
    }

    const updated = await appointmentRepository.reschedule(id, scheduledStart, scheduledEnd);

    if (updated) {
      emitAppointmentUpdated(updated);
      const { patientUserId, doctorUserId } = participantUserIds(updated);
      const title = 'Appointment rescheduled';
      const body = `The appointment has been rescheduled to ${scheduledStart.toLocaleString()}.`;
      await notifyParticipant(patientUserId, title, body, id);
      await notifyParticipant(doctorUserId, title, body, id);
    }

    await recordAuditLog({
      actorId: actorUserId,
      hospitalId: updated?.hospitalId?.toString(),
      action: 'appointment.rescheduled',
      entityType: 'Appointment',
      entityId: id,
    });

    return updated;
  },

  async complete(id: string, actorUserId: string) {
    const appointment = await appointmentRepository.findById(id);
    if (!appointment) throw ApiError.notFound('Appointment not found');
    if (appointment.status !== 'confirmed') {
      throw ApiError.badRequest('Only confirmed appointments can be marked completed');
    }

    const updated = await appointmentRepository.updateStatus(id, 'completed');
    if (updated) emitAppointmentUpdated(updated);
    await recordAuditLog({
      actorId: actorUserId,
      hospitalId: updated?.hospitalId?.toString(),
      action: 'appointment.completed',
      entityType: 'Appointment',
      entityId: id,
    });

    return updated;
  },

  async markNoShow(id: string, actorUserId: string) {
    const appointment = await appointmentRepository.findById(id);
    if (!appointment) throw ApiError.notFound('Appointment not found');
    if (appointment.status !== 'confirmed') {
      throw ApiError.badRequest('Only confirmed appointments can be marked as no-show');
    }

    const updated = await appointmentRepository.updateStatus(id, 'no_show');
    if (updated) emitAppointmentUpdated(updated);
    await recordAuditLog({
      actorId: actorUserId,
      hospitalId: updated?.hospitalId?.toString(),
      action: 'appointment.no_show',
      entityType: 'Appointment',
      entityId: id,
    });

    return updated;
  },

  async cancel(id: string, actorUserId: string, reason?: string) {
    const appointment = await appointmentRepository.findById(id);
    if (!appointment) throw ApiError.notFound('Appointment not found');
    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
      throw ApiError.badRequest(`Cannot cancel an appointment that is already ${appointment.status}`);
    }

    const updated = await appointmentRepository.updateStatus(id, 'cancelled', {
      cancelledBy: actorUserId,
      cancellationReason: reason,
    });

    if (updated) {
      emitAppointmentCancelled(updated);
      const { patientUserId, doctorUserId } = participantUserIds(updated);
      const otherPartyUserId = actorUserId === patientUserId ? doctorUserId : patientUserId;
      await notifyParticipant(
        otherPartyUserId,
        'Appointment cancelled',
        `The appointment on ${updated.scheduledStart.toLocaleString()} was cancelled.`,
        id,
      );
    }
    await recordAuditLog({
      actorId: actorUserId,
      hospitalId: updated?.hospitalId?.toString(),
      action: 'appointment.cancelled',
      entityType: 'Appointment',
      entityId: id,
      metadata: { reason },
    });

    return updated;
  },
};
