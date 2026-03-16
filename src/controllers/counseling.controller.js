import CounselingSession from '../models/counselingSession.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/apiResponse.js';

export const requestCounseling = asyncHandler(async (req, res) => {
  const session = await CounselingSession.create({ ...req.body, studentId: req.user._id, status: 'requested' });
  return ok(res, session, 'Counseling request submitted', 201);
});

export const myCounselingSessions = asyncHandler(async (req, res) => {
  const sessions = await CounselingSession.find({ studentId: req.user._id }).sort({ createdAt: -1 });
  return ok(res, sessions);
});
