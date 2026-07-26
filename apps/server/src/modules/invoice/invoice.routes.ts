import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import { validateRequest } from '../../middlewares/validate.middleware';
import { invoiceController } from './invoice.controller';
import { createInvoiceValidation, invoiceIdValidation } from './invoice.validation';

const router = Router();

router.use(authenticate);

router.get('/', invoiceController.listForPatient);
router.post('/', authorize('admin'), createInvoiceValidation, validateRequest, invoiceController.create);
router.get('/:id', invoiceIdValidation, validateRequest, invoiceController.getById);
router.post('/:id/void', authorize('admin'), invoiceIdValidation, validateRequest, invoiceController.void);

export default router;
