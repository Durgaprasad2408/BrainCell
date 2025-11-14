import express from 'express';
import {
  createLesson,
  getAllLessons,
  getLessonById,
  updateLesson,
  deleteLesson,
  uploadCardImages,
  uploadVideo,
  updateLessonOrder,
  getInstructorStats,
  getLessonStats
} from '../controllers/lessonController.js';
import { protect, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/', getAllLessons);
router.get('/:id', getLessonById);
router.get('/stats/instructor', protect, authorize('instructor'), getInstructorStats);
router.get('/stats', getLessonStats);

router.post(
  '/',
  protect,
  authorize('admin', 'instructor'),
  createLesson
);

router.post(
  '/upload-images',
  protect,
  authorize('admin', 'instructor'),
  upload.array('images', 10),
  uploadCardImages
);

router.post(
  '/upload-video',
  protect,
  authorize('admin', 'instructor'),
  upload.single('video'),
  uploadVideo
);

router.put(
  '/:id',
  protect,
  authorize('admin', 'instructor'),
  updateLesson
);

router.put(
  '/reorder',
  protect,
  authorize('admin', 'instructor'),
  updateLessonOrder
);

router.delete(
  '/:id',
  protect,
  authorize('admin', 'instructor'),
  deleteLesson
);

export default router;
