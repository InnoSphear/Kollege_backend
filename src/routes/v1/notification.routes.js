import { Router } from 'express';
import { myNotifications } from '../../controllers/notification.controller.js';
import { auth } from '../../middleware/auth.middleware.js';

const router = Router();

router.get('/mine', auth, myNotifications);

export default router;
