import crypto from 'crypto';
import User from '../models/user.model.js';
import StudentProfile from '../models/studentProfile.model.js';
import CounselorProfile from '../models/counselorProfile.model.js';
import Referral from '../models/referral.model.js';
import Lead from '../models/lead.model.js';
import { ROLES } from '../constants/roles.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/apiResponse.js';
import { signToken } from '../utils/jwt.js';
import { syncReferralFromCode } from '../services/relation.service.js';

export const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password, role, referralCode } = req.body;
  if (![ROLES.STUDENT, ROLES.COUNSELOR].includes(role)) {
    throw new ApiError(403, 'Only student or counselor registration is allowed here');
  }

  const exists = await User.findOne({ $or: [{ email }, { phone }] });
  if (exists) throw new ApiError(409, 'User already exists');

  const user = await User.create({ name, email, phone, password, role });

  if (role === ROLES.STUDENT) {
    await StudentProfile.create({ userId: user._id, referralCodeUsed: referralCode });
    if (referralCode) {
      const counselorProfile = await CounselorProfile.findOne({ referralCode });
      if (counselorProfile) {
        await Referral.create({
          counselorId: counselorProfile.userId,
          studentId: user._id,
          referralCode,
        });
      }
    }
  }

  if (role === ROLES.COUNSELOR) {
    const suffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    const code = `${name.replace(/[^A-Za-z]/g, '').slice(0, 4).toUpperCase() || 'CONS'}${suffix}`;
    await CounselorProfile.create({ userId: user._id, referralCode: code });
  }

  const token = signToken({ userId: user._id, role: user.role });
  return ok(res, { token, user }, 'Registered', 201);
});

export const login = asyncHandler(async (req, res) => {
  const { id, password } = req.body;

  let user = await User.findOne({
    $or: [{ email: id?.toLowerCase() }, { phone: id }],
  });
  if (!user) {
    const profile = await CounselorProfile.findOne({ whatsappNumber: id }).populate('userId');
    if (profile?.userId) user = profile.userId;
  }

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid credentials');
  }

  if (user.role === ROLES.ADMIN_COUNSELOR) {
    const profile = await CounselorProfile.findOne({ userId: user._id });
    if (!profile?.whatsappEnabled) {
      throw new ApiError(403, 'WhatsApp session is not active for this admin counselor');
    }
  }

  const token = signToken({ userId: user._id, role: user.role });
  return ok(res, { token, user }, 'Logged in');
});

export const me = asyncHandler(async (req, res) => ok(res, req.user));

export const myProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  const studentProfile = user.role === ROLES.STUDENT ? await StudentProfile.findOne({ userId: user._id }) : null;
  const counselorProfile = [ROLES.COUNSELOR, ROLES.ADMIN_COUNSELOR].includes(user.role)
    ? await CounselorProfile.findOne({ userId: user._id })
    : null;
  return ok(res, { user, studentProfile, counselorProfile });
});

export const updateMyProfile = asyncHandler(async (req, res) => {
  const allowedUserFields = ['name', 'email', 'phone', 'language'];
  const userPayload = {};
  allowedUserFields.forEach((key) => {
    if (req.body[key] !== undefined) userPayload[key] = req.body[key];
  });

  const user = await User.findByIdAndUpdate(req.user._id, userPayload, { new: true }).select('-password');

  let studentProfile = null;
  let counselorProfile = null;

  if (user.role === ROLES.STUDENT && req.body.studentProfile) {
    const allowedStudentFields = ['marks10', 'marks12', 'preferredCourses', 'preferredCity', 'budget', 'examScores'];
    const studentPayload = {};
    allowedStudentFields.forEach((key) => {
      if (req.body.studentProfile[key] !== undefined) studentPayload[key] = req.body.studentProfile[key];
    });
    studentProfile = await StudentProfile.findOneAndUpdate(
      { userId: user._id },
      studentPayload,
      { new: true, upsert: true }
    );
  }

  if ([ROLES.COUNSELOR, ROLES.ADMIN_COUNSELOR].includes(user.role) && req.body.counselorProfile) {
    const allowedCounselorFields = ['whatsappNumber', 'whatsappEnabled'];
    const counselorPayload = {};
    allowedCounselorFields.forEach((key) => {
      if (req.body.counselorProfile[key] !== undefined) counselorPayload[key] = req.body.counselorProfile[key];
    });
    counselorProfile = await CounselorProfile.findOneAndUpdate(
      { userId: user._id },
      counselorPayload,
      { new: true }
    );
  }

  return ok(res, { user, studentProfile, counselorProfile }, 'Profile updated');
});

export const enrollStudentInterest = asyncHandler(async (req, res) => {
  const { name, email, phone, preferredCourse, preferredCity, budget, referralCode } = req.body;
  if (!name || !phone) throw new ApiError(400, 'name and phone are required');

  const normalizedEmail = email?.toLowerCase() || null;
  let user = await User.findOne({
    $or: [{ phone }, ...(normalizedEmail ? [{ email: normalizedEmail }] : [])],
  });

  if (!user) {
    user = await User.create({
      name,
      email: normalizedEmail,
      phone,
      password: `Enroll@${crypto.randomBytes(4).toString('hex')}`,
      role: ROLES.STUDENT,
    });
  }

  await StudentProfile.findOneAndUpdate(
    { userId: user._id },
    {
      preferredCourses: preferredCourse ? [preferredCourse] : undefined,
      preferredCity: preferredCity ? [preferredCity] : undefined,
      budget: budget ? Number(budget) : undefined,
      referralCodeUsed: referralCode || undefined,
    },
    { upsert: true, new: true }
  );

  if (referralCode) {
    await syncReferralFromCode({ studentId: user._id, referralCode });
  }

  await Lead.create({
    studentId: user._id,
    source: 'homepage_popup',
    status: 'new',
    metadata: { preferredCourse, preferredCity, budget, referralCode },
  });

  return ok(res, { enrolled: true }, 'Enrollment submitted successfully', 201);
});
