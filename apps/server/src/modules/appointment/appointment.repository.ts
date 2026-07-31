import { AppointmentModel, type HydratedAppointment, type AppointmentStatus } from './appointment.model';
import type { ListAppointmentsQuery } from './appointment.types';

const ACTIVE_STATUSES: AppointmentStatus[] = ['pending', 'confirmed'];

export const appointmentRepository = {
  create(input: {
    patientId: string;
    doctorId: string;
    hospitalId: string;
    healthOfficerId?: string;
    scheduledStart: Date;
    scheduledEnd: Date;
    type: 'in_person' | 'video';
    reasonForVisit: string;
    createdBy: string;
  }): Promise<HydratedAppointment> {
    return AppointmentModel.create(input);
  },

  findById(id: string): Promise<HydratedAppointment | null> {
    return AppointmentModel.findById(id)
      .populate({ path: 'patientId', populate: { path: 'userId' } })
      .populate({ path: 'doctorId', populate: { path: 'userId' } })
      .populate({ path: 'healthOfficerId', populate: { path: 'userId' } })
      .populate('hospitalId')
      .exec();
  },

  findConflicting(
    doctorId: string,
    scheduledStart: Date,
    scheduledEnd: Date,
  ): Promise<HydratedAppointment | null> {
    return AppointmentModel.findOne({
      doctorId,
      status: { $in: ACTIVE_STATUSES },
      scheduledStart: { $lt: scheduledEnd },
      scheduledEnd: { $gt: scheduledStart },
    }).exec();
  },

  async findMany(query: ListAppointmentsQuery) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const filter: Record<string, unknown> = {};

    if (query.patientId) filter.patientId = query.patientId;
    if (query.doctorId) filter.doctorId = query.doctorId;
    if (query.hospitalId) filter.hospitalId = query.hospitalId;
    if (query.status) filter.status = query.status;
    if (query.from || query.to) {
      filter.scheduledStart = {
        ...(query.from ? { $gte: new Date(query.from) } : {}),
        ...(query.to ? { $lte: new Date(query.to) } : {}),
      };
    }

    const [items, total] = await Promise.all([
      AppointmentModel.find(filter)
        .populate({ path: 'patientId', populate: { path: 'userId' } })
        .populate({ path: 'doctorId', populate: { path: 'userId' } })
        .populate({ path: 'healthOfficerId', populate: { path: 'userId' } })
        .populate('hospitalId')
        .sort({ scheduledStart: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      AppointmentModel.countDocuments(filter),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
  },

  updateStatus(
    id: string,
    status: AppointmentStatus,
    extra: { cancelledBy?: string; cancellationReason?: string } = {},
  ): Promise<HydratedAppointment | null> {
    return AppointmentModel.findByIdAndUpdate(id, { $set: { status, ...extra } }, { new: true })
      .populate({ path: 'patientId', populate: { path: 'userId' } })
      .populate({ path: 'doctorId', populate: { path: 'userId' } })
      .populate({ path: 'healthOfficerId', populate: { path: 'userId' } })
      .exec();
  },
};
