import CounselorProfile from '../models/counselorProfile.model.js';
import Referral from '../models/referral.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/apiResponse.js';

export const myReferralDashboard = asyncHandler(async (req, res) => {
  const profile = await CounselorProfile.findOne({ userId: req.user._id });
  const referrals = await Referral.find({ counselorId: req.user._id }).populate('studentId', 'name phone email');

  const stats = {
    referrals: referrals.length,
    registered: referrals.filter((r) => r.status === 'registered').length,
    applied: referrals.filter((r) => r.status === 'applied').length,
    admitted: referrals.filter((r) => r.status === 'admitted').length,
    pending: referrals.filter((r) => r.commissionStatus === 'pending').reduce((a, b) => a + b.commissionAmount, 0),
    approved: referrals.filter((r) => r.commissionStatus === 'approved').reduce((a, b) => a + b.commissionAmount, 0),
    paid: referrals.filter((r) => r.commissionStatus === 'paid').reduce((a, b) => a + b.commissionAmount, 0),
  };

  return ok(res, { profile, referralLink: `site.com/register?ref=${profile?.referralCode || ''}`, stats, referrals });
});
