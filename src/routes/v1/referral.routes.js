import { Router } from 'express';
import { myReferralDashboard } from '../../controllers/referral.controller.js';
import { auth, permit } from '../../middleware/auth.middleware.js';
import { ROLES } from '../../constants/roles.js';

const router = Router();

router.get('/dashboard', auth, permit(ROLES.COUNSELOR), myReferralDashboard);

export default router;
