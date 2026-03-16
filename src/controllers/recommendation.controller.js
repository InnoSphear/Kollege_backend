import College from '../models/college.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/apiResponse.js';
import { generateRecommendationExplanation } from '../services/ai.service.js';
import { DUMMY_COLLEGES } from '../data/dummyCatalog.js';

const rankCollege = (college, profile) => {
  let score = 0;
  if (profile.locationPreference?.includes(college.state) || profile.locationPreference?.includes(college.city)) score += 25;
  if (profile.budget && college.feesMax && college.feesMax <= profile.budget) score += 20;
  if (college.avgPackage) score += Math.min(30, college.avgPackage / 100000);
  if (college.rating) score += college.rating * 4;
  if (college.ranking) score += Math.max(0, 20 - college.ranking / 20);
  return Number(score.toFixed(2));
};

export const collegePredictor = asyncHandler(async (req, res) => {
  const input = req.body;

  const filter = {};
  if (input.locationPreference?.length) {
    filter.$or = [{ state: { $in: input.locationPreference } }, { city: { $in: input.locationPreference } }];
  }

  let colleges = await College.find(filter).limit(100);
  if (!colleges.length) {
    colleges = await College.find({}).limit(100);
  }

  let rankingSource = colleges;
  if (!rankingSource.length) {
    rankingSource = DUMMY_COLLEGES;
  }

  const ranked = rankingSource
    .map((item) => {
      const score = rankCollege(item, input);
      return {
        college: item,
        modelScore: score,
        admissionProbability: Math.min(95, Math.max(30, Math.round(score + (input.entranceExamScore || 0) / 8))),
        estimatedROI: Number((((item.avgPackage || 1) * 3) / ((item.feesMax || 1) * 4)).toFixed(2)),
      };
    })
    .sort((a, b) => b.modelScore - a.modelScore)
    .slice(0, 10);

  const aiSummary = await generateRecommendationExplanation({ profile: input, ranked }).catch(() => null);
  return ok(res, { input, ranked, aiSummary });
});

export const scholarshipPredictor = asyncHandler(async (req, res) => {
  const score = Number(req.body.marks12 || 0) + Number(req.body.entranceExamScore || 0) / 2;
  const tier = score >= 140 ? 'high' : score >= 100 ? 'medium' : 'basic';
  return ok(res, { eligibilityTier: tier, recommendation: `Focus on ${tier} merit scholarships.` });
});
