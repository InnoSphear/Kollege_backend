import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { getImageKitClient } from '../config/imagekit.js';
import College from '../models/college.model.js';
import { initSearchIndexes, upsertCollegesToIndex } from '../services/search.service.js';
import { logAudit } from '../services/audit.service.js';

export const imagekitAuth = asyncHandler(async (_req, res) => {
  const imagekit = getImageKitClient();
  if (!imagekit) throw new ApiError(400, 'ImageKit is not configured');

  const authParams = imagekit.getAuthenticationParameters();
  return ok(res, authParams);
});

export const reindexColleges = asyncHandler(async (_req, res) => {
  await initSearchIndexes();

  const colleges = await College.find({}).lean();
  const docs = colleges.map((c) => ({
    _id: String(c._id),
    name: c.name,
    city: c.city,
    state: c.state,
    country: c.country,
    overview: c.overview,
    examsAccepted: c.examsAccepted,
    feesMax: c.feesMax,
    ranking: c.ranking,
    avgPackage: c.avgPackage,
    rating: c.rating,
  }));

  await upsertCollegesToIndex(docs);
  await logAudit({ req: _req, action: 'reindex', resource: 'search_colleges', changes: { indexed: docs.length } });
  return ok(res, { indexed: docs.length }, 'College search index refreshed');
});

export const uploadImage = asyncHandler(async (req, res) => {
  const imagekit = getImageKitClient();
  if (!imagekit) throw new ApiError(400, 'ImageKit is not configured');
  if (!req.file) throw new ApiError(400, 'file is required');

  const uploadResponse = await imagekit.upload({
    file: req.file.buffer,
    fileName: req.file.originalname,
    folder: req.body.folder || '/kollege/cms',
    useUniqueFileName: true,
  });

  await logAudit({
    req,
    action: 'upload',
    resource: 'imagekit_asset',
    resourceId: uploadResponse.fileId,
    changes: { url: uploadResponse.url, folder: req.body.folder || '/kollege/cms' },
  });

  return ok(res, { url: uploadResponse.url, fileId: uploadResponse.fileId }, 'Image uploaded');
});
