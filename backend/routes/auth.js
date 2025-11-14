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
    body('email').isEmail().custom((value) => {
      if (!value.endsWith('@gmrit.edu.in')) {
        throw new Error('Only emails with @gmrit.edu.in domain are allowed to register');
      }
      return true;
    }).withMessage('Please provide a valid email with "gmrit.edu.in" extension'),
    body('password')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      .withMessage('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  ],
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email with "gmrit.edu.in" extension'),
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
    body('email').isEmail().custom((value) => {
      if (!value.endsWith('@gmrit.edu.in')) {
        throw new Error('Only emails with @gmrit.edu.in domain are allowed');
      }
      return true;
    }).withMessage('Please provide a valid email with "gmrit.edu.in" extension'),
    body('password')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      .withMessage('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    body('subjects').isArray({ min: 1 }).withMessage('At least one subject is required'),
  ],
  createFaculty
);

router.get('/users', protect, authorize('admin'), getAllUsers);
router.get('/users/chart-data', protect, authorize('admin'), getUserChartData);
router.put('/users/:id', protect, authorize('admin'), updateUser);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

export default router;
