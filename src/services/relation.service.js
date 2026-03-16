import College from '../models/college.model.js';
import Course from '../models/course.model.js';
import Referral from '../models/referral.model.js';

export const syncCollegeCourseLinks = async ({ resource, entity }) => {
  if (!entity) return;

  if (resource === 'courses') {
    const collegeIds = (entity.topColleges || []).map((id) => String(id));
    await College.updateMany({ courses: entity._id, _id: { $nin: collegeIds } }, { $pull: { courses: entity._id } });
    if (collegeIds.length) await College.updateMany({ _id: { $in: collegeIds } }, { $addToSet: { courses: entity._id } });
  }

  if (resource === 'colleges') {
    const courseIds = (entity.courses || []).map((id) => String(id));
    await Course.updateMany({ topColleges: entity._id, _id: { $nin: courseIds } }, { $pull: { topColleges: entity._id } });
    if (courseIds.length) await Course.updateMany({ _id: { $in: courseIds } }, { $addToSet: { topColleges: entity._id } });
  }
};

export const syncReferralFromCode = async ({ studentId, referralCode }) => {
  if (!studentId || !referralCode) return null;
  const counselorProfile = await (await import('../models/counselorProfile.model.js')).default.findOne({ referralCode });
  if (!counselorProfile) return null;

  const referral = await Referral.findOneAndUpdate(
    { studentId, counselorId: counselorProfile.userId },
    { referralCode, status: 'registered' },
    { upsert: true, new: true }
  );

  return referral;
};
