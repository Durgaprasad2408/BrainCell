import express from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  createFaculty,
  getAllUsers,
  updateUser,
  deleteUser,
  uploadProfilePicture,
  deleteProfilePicture,
  getUserChartData,
} from '../controllers/authController.js';
import { protect, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login
);

router.post('/logout', logout);
router.get('/', protect, getMe);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/profile/avatar', protect, upload.single('avatar'), uploadProfilePicture);
router.delete('/profile/avatar', protect, deleteProfilePicture);

router.post(
  '/faculty',
  protect,
  authorize('admin'),
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('subjects').isArray({ min: 1 }).withMessage('At least one subject is required'),
  ],
  createFaculty
);

router.get('/users', protect, authorize('admin'), getAllUsers);
router.get('/users/chart-data', protect, authorize('admin'), getUserChartData);
router.put('/users/:id', protect, authorize('admin'), updateUser);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

export default router;
