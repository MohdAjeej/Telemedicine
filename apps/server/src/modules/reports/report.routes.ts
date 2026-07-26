import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import { reportController } from './report.controller';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/summary', reportController.summary);
router.get('/appointments-by-status', reportController.appointmentsByStatus);
router.get('/appointments-over-time', reportController.appointmentsOverTime);
router.get('/doctor-utilization', reportController.doctorUtilization);
router.get('/patient-demographics', reportController.patientDemographics);

export default router;
