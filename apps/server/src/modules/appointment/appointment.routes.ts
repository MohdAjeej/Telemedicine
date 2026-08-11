import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import { validateRequest } from '../../middlewares/validate.middleware';
import { appointmentController } from './appointment.controller';
import { requireAppointmentAccess } from './appointment.middleware';
import {
  appointmentIdValidation,
  bookAppointmentValidation,
  cancelAppointmentValidation,
  listAppointmentsValidation,
  rescheduleAppointmentValidation,
} from './appointment.validation';

const router = Router();

router.use(authenticate);

router.get('/', listAppointmentsValidation, validateRequest, appointmentController.list);
router.post(
  '/',
  authorize('health_officer'),
  bookAppointmentValidation,
  validateRequest,
  appointmentController.book,
);

router.get(
  '/:id',
  appointmentIdValidation,
  validateRequest,
  requireAppointmentAccess,
  appointmentController.getById,
);

router.post(
  '/:id/confirm',
  authorize('doctor', 'health_officer', 'admin'),
  appointmentIdValidation,
  validateRequest,
  requireAppointmentAccess,
  appointmentController.confirm,
);
router.post(
  '/:id/reschedule',
  authorize('health_officer'),
  appointmentIdValidation,
  rescheduleAppointmentValidation,
  validateRequest,
  requireAppointmentAccess,
  appointmentController.reschedule,
);
router.post(
  '/:id/complete',
  authorize('doctor', 'admin'),
  appointmentIdValidation,
  validateRequest,
  requireAppointmentAccess,
  appointmentController.complete,
);
router.post(
  '/:id/no-show',
  authorize('doctor', 'health_officer', 'admin'),
  appointmentIdValidation,
  validateRequest,
  requireAppointmentAccess,
  appointmentController.markNoShow,
);
router.post(
  '/:id/cancel',
  appointmentIdValidation,
  cancelAppointmentValidation,
  validateRequest,
  requireAppointmentAccess,
  appointmentController.cancel,
);

export default router;
