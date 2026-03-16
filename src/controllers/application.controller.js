import Application from '../models/application.model.js';
import Lead from '../models/lead.model.js';
import Referral from '../models/referral.model.js';
import StudentProfile from '../models/studentProfile.model.js';
import CounselorProfile from '../models/counselorProfile.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/apiResponse.js';
import { logAudit } from '../services/audit.service.js';

export const createApplication = asyncHandler(async (req, res) => {
  let referralCounselorId = req.body.referralCounselorId;
  if (!referralCounselorId) {
    const profile = await StudentProfile.findOne({ userId: req.user._id });
    if (profile?.referralCodeUsed) {
      const counselorProfile = await CounselorProfile.findOne({ referralCode: profile.referralCodeUsed });
      referralCounselorId = counselorProfile?.userId;
    }
  }

  const payload = { ...req.body, studentId: req.user._id, referralCounselorId };
  const created = await Application.create(payload);

  await Lead.create({
    studentId: req.user._id,
    collegeId: req.body.collegeId,
    counselorId: referralCounselorId,
    source: 'application_form',
  });

  if (referralCounselorId) {
    await Referral.findOneAndUpdate(
      { studentId: req.user._id, counselorId: referralCounselorId },
      { status: 'applied' },
      { new: true }
    );
  }

  return ok(res, created, 'Application submitted', 201);
});

export const listMyApplications = asyncHandler(async (req, res) => {
  const items = await Application.find({ studentId: req.user._id })
    .populate('collegeId', 'name slug city state')
    .populate('courseId', 'name slug');
  return ok(res, items);
});

export const updateApplicationStatus = asyncHandler(async (req, res) => {
  const app = await Application.findByIdAndUpdate(req.params.id, req.body, { new: true });

  if (req.body.status === 'admitted' && app?.referralCounselorId) {
    await Referral.findOneAndUpdate(
      { studentId: app.studentId, counselorId: app.referralCounselorId },
      {
        status: 'admitted',
        commissionStatus: req.body.commissionStatus || 'approved',
        commissionAmount: req.body.commissionAmount || 2000,
      },
      { new: true }
    );
  }

  await logAudit({ req, action: 'update', resource: 'application_status', resourceId: req.params.id, changes: req.body });

  return ok(res, app, 'Application status updated');
});
