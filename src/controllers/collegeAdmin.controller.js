import Lead from '../models/lead.model.js';
import Application from '../models/application.model.js';
import College from '../models/college.model.js';
import Course from '../models/course.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { logAudit } from '../services/audit.service.js';

export const dashboard = asyncHandler(async (req, res) => {
  const collegeId = req.query.collegeId;
  if (!collegeId) throw new ApiError(400, 'collegeId is required');

  const [college, leads, applications] = await Promise.all([
    College.findById(collegeId),
    Lead.find({ collegeId }).populate('studentId', 'name email phone').sort({ createdAt: -1 }).limit(200),
    Application.find({ collegeId }).populate('studentId', 'name email phone').populate('courseId', 'name').sort({ createdAt: -1 }).limit(200),
  ]);

  return ok(res, {
    college,
    stats: {
      leads: leads.length,
      applications: applications.length,
      admitted: applications.filter((a) => a.status === 'admitted').length,
    },
    leads,
    applications,
  });
});

export const updateCollegeProfile = asyncHandler(async (req, res) => {
  const updated = await College.findByIdAndUpdate(req.params.collegeId, req.body, { new: true });
  await logAudit({ req, action: 'update', resource: 'college_profile', resourceId: req.params.collegeId, changes: req.body });
  return ok(res, updated, 'College profile updated');
});

export const listCollegeCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({ _id: { $in: req.query.courseIds?.split(',') || [] } });
  return ok(res, courses);
});

export const updateLeadStatus = asyncHandler(async (req, res) => {
  const lead = await Lead.findByIdAndUpdate(req.params.leadId, { status: req.body.status }, { new: true });
  await logAudit({ req, action: 'update', resource: 'lead_status', resourceId: req.params.leadId, changes: req.body });
  return ok(res, lead, 'Lead status updated');
});
