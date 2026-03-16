import { Router } from 'express';
import {
  getCollegeBySlug,
  getCourseBySlug,
  getExamBySlug,
  getScholarshipBySlug,
  listBlogPosts,
  listColleges,
  listCourses,
  listExams,
  listOnlineCourses,
  listScholarships,
} from '../../controllers/catalog.controller.js';

const router = Router();

router.get('/colleges', listColleges);
router.get('/colleges/:slug', getCollegeBySlug);
router.get('/courses', listCourses);
router.get('/courses/:slug', getCourseBySlug);
router.get('/exams', listExams);
router.get('/exams/:slug', getExamBySlug);
router.get('/scholarships', listScholarships);
router.get('/scholarships/:slug', getScholarshipBySlug);
router.get('/online-courses', listOnlineCourses);
router.get('/blog-posts', listBlogPosts);

export default router;
