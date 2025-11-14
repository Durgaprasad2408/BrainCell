import express from 'express';
import faqController from '../controllers/faqController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', faqController.getAllPublishedFAQs);

router.post('/query', protect, authorize('user'), faqController.createQuery);

router.get('/lesson/:lessonId', faqController.getLessonFAQs);

router.get('/queries', protect, authorize('instructor', 'admin'), faqController.getQueriesForInstructor);

router.put('/answer/:id', protect, authorize('instructor', 'admin'), faqController.answerQuery);

router.delete('/:id', protect, authorize('instructor', 'admin'), faqController.deleteQuery);

router.patch('/publish/:id', protect, authorize('instructor', 'admin'), faqController.togglePublishStatus);

export default router;
