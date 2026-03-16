import mongoose from 'mongoose';

const heroSlideSchema = new mongoose.Schema(
  {
    title: String,
    subtitle: String,
    ctaLabel: String,
    ctaLink: String,
    imageUrl: String,
  },
  { _id: false }
);

const cmsSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, default: 'global' },
    branding: {
      siteName: { type: String, default: 'KollegeApply+' },
      tagline: { type: String, default: 'AI-first admissions platform' },
      logoUrl: String,
    },
    theme: {
      primaryColor: { type: String, default: '#0f4c81' },
      accentColor: { type: String, default: '#10b981' },
      surfaceColor: { type: String, default: '#f8fafc' },
    },
    heroSlides: { type: [heroSlideSchema], default: [] },
    homepageSections: {
      showTopColleges: { type: Boolean, default: true },
      showTrendingCourses: { type: Boolean, default: true },
      showExamCalendar: { type: Boolean, default: true },
      showScholarships: { type: Boolean, default: true },
      showStudyAbroad: { type: Boolean, default: true },
      showCounselingCTA: { type: Boolean, default: true },
    },
    homepageSectionOrder: {
      type: [String],
      default: ['topColleges', 'trendingCourses', 'examCalendar', 'scholarships', 'studyAbroad', 'counselingCTA'],
    },
    quickLinks: [
      {
        label: String,
        link: String,
      },
    ],
    seoDefaults: {
      title: String,
      description: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model('CmsSettings', cmsSettingsSchema);
