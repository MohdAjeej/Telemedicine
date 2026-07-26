import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '../../helpers/ApiError';
import { asyncHandler } from '../../helpers/asyncHandler';
import { appointmentRepository } from './appointment.repository';

/**
 * Loads the appointment and confirms the caller is actually a participant
 * (or staff with legitimate access) before allowing status-changing routes.
 * Runs after `authenticate`, before the controller action.
 */
export const requireAppointmentAccess = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const appointment = await appointmentRepository.findById(req.params.id);
    if (!appointment) {
      throw ApiError.notFound('Appointment not found');
    }

    const user = req.user!;
    if (user.role === 'admin' || user.role === 'health_officer') {
      next();
      return;
    }

    const patient = appointment.patientId as unknown as { userId?: { _id?: unknown } };
    const doctor = appointment.doctorId as unknown as { userId?: { _id?: unknown } };
    const patientUserId = String(patient?.userId?._id ?? '');
    const doctorUserId = String(doctor?.userId?._id ?? '');

    if (user.role === 'patient' && patientUserId === user.id) {
      next();
      return;
    }
    if (user.role === 'doctor' && doctorUserId === user.id) {
      next();
      return;
    }

    throw ApiError.forbidden('You do not have access to this appointment');
  },
);
