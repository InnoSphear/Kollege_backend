import { Router } from 'express';
import { imagekitAuth, reindexColleges, uploadImage } from '../../controllers/integration.controller.js';
import { auth, permit } from '../../middleware/auth.middleware.js';
import { ROLES } from '../../constants/roles.js';
import { upload } from '../../middleware/upload.middleware.js';

const router = Router();

router.get('/imagekit/auth', auth, imagekitAuth);
router.post('/imagekit/upload', auth, permit(ROLES.PLATFORM_ADMIN), upload.single('file'), uploadImage);
router.post('/search/reindex-colleges', auth, permit(ROLES.PLATFORM_ADMIN), reindexColleges);

export default router;
