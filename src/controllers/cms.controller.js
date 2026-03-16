import CmsSettings from '../models/cmsSettings.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/apiResponse.js';
import { logAudit } from '../services/audit.service.js';

const defaultPayload = {
  key: 'global',
  branding: { siteName: 'KollegeApply+', tagline: 'Find your perfect college match with AI' },
  theme: { primaryColor: '#0f4c81', accentColor: '#10b981', surfaceColor: '#f8fafc' },
  heroSlides: [
    {
      title: 'India?s AI-Powered College Discovery Platform',
      subtitle: 'Compare colleges, predict admissions, track deadlines, and apply smarter.',
      ctaLabel: 'Start Exploring',
      ctaLink: '/colleges',
      imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1400&q=80',
    },
    {
      title: 'Get Personalized Admission Guidance',
      subtitle: 'From exam updates to counseling calls and scholarship predictions.',
      ctaLabel: 'Try College Predictor',
      ctaLink: '/college-predictor',
      imageUrl: 'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1400&q=80',
    },
  ],
  quickLinks: [
    { label: 'College Predictor', link: '/college-predictor' },
    { label: 'Compare Colleges', link: '/compare-colleges' },
    { label: 'Exam Calendar', link: '/exams' },
    { label: 'Scholarships', link: '/scholarships' },
  ],
  homepageSectionOrder: ['topColleges', 'trendingCourses', 'examCalendar', 'scholarships', 'studyAbroad', 'counselingCTA'],
  seoDefaults: {
    title: 'KollegeApply+ | College, Courses, Exams, Scholarships',
    description: 'Discover and compare colleges, courses, exams, scholarships and admissions with AI recommendations.',
  },
};

export const ensureCmsSettings = async () => {
  const current = await CmsSettings.findOne({ key: 'global' });
  if (current) return current;
  return CmsSettings.create(defaultPayload);
};

export const getPublicCms = asyncHandler(async (_req, res) => {
  const settings = await ensureCmsSettings();
  return ok(res, settings);
});

export const getAdminCms = asyncHandler(async (_req, res) => {
  const settings = await ensureCmsSettings();
  return ok(res, settings);
});

export const updateAdminCms = asyncHandler(async (req, res) => {
  const settings = await CmsSettings.findOneAndUpdate({ key: 'global' }, req.body, { new: true, upsert: true });
  await logAudit({ req, action: 'update', resource: 'cms', resourceId: settings._id, changes: req.body });
  return ok(res, settings, 'CMS settings updated');
});
