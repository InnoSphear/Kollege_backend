import College from '../models/college.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/apiResponse.js';

export const compareColleges = asyncHandler(async (req, res) => {
  const ids = req.body.collegeIds || [];
  const colleges = await College.find({ _id: { $in: ids } });
  const idOrder = new Map(ids.map((id, idx) => [String(id), idx]));

  const table = colleges.map((c) => ({
    id: c._id,
    college: c.name,
    fees: c.feesMax,
    avgPackage: c.avgPackage,
    ranking: c.ranking,
    coursesCount: c.courses?.length || 0,
    infrastructure: c.infrastructure,
    reviews: c.rating,
  }))
    .sort((a, b) => (idOrder.get(String(a.id)) ?? 9999) - (idOrder.get(String(b.id)) ?? 9999));

  return ok(res, table);
});
