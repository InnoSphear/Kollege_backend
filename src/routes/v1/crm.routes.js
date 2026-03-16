import { Router } from 'express';
import {
  createAdminCounselor,
  createCrmContact,
  listMyCrmCalls,
  listMyCrmContacts,
  listMyCrmMessages,
  logCrmCall,
  logCrmMessage,
  myCrmDashboard,
  prioritizedLeads,
  superadminCrmUsage,
  upsertMyWhatsappSession,
} from '../../controllers/crm.controller.js';
import { auth, permit } from '../../middleware/auth.middleware.js';
import { ROLES } from '../../constants/roles.js';

const router = Router();

router.post('/superadmin/admin-counselors', auth, permit(ROLES.PLATFORM_ADMIN), createAdminCounselor);
router.get('/superadmin/usage', auth, permit(ROLES.PLATFORM_ADMIN), superadminCrmUsage);

router.post('/contacts', auth, permit(ROLES.ADMIN_COUNSELOR, ROLES.PLATFORM_ADMIN), createCrmContact);
router.get('/contacts/mine', auth, permit(ROLES.ADMIN_COUNSELOR, ROLES.PLATFORM_ADMIN), listMyCrmContacts);
router.post('/messages/log', auth, permit(ROLES.ADMIN_COUNSELOR, ROLES.PLATFORM_ADMIN), logCrmMessage);
router.get('/messages/mine', auth, permit(ROLES.ADMIN_COUNSELOR, ROLES.PLATFORM_ADMIN), listMyCrmMessages);
router.post('/calls/log', auth, permit(ROLES.ADMIN_COUNSELOR, ROLES.PLATFORM_ADMIN), logCrmCall);
router.get('/calls/mine', auth, permit(ROLES.ADMIN_COUNSELOR, ROLES.PLATFORM_ADMIN), listMyCrmCalls);
router.post('/whatsapp/session', auth, permit(ROLES.ADMIN_COUNSELOR, ROLES.PLATFORM_ADMIN), upsertMyWhatsappSession);
router.get('/dashboard/mine', auth, permit(ROLES.ADMIN_COUNSELOR), myCrmDashboard);
router.get('/contacts/prioritized', auth, permit(ROLES.ADMIN_COUNSELOR, ROLES.PLATFORM_ADMIN), prioritizedLeads);

export default router;
