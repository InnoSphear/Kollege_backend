export const DUMMY_COLLEGES = [
  {
    _id: '000000000000000000000101',
    name: 'National Institute of Technology Delhi',
    slug: 'nit-delhi',
    city: 'Delhi',
    state: 'Delhi',
    country: 'India',
    overview: 'Leading engineering institute with strong placements and modern labs.',
    feesMax: 225000,
    avgPackage: 1550000,
    ranking: 18,
    rating: 4.5,
    examsAccepted: ['JEE Main'],
    courses: [],
  },
  {
    _id: '000000000000000000000102',
    name: 'Institute of Management Ahmedabad',
    slug: 'iima',
    city: 'Ahmedabad',
    state: 'Gujarat',
    country: 'India',
    overview: 'Premier MBA institute with top recruiters and global exposure.',
    feesMax: 3200000,
    avgPackage: 3400000,
    ranking: 1,
    rating: 4.9,
    examsAccepted: ['CAT'],
    courses: [],
  },
  {
    _id: '000000000000000000000103',
    name: 'All India Medical Sciences Institute',
    slug: 'aims-delhi',
    city: 'Delhi',
    state: 'Delhi',
    country: 'India',
    overview: 'Top-tier medical education and research ecosystem.',
    feesMax: 120000,
    avgPackage: 2200000,
    ranking: 3,
    rating: 4.8,
    examsAccepted: ['NEET'],
    courses: [],
  },
];

export const DUMMY_COURSES = [
  {
    _id: '000000000000000000000201',
    name: 'B.Tech Computer Science',
    slug: 'btech-cse',
    stream: 'Engineering',
    duration: '4 Years',
    eligibility: '10+2 with PCM and entrance exam score',
    averageSalary: 1200000,
    requiredExams: ['JEE Main'],
    topColleges: [],
  },
  {
    _id: '000000000000000000000202',
    name: 'MBA',
    slug: 'mba',
    stream: 'MBA',
    duration: '2 Years',
    eligibility: 'Graduate degree with entrance score',
    averageSalary: 1500000,
    requiredExams: ['CAT', 'XAT'],
    topColleges: [],
  },
];

export const DUMMY_EXAMS = [
  {
    _id: '000000000000000000000301',
    name: 'JEE Main',
    slug: 'jee-main',
    code: 'JEE-M',
    pattern: 'Computer-based MCQ exam for engineering admissions.',
    eligibility: '10+2 with Physics, Chemistry, Mathematics',
  },
  {
    _id: '000000000000000000000302',
    name: 'NEET UG',
    slug: 'neet-ug',
    code: 'NEET',
    pattern: 'National level medical entrance exam.',
    eligibility: '10+2 with Physics, Chemistry, Biology',
  },
];

export const DUMMY_SCHOLARSHIPS = [
  {
    _id: '000000000000000000000401',
    name: 'Merit Excellence Scholarship',
    slug: 'merit-excellence-scholarship',
    provider: 'National Scholarship Board',
    amount: 150000,
    eligibility: 'High academic score and income criteria',
    applicationLink: 'https://example.org/scholarship/merit',
  },
  {
    _id: '000000000000000000000402',
    name: 'STEM Future Grant',
    slug: 'stem-future-grant',
    provider: 'STEM Education Foundation',
    amount: 200000,
    eligibility: 'Engineering aspirants with strong entrance performance',
    applicationLink: 'https://example.org/scholarship/stem',
  },
];

export const DUMMY_ONLINE_COURSES = [
  {
    _id: '000000000000000000000501',
    title: 'Data Structures and Algorithms Bootcamp',
    provider: 'KollegeApply Learn',
    duration: '12 Weeks',
  },
  {
    _id: '000000000000000000000502',
    title: 'CAT Quant Masterclass',
    provider: 'KollegeApply Learn',
    duration: '8 Weeks',
  },
];

export const DUMMY_BLOG_POSTS = [
  {
    _id: '000000000000000000000601',
    title: 'How to Build a Strong College Application Profile',
    slug: 'strong-college-application-profile',
    content: 'Focus on academics, projects, leadership, and clarity of goals.',
    language: 'en',
    isPublished: true,
  },
  {
    _id: '000000000000000000000602',
    title: 'JEE Preparation Strategy for Last 90 Days',
    slug: 'jee-90-day-strategy',
    content: 'Use revision cycles, mock analysis, and weak-topic correction.',
    language: 'en',
    isPublished: true,
  },
];
