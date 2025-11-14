import express from 'express';
import {
  createResource,
  getAllResources,
  getPublishedResources,
  updateResource,
  deleteResource,
  getResourceStats,
  incrementEngagement,
  getDownloadUrl,
  getInstructorResourceStats
} from '../controllers/resourceController.js';
import { protect, adminOnly, instructorOnly } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/', getPublishedResources);

// Admin and Instructor routes
router.post('/', protect, instructorOnly, upload.single('file'), createResource);
router.get('/all', protect, instructorOnly, getAllResources);
router.put('/:id', protect, instructorOnly, updateResource);
router.delete('/:id', protect, instructorOnly, deleteResource);

// Public routes for students
router.get('/published', getPublishedResources);
router.post('/:id/engagement', protect, incrementEngagement);
router.get('/:id/download', protect, getDownloadUrl);

// Stats routes
router.get('/stats', protect, adminOnly, getResourceStats);
router.get('/instructor/stats', protect, instructorOnly, getInstructorResourceStats);

export default router;