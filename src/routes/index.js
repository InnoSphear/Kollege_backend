import { Router } from 'express';
import authRoutes from './v1/auth.routes.js';
import catalogRoutes from './v1/catalog.routes.js';
import applicationRoutes from './v1/application.routes.js';
import recommendationRoutes from './v1/recommendation.routes.js';
import referralRoutes from './v1/referral.routes.js';
import counselingRoutes from './v1/counseling.routes.js';
import notificationRoutes from './v1/notification.routes.js';
import adminRoutes from './v1/admin.routes.js';
import compareRoutes from './v1/compare.routes.js';
import integrationRoutes from './v1/integration.routes.js';
import collegeAdminRoutes from './v1/collegeAdmin.routes.js';
import cmsRoutes from './v1/cms.routes.js';
import crmRoutes from './v1/crm.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/catalog', catalogRoutes);
router.use('/applications', applicationRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/referrals', referralRoutes);
router.use('/counseling', counselingRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin', adminRoutes);
router.use('/compare-colleges', compareRoutes);
router.use('/integrations', integrationRoutes);
router.use('/college-admin', collegeAdminRoutes);
router.use('/cms', cmsRoutes);
router.use('/crm', crmRoutes);

export default router;
