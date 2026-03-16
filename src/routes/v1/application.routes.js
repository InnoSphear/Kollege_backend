import { Router } from 'express';
import { createApplication, listMyApplications, updateApplicationStatus } from '../../controllers/application.controller.js';
import { auth, permit } from '../../middleware/auth.middleware.js';
import { ROLES } from '../../constants/roles.js';

const router = Router();

router.post('/', auth, permit(ROLES.STUDENT), createApplication);
router.get('/mine', auth, permit(ROLES.STUDENT), listMyApplications);
router.patch('/:id/status', auth, permit(ROLES.PLATFORM_ADMIN, ROLES.COLLEGE_ADMIN), updateApplicationStatus);

export default router;
