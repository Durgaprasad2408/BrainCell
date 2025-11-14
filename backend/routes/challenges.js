import express from 'express';
import {
  createChallenge,
  getAllChallenges,
  getInstructorChallenges,
  getPublishedChallenges,
  getChallengeById,
  updateChallenge,
  deleteChallenge,
  getChallengeStats,
  submitChallenge,
  getUserSubmission,
  checkUserSubmission,
  getChallengeLeaderboard,
  getInstructorChallengeStats,
  getStudentStats,
  getStudentRecentScores,
  getStudentAchievements,
  getChallengeChartData,
  getChallengeMetrics
} from '../controllers/challengeController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', protect, authorize('admin', 'instructor'), getChallengeStats);
router.get('/chart-data', protect, authorize('admin'), getChallengeChartData);
router.get('/stats/instructor', protect, authorize('instructor'), getInstructorChallengeStats);
router.get('/stats/student', protect, authorize('user'), getStudentStats);
router.get('/student/recent-scores', protect, authorize('user'), getStudentRecentScores);
router.get('/student/achievements', protect, authorize('user'), getStudentAchievements);
router.get('/published', getPublishedChallenges);
router.get('/instructor', protect, authorize('instructor'), getInstructorChallenges);
router.get('/', protect, authorize('admin', 'instructor'), getAllChallenges);
router.get('/:challengeId/submission', protect, getUserSubmission);
router.get('/:challengeId/check-submission', protect, checkUserSubmission);
router.get('/:challengeId/leaderboard', getChallengeLeaderboard);
router.get('/:challengeId/metrics', protect, authorize('admin', 'instructor'), getChallengeMetrics);
router.get('/:id', getChallengeById);

router.post('/submit', protect, submitChallenge);

router.post(
  '/',
  protect,
  authorize('admin', 'instructor'),
  createChallenge
);

router.put(
  '/:id',
  protect,
  authorize('admin', 'instructor'),
  updateChallenge
);

router.delete(
  '/:id',
  protect,
  authorize('admin', 'instructor'),
  deleteChallenge
);

export default router;
