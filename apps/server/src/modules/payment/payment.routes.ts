import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import { validateRequest } from '../../middlewares/validate.middleware';
import { paymentController } from './payment.controller';
import { createPaymentValidation, paymentIdValidation } from './payment.validation';

const router = Router();

router.use(authenticate);

router.get('/', paymentController.listForPatient);
router.post('/', authorize('patient'), createPaymentValidation, validateRequest, paymentController.pay);
router.get('/:id', paymentIdValidation, validateRequest, paymentController.getById);

export default router;
