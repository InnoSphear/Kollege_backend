import { Router } from 'express';
import { myCounselingSessions, requestCounseling } from '../../controllers/counseling.controller.js';
import { auth, permit } from '../../middleware/auth.middleware.js';
import { ROLES } from '../../constants/roles.js';

const router = Router();

router.post('/request', auth, permit(ROLES.STUDENT), requestCounseling);
router.get('/mine', auth, permit(ROLES.STUDENT), myCounselingSessions);

export default router;
