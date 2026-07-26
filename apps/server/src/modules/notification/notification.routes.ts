import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { notificationController } from './notification.controller';

const router = Router();

router.use(authenticate);

router.get('/', notificationController.list);
router.get('/unread-count', notificationController.unreadCount);
router.post('/:id/read', notificationController.markRead);
router.post('/read-all', notificationController.markAllRead);

export default router;
