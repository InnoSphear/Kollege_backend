import College from '../models/college.model.js';
import Course from '../models/course.model.js';
import Exam from '../models/exam.model.js';
import Scholarship from '../models/scholarship.model.js';
import OnlineCourse from '../models/onlineCourse.model.js';
import BlogPost from '../models/blogPost.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/apiResponse.js';
import { withCache } from '../services/cache.service.js';
import { searchCollegesIndex } from '../services/search.service.js';
import {
  DUMMY_BLOG_POSTS,
  DUMMY_COLLEGES,
  DUMMY_COURSES,
  DUMMY_EXAMS,
  DUMMY_ONLINE_COURSES,
  DUMMY_SCHOLARSHIPS,
} from '../data/dummyCatalog.js';

const paginate = (query) => {
  const page = Math.max(1, Number(query.page || 1));
  const limit = Math.min(100, Math.max(1, Number(query.limit || 20)));
  return { page, limit, skip: (page - 1) * limit };
};

const slicePaginated = ({ items, page, limit }) => {
  const start = (page - 1) * limit;
  return {
    items: items.slice(start, start + limit),
    pagination: { page, limit, total: items.length },
  };
};

export const listColleges = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const totalInCollection = await College.countDocuments({});
  if (totalInCollection === 0) {
    let items = [...DUMMY_COLLEGES];
    if (req.query.q) {
      const q = String(req.query.q).toLowerCase();
      items = items.filter((c) => `${c.name} ${c.city} ${c.state} ${c.country}`.toLowerCase().includes(q));
    }
    if (req.query.city) items = items.filter((c) => c.city === req.query.city);
    if (req.query.state) items = items.filter((c) => c.state === req.query.state);
    if (req.query.country) items = items.filter((c) => c.country === req.query.country);
    if (req.query.exam) items = items.filter((c) => c.examsAccepted?.includes(req.query.exam));
    if (req.query.maxFees) items = items.filter((c) => (c.feesMax || 0) <= Number(req.query.maxFees));
    if (req.query.minFees) items = items.filter((c) => (c.feesMax || 0) >= Number(req.query.minFees));
    if (req.query.ranking) items = items.filter((c) => (c.ranking || 9999) <= Number(req.query.ranking));
    if (req.query.minPackage) items = items.filter((c) => (c.avgPackage || 0) >= Number(req.query.minPackage));
    return ok(res, slicePaginated({ items, page, limit }));
  }

  const filter = {};
  const cacheKey = `catalog:colleges:${JSON.stringify(req.query)}`;

  if (req.query.city) filter.city = req.query.city;
  if (req.query.state) filter.state = req.query.state;
  if (req.query.country) filter.country = req.query.country;
  if (req.query.exam) filter.examsAccepted = req.query.exam;
  if (req.query.minFees || req.query.maxFees) {
    filter.feesMax = {};
    if (req.query.minFees) filter.feesMax.$gte = Number(req.query.minFees);
    if (req.query.maxFees) filter.feesMax.$lte = Number(req.query.maxFees);
  }
  if (req.query.ranking) filter.ranking = { $lte: Number(req.query.ranking) };
  if (req.query.minPackage) filter.avgPackage = { $gte: Number(req.query.minPackage) };
  if (req.query.q) filter.$text = { $search: req.query.q };

  const data = await withCache(cacheKey, 60, async () => {
    if (req.query.q) {
      const searchResult = await searchCollegesIndex(req.query.q, {
        filter: [
          req.query.city ? `city = "${req.query.city}"` : null,
          req.query.state ? `state = "${req.query.state}"` : null,
          req.query.country ? `country = "${req.query.country}"` : null,
        ].filter(Boolean),
        hitsPerPage: limit,
        page,
      }).catch(() => null);

      if (searchResult?.hits) {
        const ids = searchResult.hits.map((hit) => hit._id);
        const docs = await College.find({ _id: { $in: ids } }).populate('courses', 'name slug stream');
        const orderMap = new Map(ids.map((id, idx) => [String(id), idx]));
        docs.sort((a, b) => (orderMap.get(String(a._id)) ?? 9999) - (orderMap.get(String(b._id)) ?? 9999));
        return { items: docs, pagination: { page, limit, total: searchResult.estimatedTotalHits || docs.length } };
      }
    }

    const [items, total] = await Promise.all([
      College.find(filter).populate('courses', 'name slug stream').sort({ rating: -1 }).skip(skip).limit(limit),
      College.countDocuments(filter),
    ]);
    return { items, pagination: { page, limit, total } };
  });

  return ok(res, data);
});

export const getCollegeBySlug = asyncHandler(async (req, res) => {
  const totalInCollection = await College.countDocuments({});
  if (totalInCollection === 0) {
    const item = DUMMY_COLLEGES.find((college) => college.slug === req.params.slug) || null;
    return ok(res, item);
  }
  const item = await College.findOne({ slug: req.params.slug }).populate('courses');
  return ok(res, item);
});

export const listCourses = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const totalInCollection = await Course.countDocuments({});
  if (totalInCollection === 0) {
    let items = [...DUMMY_COURSES];
    if (req.query.stream) items = items.filter((item) => item.stream === req.query.stream);
    if (req.query.q) {
      const q = String(req.query.q).toLowerCase();
      items = items.filter((item) => `${item.name} ${item.stream} ${item.eligibility}`.toLowerCase().includes(q));
    }
    return ok(res, slicePaginated({ items, page, limit }));
  }

  const filter = {};
  if (req.query.stream) filter.stream = req.query.stream;
  if (req.query.q) filter.$text = { $search: req.query.q };

  const [items, total] = await Promise.all([
    Course.find(filter).populate('topColleges', 'name slug city state').skip(skip).limit(limit),
    Course.countDocuments(filter),
  ]);

  return ok(res, { items, pagination: { page, limit, total } });
});

export const getCourseBySlug = asyncHandler(async (req, res) => {
  const totalInCollection = await Course.countDocuments({});
  if (totalInCollection === 0) {
    const item = DUMMY_COURSES.find((course) => course.slug === req.params.slug) || null;
    return ok(res, item);
  }
  const item = await Course.findOne({ slug: req.params.slug }).populate('topColleges', 'name slug city state rating ranking');
  return ok(res, item);
});

export const listExams = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const totalInCollection = await Exam.countDocuments({});
  if (totalInCollection === 0) {
    let items = [...DUMMY_EXAMS];
    if (req.query.q) {
      const q = String(req.query.q).toLowerCase();
      items = items.filter((item) => `${item.name} ${item.code} ${item.pattern}`.toLowerCase().includes(q));
    }
    return ok(res, slicePaginated({ items, page, limit }));
  }

  const filter = req.query.q ? { $text: { $search: req.query.q } } : {};

  const [items, total] = await Promise.all([
    Exam.find(filter).skip(skip).limit(limit),
    Exam.countDocuments(filter),
  ]);
  return ok(res, { items, pagination: { page, limit, total } });
});

export const getExamBySlug = asyncHandler(async (req, res) => {
  const totalInCollection = await Exam.countDocuments({});
  if (totalInCollection === 0) {
    const item = DUMMY_EXAMS.find((exam) => exam.slug === req.params.slug) || null;
    return ok(res, item);
  }
  const item = await Exam.findOne({ slug: req.params.slug });
  return ok(res, item);
});

export const listScholarships = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const totalInCollection = await Scholarship.countDocuments({});
  if (totalInCollection === 0) {
    let items = [...DUMMY_SCHOLARSHIPS];
    if (req.query.q) {
      const q = String(req.query.q).toLowerCase();
      items = items.filter((item) => `${item.name} ${item.provider} ${item.eligibility}`.toLowerCase().includes(q));
    }
    return ok(res, slicePaginated({ items, page, limit }));
  }

  const filter = req.query.q ? { $text: { $search: req.query.q } } : {};

  const [items, total] = await Promise.all([
    Scholarship.find(filter).sort({ applicationDeadline: 1 }).skip(skip).limit(limit),
    Scholarship.countDocuments(filter),
  ]);
  return ok(res, { items, pagination: { page, limit, total } });
});

export const getScholarshipBySlug = asyncHandler(async (req, res) => {
  const totalInCollection = await Scholarship.countDocuments({});
  if (totalInCollection === 0) {
    const item = DUMMY_SCHOLARSHIPS.find((scholarship) => scholarship.slug === req.params.slug) || null;
    return ok(res, item);
  }
  const item = await Scholarship.findOne({ slug: req.params.slug });
  return ok(res, item);
});

export const listOnlineCourses = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const totalInCollection = await OnlineCourse.countDocuments({});
  if (totalInCollection === 0) {
    let items = [...DUMMY_ONLINE_COURSES];
    if (req.query.q) {
      const q = String(req.query.q).toLowerCase();
      items = items.filter((item) => `${item.title} ${item.provider}`.toLowerCase().includes(q));
    }
    return ok(res, slicePaginated({ items, page, limit }));
  }

  const filter = req.query.q ? { $text: { $search: req.query.q } } : {};

  const [items, total] = await Promise.all([
    OnlineCourse.find(filter).skip(skip).limit(limit),
    OnlineCourse.countDocuments(filter),
  ]);

  return ok(res, { items, pagination: { page, limit, total } });
});

export const listBlogPosts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const totalInCollection = await BlogPost.countDocuments({ isPublished: true });

  if (totalInCollection === 0) {
    let items = [...DUMMY_BLOG_POSTS];
    if (req.query.q) {
      const q = String(req.query.q).toLowerCase();
      items = items.filter((item) => `${item.title} ${item.content}`.toLowerCase().includes(q));
    }
    return ok(res, slicePaginated({ items, page, limit }));
  }

  const query = { isPublished: true };
  if (req.query.language) query.language = req.query.language;
  if (req.query.q) query.title = { $regex: req.query.q, $options: 'i' };

  const [items, total] = await Promise.all([
    BlogPost.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    BlogPost.countDocuments(query),
  ]);
  return ok(res, { items, pagination: { page, limit, total } });
});
