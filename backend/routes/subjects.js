import express from 'express';
import {
  createSubject,
  getAllSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
  enrollSubject,
  getEnrolledSubjects,
  checkEnrollment,
  getSubjectUsersData,
  getSubjectChartData
} from '../controllers/subjectController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/', protect, getAllSubjects);
router.get('/chart-data', protect, adminOnly, getSubjectChartData);
router.get('/users/:subjectName', protect, getSubjectUsersData);
router.get('/enrolled/my-subjects', protect, getEnrolledSubjects);
router.get('/:id', protect, getSubjectById);
router.get('/check-enrollment/:subjectId', protect, checkEnrollment);
router.post('/', protect, adminOnly, (req, res, next) => {
  // Check if the request has a file
  if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
    upload.single('image')(req, res, next);
  } else {
    next();
  }
}, createSubject);
router.post('/enroll', protect, enrollSubject);
router.put('/:id', protect, adminOnly, (req, res, next) => {
  // Check if the request has a file
  if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
    upload.single('image')(req, res, next);
  } else {
    next();
  }
}, updateSubject);
router.delete('/:id', protect, adminOnly, deleteSubject);

export default router;
