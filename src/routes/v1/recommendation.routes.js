import { Router } from 'express';
import { collegePredictor, scholarshipPredictor } from '../../controllers/recommendation.controller.js';

const router = Router();

router.post('/college-predictor', collegePredictor);
router.post('/scholarship-predictor', scholarshipPredictor);

export default router;
