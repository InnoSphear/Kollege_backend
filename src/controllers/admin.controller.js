import User from '../models/user.model.js';
import College from '../models/college.model.js';
import Course from '../models/course.model.js';
import Exam from '../models/exam.model.js';
import Scholarship from '../models/scholarship.model.js';
import OnlineCourse from '../models/onlineCourse.model.js';
import Application from '../models/application.model.js';
import Lead from '../models/lead.model.js';
import Referral from '../models/referral.model.js';
import CounselorProfile from '../models/counselorProfile.model.js';
import BlogPost from '../models/blogPost.model.js';
import AuditLog from '../models/auditLog.model.js';
import CrmContact from '../models/crmContact.model.js';
import CrmMessage from '../models/crmMessage.model.js';
import CrmCallLog from '../models/crmCallLog.model.js';
import CrmWhatsappSession from '../models/crmWhatsappSession.model.js';
import CrmAutomationRule from '../models/crmAutomationRule.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { logAudit } from '../services/audit.service.js';
import { syncCollegeCourseLinks } from '../services/relation.service.js';

const models = {
  colleges: College,
  courses: Course,
  exams: Exam,
  scholarships: Scholarship,
  'online-courses': OnlineCourse,
  users: User,
  leads: Lead,
  referrals: Referral,
  counselors: CounselorProfile,
  blog: BlogPost,
  'crm-contacts': CrmContact,
  'crm-messages': CrmMessage,
  'crm-calls': CrmCallLog,
  'crm-whatsapp-sessions': CrmWhatsappSession,
  'crm-automation-rules': CrmAutomationRule,
  applications: Application,
  'audit-logs': AuditLog,
};

const populates = {
  colleges: [{ path: 'courses', select: 'name slug stream' }],
  courses: [{ path: 'topColleges', select: 'name slug city state' }],
  applications: [
    { path: 'studentId', select: 'name email phone' },
    { path: 'collegeId', select: 'name slug city state' },
    { path: 'courseId', select: 'name slug stream' },
    { path: 'referralCounselorId', select: 'name phone email' },
  ],
  leads: [
    { path: 'studentId', select: 'name email phone' },
    { path: 'collegeId', select: 'name slug' },
    { path: 'counselorId', select: 'name email phone' },
  ],
  referrals: [
    { path: 'studentId', select: 'name email phone' },
    { path: 'counselorId', select: 'name email phone' },
  ],
  counselors: [{ path: 'userId', select: 'name email phone' }],
  'crm-contacts': [{ path: 'counselorId', select: 'name phone email role' }],
  'crm-messages': [
    { path: 'counselorId', select: 'name phone email role' },
    { path: 'contactId', select: 'name phone email' },
  ],
  'crm-calls': [
    { path: 'counselorId', select: 'name phone email role' },
    { path: 'contactId', select: 'name phone email' },
  ],
  'crm-whatsapp-sessions': [{ path: 'counselorId', select: 'name phone email role' }],
  'crm-automation-rules': [{ path: 'counselorId', select: 'name phone email role' }],
  'audit-logs': [{ path: 'actorId', select: 'name email role' }],
};

const getModel = (resource) => {
  const model = models[resource];
  if (!model) throw new ApiError(404, `Unknown admin resource: ${resource}`);
  return model;
};

const paginate = (query) => {
  const page = Math.max(1, Number(query.page || 1));
  const limit = Math.min(100, Math.max(1, Number(query.limit || 20)));
  return { page, limit, skip: (page - 1) * limit };
};

const applyPopulate = (resource, query) => {
  const configs = populates[resource] || [];
  configs.forEach((cfg) => query.populate(cfg));
  return query;
};

const applySearchQuery = (q) => {
  if (!q) return {};
  const fields = ['name', 'title', 'email', 'phone', 'slug', 'code', 'action', 'resource'];
  return { $or: fields.map((field) => ({ [field]: { $regex: q, $options: 'i' } })) };
};

export const dashboardMetrics = asyncHandler(async (_req, res) => {
  const [students, colleges, courses, exams, scholarships, onlineCourses, applications, leads, referrals] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    College.countDocuments(),
    Course.countDocuments(),
    Exam.countDocuments(),
    Scholarship.countDocuments(),
    OnlineCourse.countDocuments(),
    Application.countDocuments(),
    Lead.countDocuments(),
    Referral.countDocuments(),
  ]);

  const conversionRate = leads ? Number(((applications / leads) * 100).toFixed(2)) : 0;
  return ok(res, { students, colleges, courses, exams, scholarships, onlineCourses, applications, leads, referrals, conversionRate });
});

export const linkedOverview = asyncHandler(async (_req, res) => {
  const [recentApplications, recentLeads, recentReferrals] = await Promise.all([
    Application.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('studentId', 'name phone')
      .populate('collegeId', 'name')
      .populate('courseId', 'name'),
    Lead.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('studentId', 'name phone')
      .populate('collegeId', 'name')
      .populate('counselorId', 'name'),
    Referral.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('studentId', 'name phone')
      .populate('counselorId', 'name phone'),
  ]);

  return ok(res, { recentApplications, recentLeads, recentReferrals });
});

export const listResource = asyncHandler(async (req, res) => {
  const resource = req.params.resource;
  const Model = getModel(resource);
  const { page, limit, skip } = paginate(req.query);

  const query = applySearchQuery(req.query.q);
  const fetchQuery = applyPopulate(resource, Model.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit));

  const [items, total] = await Promise.all([fetchQuery, Model.countDocuments(query)]);
  return ok(res, { items, pagination: { page, limit, total } });
});

export const createResource = asyncHandler(async (req, res) => {
  const resource = req.params.resource;
  if (resource === 'audit-logs') throw new ApiError(403, 'Audit logs are read-only');
  const Model = getModel(resource);
  const created = await Model.create(req.body);

  await syncCollegeCourseLinks({ resource, entity: created });
  await logAudit({ req, action: 'create', resource, resourceId: created._id, changes: req.body });

  return ok(res, created, 'Created', 201);
});

export const updateResource = asyncHandler(async (req, res) => {
  const resource = req.params.resource;
  if (resource === 'audit-logs') throw new ApiError(403, 'Audit logs are read-only');
  const Model = getModel(resource);
  const updated = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true });

  await syncCollegeCourseLinks({ resource, entity: updated });
  await logAudit({ req, action: 'update', resource, resourceId: req.params.id, changes: req.body });

  return ok(res, updated, 'Updated');
});

export const deleteResource = asyncHandler(async (req, res) => {
  const resource = req.params.resource;
  if (resource === 'audit-logs') throw new ApiError(403, 'Audit logs are read-only');
  const Model = getModel(resource);
  await Model.findByIdAndDelete(req.params.id);

  await logAudit({ req, action: 'delete', resource, resourceId: req.params.id });
  return ok(res, { deleted: true }, 'Deleted');
});
