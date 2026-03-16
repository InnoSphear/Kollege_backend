import { Router } from 'express';
import { enrollStudentInterest, login, me, myProfile, register, updateMyProfile } from '../../controllers/auth.controller.js';
import { auth } from '../../middleware/auth.middleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/enroll-interest', enrollStudentInterest);
router.get('/me', auth, me);
router.get('/profile', auth, myProfile);
router.patch('/profile', auth, updateMyProfile);

export default router;
