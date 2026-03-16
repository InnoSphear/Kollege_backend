import crypto from 'crypto';
import User from '../models/user.model.js';
import CounselorProfile from '../models/counselorProfile.model.js';
import CrmContact from '../models/crmContact.model.js';
import CrmMessage from '../models/crmMessage.model.js';
import CrmCallLog from '../models/crmCallLog.model.js';
import CrmWhatsappSession from '../models/crmWhatsappSession.model.js';
import CrmAutomationRule from '../models/crmAutomationRule.model.js';
import { ROLES } from '../constants/roles.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { logAudit } from '../services/audit.service.js';

const parseLimit = (value, fallback = 30) => Math.min(100, Math.max(1, Number(value || fallback)));

const stageBaseScore = {
  hot: 80,
  warm: 55,
  lead: 35,
  converted: 20,
  lost: 5,
};

const computeLeadScore = ({ contact, interactions }) => {
  const base = stageBaseScore[contact.stage] || 20;
  const recencyBoost = contact.lastContactedAt
    ? Math.max(0, 15 - Math.floor((Date.now() - new Date(contact.lastContactedAt).getTime()) / (1000 * 60 * 60 * 24)))
    : 6;
  const revenueBoost = Math.min(25, Math.floor((contact.expectedRevenue || 0) / 10000));
  const interactionBoost = Math.min(20, interactions * 2);
  return Math.max(1, Math.min(100, base + recencyBoost + revenueBoost + interactionBoost));
};

export const createAdminCounselor = asyncHandler(async (req, res) => {
  const { name, phone, email, password, whatsappNumber } = req.body;
  if (!name || !phone || !password || !whatsappNumber) throw new ApiError(400, 'name, phone, password and whatsappNumber are required');

  const exists = await User.findOne({ $or: [{ phone }, ...(email ? [{ email: email.toLowerCase() }] : [])] });
  if (exists) throw new ApiError(409, 'User already exists');

  const user = await User.create({
    name,
    phone,
    email: email?.toLowerCase(),
    password,
    role: ROLES.ADMIN_COUNSELOR,
  });

  const suffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  const referralCode = `${name.replace(/[^A-Za-z]/g, '').slice(0, 4).toUpperCase() || 'CONS'}${suffix}`;

  await CounselorProfile.create({
    userId: user._id,
    referralCode,
    whatsappNumber,
    whatsappEnabled: true,
    isAdminCounselor: true,
  });

  await CrmWhatsappSession.create({
    counselorId: user._id,
    whatsappNumber,
    status: 'active',
    lastActiveAt: new Date(),
  });

  await logAudit({
    req,
    action: 'create',
    resource: 'admin_counselor',
    resourceId: user._id,
    changes: { name, phone, email: email?.toLowerCase(), whatsappNumber },
  });

  return ok(res, { user }, 'Admin counselor created', 201);
});

export const createCrmContact = asyncHandler(async (req, res) => {
  const counselorId = req.user.role === ROLES.PLATFORM_ADMIN ? req.body.counselorId : req.user._id;
  if (!counselorId) throw new ApiError(400, 'counselorId is required');
  const created = await CrmContact.create({ ...req.body, counselorId });
  return ok(res, created, 'Contact created', 201);
});

export const listMyCrmContacts = asyncHandler(async (req, res) => {
  const counselorId = req.user.role === ROLES.PLATFORM_ADMIN ? req.query.counselorId : req.user._id;
  const limit = parseLimit(req.query.limit, 50);
  const query = counselorId ? { counselorId } : {};
  if (req.query.q) query.$text = { $search: req.query.q };
  const items = await CrmContact.find(query).sort({ createdAt: -1 }).limit(limit);
  return ok(res, items);
});

export const logCrmMessage = asyncHandler(async (req, res) => {
  const counselorId = req.user.role === ROLES.PLATFORM_ADMIN ? req.body.counselorId : req.user._id;
  const created = await CrmMessage.create({ ...req.body, counselorId });

  await CrmWhatsappSession.findOneAndUpdate(
    { counselorId },
    { $inc: { messagesSent: 1 }, $set: { lastActiveAt: new Date() } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return ok(res, created, 'Message logged', 201);
});

export const listMyCrmMessages = asyncHandler(async (req, res) => {
  const counselorId = req.user.role === ROLES.PLATFORM_ADMIN ? req.query.counselorId : req.user._id;
  const limit = parseLimit(req.query.limit, 50);
  const query = counselorId ? { counselorId } : {};
  const items = await CrmMessage.find(query).populate('contactId', 'name phone').sort({ createdAt: -1 }).limit(limit);
  return ok(res, items);
});

export const logCrmCall = asyncHandler(async (req, res) => {
  const counselorId = req.user.role === ROLES.PLATFORM_ADMIN ? req.body.counselorId : req.user._id;
  const created = await CrmCallLog.create({ ...req.body, counselorId });

  await CrmWhatsappSession.findOneAndUpdate(
    { counselorId },
    { $inc: { callsLogged: 1 }, $set: { lastActiveAt: new Date() } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return ok(res, created, 'Call log saved', 201);
});

export const listMyCrmCalls = asyncHandler(async (req, res) => {
  const counselorId = req.user.role === ROLES.PLATFORM_ADMIN ? req.query.counselorId : req.user._id;
  const limit = parseLimit(req.query.limit, 50);
  const query = counselorId ? { counselorId } : {};
  const items = await CrmCallLog.find(query).populate('contactId', 'name phone').sort({ createdAt: -1 }).limit(limit);
  return ok(res, items);
});

export const upsertMyWhatsappSession = asyncHandler(async (req, res) => {
  const counselorId = req.user.role === ROLES.PLATFORM_ADMIN ? req.body.counselorId : req.user._id;
  const { whatsappNumber, status } = req.body;
  if (!whatsappNumber) throw new ApiError(400, 'whatsappNumber is required');

  const session = await CrmWhatsappSession.findOneAndUpdate(
    { counselorId },
    { whatsappNumber, status: status || 'active', lastActiveAt: new Date() },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await CounselorProfile.findOneAndUpdate(
    { userId: counselorId },
    { whatsappNumber, whatsappEnabled: status !== 'disconnected', isAdminCounselor: true },
    { new: true }
  );

  return ok(res, session, 'WhatsApp session updated');
});

export const myCrmDashboard = asyncHandler(async (req, res) => {
  const counselorId = req.user._id;
  const [contacts, messages, calls, session, latestContacts, latestMessages, latestCalls, allContacts] = await Promise.all([
    CrmContact.countDocuments({ counselorId }),
    CrmMessage.countDocuments({ counselorId }),
    CrmCallLog.countDocuments({ counselorId }),
    CrmWhatsappSession.findOne({ counselorId }),
    CrmContact.find({ counselorId }).sort({ createdAt: -1 }).limit(5),
    CrmMessage.find({ counselorId }).populate('contactId', 'name phone').sort({ createdAt: -1 }).limit(5),
    CrmCallLog.find({ counselorId }).populate('contactId', 'name phone').sort({ createdAt: -1 }).limit(5),
    CrmContact.find({ counselorId }).sort({ updatedAt: -1 }).limit(30),
  ]);

  const interactions = await CrmMessage.aggregate([
    { $match: { counselorId } },
    { $group: { _id: '$contactId', count: { $sum: 1 } } },
  ]);
  const callsAgg = await CrmCallLog.aggregate([
    { $match: { counselorId } },
    { $group: { _id: '$contactId', count: { $sum: 1 } } },
  ]);
  const interactionMap = new Map();
  interactions.forEach((row) => interactionMap.set(String(row._id), (interactionMap.get(String(row._id)) || 0) + row.count));
  callsAgg.forEach((row) => interactionMap.set(String(row._id), (interactionMap.get(String(row._id)) || 0) + row.count));

  const prioritizedLeads = allContacts
    .map((contact) => ({
      contact,
      aiPriorityScore: computeLeadScore({ contact, interactions: interactionMap.get(String(contact._id)) || 0 }),
      interactionCount: interactionMap.get(String(contact._id)) || 0,
    }))
    .sort((a, b) => b.aiPriorityScore - a.aiPriorityScore)
    .slice(0, 8);

  return ok(res, { metrics: { contacts, messages, calls }, session, latestContacts, latestMessages, latestCalls, prioritizedLeads });
});

export const prioritizedLeads = asyncHandler(async (req, res) => {
  const counselorId = req.user.role === ROLES.PLATFORM_ADMIN ? req.query.counselorId : req.user._id;
  if (!counselorId) throw new ApiError(400, 'counselorId is required');
  const limit = parseLimit(req.query.limit, 20);

  const [contacts, messagesAgg, callsAgg] = await Promise.all([
    CrmContact.find({ counselorId }).limit(200),
    CrmMessage.aggregate([{ $match: { counselorId } }, { $group: { _id: '$contactId', count: { $sum: 1 } } }]),
    CrmCallLog.aggregate([{ $match: { counselorId } }, { $group: { _id: '$contactId', count: { $sum: 1 } } }]),
  ]);

  const interactionMap = new Map();
  messagesAgg.forEach((row) => interactionMap.set(String(row._id), (interactionMap.get(String(row._id)) || 0) + row.count));
  callsAgg.forEach((row) => interactionMap.set(String(row._id), (interactionMap.get(String(row._id)) || 0) + row.count));

  const items = contacts
    .map((contact) => ({
      contact,
      aiPriorityScore: computeLeadScore({ contact, interactions: interactionMap.get(String(contact._id)) || 0 }),
      interactionCount: interactionMap.get(String(contact._id)) || 0,
    }))
    .sort((a, b) => b.aiPriorityScore - a.aiPriorityScore)
    .slice(0, limit);

  return ok(res, items);
});

export const superadminCrmUsage = asyncHandler(async (_req, res) => {
  const counselors = await User.find({ role: ROLES.ADMIN_COUNSELOR }).select('name phone email createdAt');
  const counselorIds = counselors.map((c) => c._id);

  const [contactAgg, msgAgg, callAgg, sessions, profiles, globalRules] = await Promise.all([
    CrmContact.aggregate([{ $match: { counselorId: { $in: counselorIds } } }, { $group: { _id: '$counselorId', total: { $sum: 1 } } }]),
    CrmMessage.aggregate([{ $match: { counselorId: { $in: counselorIds } } }, { $group: { _id: '$counselorId', total: { $sum: 1 } } }]),
    CrmCallLog.aggregate([{ $match: { counselorId: { $in: counselorIds } } }, { $group: { _id: '$counselorId', total: { $sum: 1 } } }]),
    CrmWhatsappSession.find({ counselorId: { $in: counselorIds } }),
    CounselorProfile.find({ userId: { $in: counselorIds } }).select('userId referralCode whatsappNumber whatsappEnabled'),
    CrmAutomationRule.find({ isGlobal: true, isActive: true }).sort({ createdAt: -1 }),
  ]);

  const mapFromAgg = (rows) => new Map(rows.map((r) => [String(r._id), r.total]));
  const contactsMap = mapFromAgg(contactAgg);
  const msgMap = mapFromAgg(msgAgg);
  const callMap = mapFromAgg(callAgg);
  const sessionMap = new Map(sessions.map((s) => [String(s.counselorId), s]));
  const profileMap = new Map(profiles.map((p) => [String(p.userId), p]));

  const usage = counselors.map((c) => ({
    counselor: c,
    profile: profileMap.get(String(c._id)) || null,
    whatsappSession: sessionMap.get(String(c._id)) || null,
    contacts: contactsMap.get(String(c._id)) || 0,
    messages: msgMap.get(String(c._id)) || 0,
    calls: callMap.get(String(c._id)) || 0,
  }));

  return ok(res, { usage, globalRules });
});
