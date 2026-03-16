import { Router } from 'express';
import { getAdminCms, getPublicCms, updateAdminCms } from '../../controllers/cms.controller.js';
import { auth, permit } from '../../middleware/auth.middleware.js';
import { ROLES } from '../../constants/roles.js';

const router = Router();

router.get('/public', getPublicCms);
router.get('/admin', auth, permit(ROLES.PLATFORM_ADMIN), getAdminCms);
router.patch('/admin', auth, permit(ROLES.PLATFORM_ADMIN), updateAdminCms);

export default router;
