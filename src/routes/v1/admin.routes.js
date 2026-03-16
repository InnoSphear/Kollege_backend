import { Router } from 'express';
import {
  createResource,
  dashboardMetrics,
  deleteResource,
  linkedOverview,
  listResource,
  updateResource,
} from '../../controllers/admin.controller.js';
import { auth, permit } from '../../middleware/auth.middleware.js';
import { ROLES } from '../../constants/roles.js';

const router = Router();

router.get('/metrics', auth, permit(ROLES.PLATFORM_ADMIN), dashboardMetrics);
router.get('/linked-overview', auth, permit(ROLES.PLATFORM_ADMIN), linkedOverview);
router.get('/:resource', auth, permit(ROLES.PLATFORM_ADMIN), listResource);
router.post('/:resource', auth, permit(ROLES.PLATFORM_ADMIN), createResource);
router.patch('/:resource/:id', auth, permit(ROLES.PLATFORM_ADMIN), updateResource);
router.delete('/:resource/:id', auth, permit(ROLES.PLATFORM_ADMIN), deleteResource);

export default router;
