import { Router } from 'express';
import { dashboard, listCollegeCourses, updateCollegeProfile, updateLeadStatus } from '../../controllers/collegeAdmin.controller.js';
import { auth, permit } from '../../middleware/auth.middleware.js';
import { ROLES } from '../../constants/roles.js';

const router = Router();

router.get('/dashboard', auth, permit(ROLES.COLLEGE_ADMIN), dashboard);
router.patch('/colleges/:collegeId', auth, permit(ROLES.COLLEGE_ADMIN), updateCollegeProfile);
router.get('/courses', auth, permit(ROLES.COLLEGE_ADMIN), listCollegeCourses);
router.patch('/leads/:leadId/status', auth, permit(ROLES.COLLEGE_ADMIN), updateLeadStatus);

export default router;
