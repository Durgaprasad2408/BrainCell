import Challenge from '../models/Challenge.js';
import ChallengeSubmission from '../models/ChallengeSubmission.js';

export const createChallenge = async (req, res) => {
  try {
    // --- UPDATED: Destructure new fields ---
    const { 
      title, category, difficulty, points, description, 
      startDateTime, endDateTime, // Replaced 4 old fields
      questions, status, numberOfQuestions 
    } = req.body;

    // --- UPDATED: Validation ---
    if (!title || !category || !difficulty || !points || !description || 
        !startDateTime || !endDateTime || // Replaced 4 old fields
        !questions || questions.length === 0 || !numberOfQuestions) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required and at least one question must be provided'
      });
    }

    const challenge = await Challenge.create({
      title,
      category,
      difficulty,
      points,
      description,
      // --- UPDATED: Save new fields ---
      startDateTime,
      endDateTime,
      // --- END UPDATE ---
      questions,
      numberOfQuestions,
      status: status || 'Published',
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Challenge created successfully',
      data: challenge
    });
  } catch (error) {
    console.error('Error creating challenge:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create challenge',
      error: error.message
    });
  }
};

export const getAllChallenges = async (req, res) => {
  // This function is for admins, so it correctly does NOT filter by date.
  // No changes needed here.
  try {
    const { category, difficulty, search, status } = req.query;

    let query = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (difficulty) {
      query.difficulty = difficulty;
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const challenges = await Challenge.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: challenges.length,
      data: challenges
    });
  } catch (error) {
    console.error('Error fetching challenges:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch challenges',
      error: error.message
    });
  }
};

export const getInstructorChallenges = async (req, res) => {
  try {
    const { category, difficulty, search, status } = req.query;
    const instructorId = req.user._id;

    let query = { createdBy: instructorId };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (difficulty) {
      query.difficulty = difficulty;
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const challenges = await Challenge.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: challenges.length,
      data: challenges
    });
  } catch (error) {
    console.error('Error fetching instructor challenges:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch challenges',
      error: error.message
    });
  }
};

export const getPublishedChallenges = async (req, res) => {
  // Return all published challenges for the Practice page to display
  try {
    const { category, difficulty, search } = req.query;

    let query = {
      status: 'Published'
    };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (difficulty) {
      query.difficulty = difficulty;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const challenges = await Challenge.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: challenges.length,
      data: challenges
    });
  } catch (error) {
    console.error('Error fetching published challenges:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch challenges',
      error: error.message
    });
  }
};

export const getChallengeById = async (req, res) => {
  // No changes needed
  try {
    const challenge = await Challenge.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    res.status(200).json({
      success: true,
      data: challenge
    });
  } catch (error) {
    console.error('Error fetching challenge:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch challenge',
      error: error.message
    });
  }
};

export const updateChallenge = async (req, res) => {
  try {
    // --- UPDATED: Destructure new fields ---
    const { 
      title, category, difficulty, points, description, 
      startDateTime, endDateTime, // Replaced 4 old fields
      questions, status, numberOfQuestions 
    } = req.body;

    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    // --- UPDATED: Assign new fields ---
    challenge.title = title;
    challenge.category = category;
    challenge.difficulty = difficulty;
    challenge.points = points;
    challenge.description = description;
    challenge.startDateTime = startDateTime;
    challenge.endDateTime = endDateTime;
    challenge.questions = questions;
    challenge.status = status;
    challenge.numberOfQuestions = numberOfQuestions;
    
    // Explicitly remove old fields
    challenge.startDate = undefined; 
    challenge.endDate = undefined; 
    challenge.startTime = undefined; 
    challenge.endTime = undefined; 
    // --- END UPDATE ---

    await challenge.save();

    res.status(200).json({
      success: true,
      message: 'Challenge updated successfully',
      data: challenge
    });
  } catch (error) {
    console.error('Error updating challenge:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update challenge',
      error: error.message
    });
  }
};

// ... (No changes needed in deleteChallenge, getChallengeStats, submitChallenge, etc.) ...
// ... (All other controller functions remain the same) ...

export const deleteChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    await Challenge.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Challenge deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting challenge:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete challenge',
      error: error.message
    });
  }
};

export const getChallengeStats = async (req, res) => {
  try {
    const totalChallenges = await Challenge.countDocuments();
    const publishedCount = await Challenge.countDocuments({ status: 'Published' });
    const draftCount = await Challenge.countDocuments({ status: 'Draft' });
    const dailyCount = await Challenge.countDocuments({ category: 'daily' });
    const weeklyCount = await Challenge.countDocuments({ category: 'weekly' });

    const challenges = await Challenge.find();
    const avgSuccessRate = challenges.length > 0
      ? Math.round(challenges.reduce((sum, c) => sum + c.successRate, 0) / challenges.length)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        totalChallenges,
        publishedCount,
        draftCount,
        dailyCount,
        weeklyCount,
        avgSuccessRate
      }
    });
  } catch (error) {
    console.error('Error fetching challenge stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch challenge stats',
      error: error.message
    });
  }
};

export const submitChallenge = async (req, res) => {
  try {
    const { challengeId, answers, timeSpent } = req.body;
    const userId = req.user._id;

    if (!challengeId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Challenge ID and answers array are required'
      });
    }

    const existingSubmission = await ChallengeSubmission.findOne({
      challengeId,
      userId
    });

    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted this challenge'
      });
    }

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    let correctAnswers = 0;
    const processedAnswers = answers.map(answer => {
      const question = challenge.questions.id(answer.questionId);
      if (!question) {
        throw new Error(`Question ${answer.questionId} not found`);
      }

      const isCorrect = answer.userAnswer === question.answer;
      if (isCorrect) correctAnswers++;

      return {
        questionId: answer.questionId,
        question: question.question,
        options: question.options,
        userAnswer: answer.userAnswer,
        correctAnswer: question.answer,
        isCorrect,
        explanation: question.explanation || ''
      };
    });

    const totalQuestions = answers.length;
    const pointsPerQuestion = challenge.points / challenge.numberOfQuestions;
    const score = Math.round(pointsPerQuestion * correctAnswers);

    const submission = await ChallengeSubmission.create({
      challengeId,
      userId,
      answers: processedAnswers,
      score,
      totalQuestions,
      correctAnswers,
      timeSpent: timeSpent || 0
    });

    challenge.attempts = (challenge.attempts || 0) + 1;
    const totalSubmissions = await ChallengeSubmission.countDocuments({ challengeId });
    const allSubmissions = await ChallengeSubmission.find({ challengeId });
    const avgPercentage = allSubmissions.reduce((sum, sub) => sum + (sub.score / challenge.points) * 100, 0) / totalSubmissions;
    challenge.successRate = Math.round(avgPercentage);
    await challenge.save();

    res.status(201).json({
      success: true,
      message: 'Challenge submitted successfully',
      data: submission
    });
  } catch (error) {
    console.error('Error submitting challenge:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit challenge',
      error: error.message
    });
  }
};

export const getUserSubmission = async (req, res) => {
  try {
    const { challengeId } = req.params;
    const userId = req.user._id;

    const submission = await ChallengeSubmission.findOne({
      challengeId,
      userId
    }).populate('challengeId', 'title description difficulty');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    res.status(200).json({
      success: true,
      data: submission
    });
  } catch (error) {
    console.error('Error fetching submission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submission',
      error: error.message
    });
  }
};

export const checkUserSubmission = async (req, res) => {
  try {
    const { challengeId } = req.params;
    const userId = req.user._id;

    const submission = await ChallengeSubmission.findOne({
      challengeId,
      userId
    });

    res.status(200).json({
      success: true,
      hasSubmitted: !!submission,
      submission: submission || null
    });
  } catch (error) {
    console.error('Error checking submission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check submission',
      error: error.message
    });
  }
};

export const getChallengeLeaderboard = async (req, res) => {
  try {
    const { challengeId } = req.params;

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    const leaderboard = await ChallengeSubmission.find({ challengeId })
      .populate('userId', 'name email')
      .sort({ score: -1, timeSpent: 1 })
      .limit(100);

    const formattedLeaderboard = leaderboard.map((submission, index) => ({
      rank: index + 1,
      name: submission.userId?.name || 'Anonymous',
      email: submission.userId?.email,
      score: submission.score,
      correctAnswers: submission.correctAnswers,
      totalQuestions: submission.totalQuestions,
      timeSpent: submission.timeSpent,
      submittedAt: submission.submittedAt,
      badge: index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : null
    }));

    res.status(200).json({
      success: true,
      data: {
        challenge: {
          id: challenge._id,
          title: challenge.title,
          description: challenge.description,
          difficulty: challenge.difficulty,
          points: challenge.points
        },
        leaderboard: formattedLeaderboard,
        totalParticipants: leaderboard.length
      }
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard',
      error: error.message
    });
  }
};

export const getInstructorChallengeStats = async (req, res) => {
  try {
    const instructorId = req.user._id;

    const totalChallenges = await Challenge.countDocuments({ createdBy: instructorId });
    const publishedChallenges = await Challenge.countDocuments({ createdBy: instructorId, status: 'Published' });
    const draftChallenges = await Challenge.countDocuments({ createdBy: instructorId, status: 'Draft' });

    res.status(200).json({
      success: true,
      data: {
        totalChallenges,
        publishedChallenges,
        draftChallenges
      }
    });
  } catch (error) {
    console.error('Error fetching instructor challenge stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch challenge stats',
      error: error.message
    });
  }
};

export const getStudentRecentScores = async (req, res) => {
  try {
    const userId = req.user._id;

    const recentSubmissions = await ChallengeSubmission.find({ userId })
      .populate('challengeId', 'title category')
      .sort({ submittedAt: -1 })
      .limit(5);

    const formattedScores = recentSubmissions.map(submission => ({
      _id: submission._id,
      challenge: {
        title: submission.challengeId?.title || 'Challenge',
        category: submission.challengeId?.category || 'General'
      },
      score: Math.round((submission.correctAnswers / submission.totalQuestions) * 100),
      submittedAt: submission.submittedAt
    }));

    res.status(200).json({
      success: true,
      data: formattedScores
    });
  } catch (error) {
    console.error('Error fetching student recent scores:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent scores',
      error: error.message
    });
  }
};

export const getStudentAchievements = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's submission stats
    const submissions = await ChallengeSubmission.find({ userId });
    const totalSubmissions = submissions.length;
    const averageScore = submissions.length > 0
      ? Math.round(submissions.reduce((sum, sub) => sum + sub.score, 0) / submissions.length)
      : 0;

    // Calculate streaks
    const submissionsByDate = {};
    submissions.forEach(sub => {
      const date = sub.submittedAt.toISOString().split('T')[0];
      submissionsByDate[date] = (submissionsByDate[date] || 0) + 1;
    });

    const dates = Object.keys(submissionsByDate).sort().reverse();
    let currentStreak = 0;
    const today = new Date().toISOString().split('T')[0];

    for (let i = 0; i < dates.length; i++) {
      const date = dates[i];
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);
      const expectedDateStr = expectedDate.toISOString().split('T')[0];

      if (date === expectedDateStr) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Define achievements based on user stats
    const achievements = [
      {
        _id: 'a1',
        name: 'First Steps',
        description: 'Complete your first challenge',
        icon: '🎯',
        isUnlocked: totalSubmissions > 0,
        unlockedDate: totalSubmissions > 0 ? submissions[0]?.submittedAt : null
      },
      {
        _id: 'a2',
        name: 'Week Warrior',
        description: 'Maintain a 7-day streak',
        icon: '🔥',
        isUnlocked: currentStreak >= 7,
        unlockedDate: currentStreak >= 7 ? new Date() : null
      },
      {
        _id: 'a3',
        name: 'Perfect Score',
        description: 'Score 100% on any test',
        icon: '💯',
        isUnlocked: submissions.some(sub => sub.correctAnswers === sub.totalQuestions),
        unlockedDate: submissions.find(sub => sub.correctAnswers === sub.totalQuestions)?.submittedAt || null
      },
      {
        _id: 'a4',
        name: 'Consistent Learner',
        description: 'Complete 10 challenges',
        icon: '📚',
        isUnlocked: totalSubmissions >= 10,
        unlockedDate: totalSubmissions >= 10 ? submissions[9]?.submittedAt : null
      },
      {
        _id: 'a5',
        name: 'High Achiever',
        description: 'Maintain 90%+ average score',
        icon: '⭐',
        isUnlocked: averageScore >= 90,
        unlockedDate: averageScore >= 90 ? new Date() : null
      },
      {
        _id: 'a6',
        name: 'Speed Demon',
        description: 'Complete a challenge in under 5 minutes',
        icon: '⚡',
        isUnlocked: submissions.some(sub => sub.timeSpent < 300), // 5 minutes = 300 seconds
        unlockedDate: submissions.find(sub => sub.timeSpent < 300)?.submittedAt || null
      }
    ];

    res.status(200).json({
      success: true,
      data: achievements
    });
  } catch (error) {
    console.error('Error fetching student achievements:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch achievements',
      error: error.message
    });
  }
};

export const getStudentStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get total challenges completed by student
    const totalSubmissions = await ChallengeSubmission.countDocuments({ userId });
    const completedChallenges = totalSubmissions;

    // Get average score
    const submissions = await ChallengeSubmission.find({ userId });
    const averageScore = submissions.length > 0
      ? Math.round(submissions.reduce((sum, sub) => sum + (sub.correctAnswers / sub.totalQuestions) * 100, 0) / submissions.length)
      : 0;

    // Get current streak (consecutive days with submissions)
    const submissionsByDate = {};
    submissions.forEach(sub => {
      const date = sub.submittedAt.toISOString().split('T')[0];
      submissionsByDate[date] = (submissionsByDate[date] || 0) + 1;
    });

    const dates = Object.keys(submissionsByDate).sort().reverse();
    let currentStreak = 0;
    const today = new Date().toISOString().split('T')[0];

    for (let i = 0; i < dates.length; i++) {
      const date = dates[i];
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);
      const expectedDateStr = expectedDate.toISOString().split('T')[0];

      if (date === expectedDateStr) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Get best streak
    let bestStreak = 0;
    let tempStreak = 0;
    const sortedDates = Object.keys(submissionsByDate).sort();

    for (let i = 0; i < sortedDates.length; i++) {
      const currentDate = new Date(sortedDates[i]);
      const prevDate = i > 0 ? new Date(sortedDates[i - 1]) : null;

      if (!prevDate || (currentDate - prevDate) / (1000 * 60 * 60 * 24) === 1) {
        tempStreak++;
        bestStreak = Math.max(bestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }

    // Get total points (sum of all scores)
    const totalPoints = submissions.reduce((sum, sub) => sum + sub.score, 0);

    // Get rank based on average score
    let rank = 'Beginner';
    if (averageScore >= 90) rank = 'Expert';
    else if (averageScore >= 80) rank = 'Advanced';
    else if (averageScore >= 70) rank = 'Intermediate';

    res.status(200).json({
      success: true,
      data: {
        completedChallenges,
        averageScore,
        currentStreak,
        bestStreak,
        totalPoints,
        rank
      }
    });
  } catch (error) {
    console.error('Error fetching student stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student stats',
      error: error.message
    });
  }
};

export const getChallengeChartData = async (req, res) => {
  try {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const currentYear = new Date().getFullYear();

    const challengeCounts = await Promise.all(
      months.map(async (month, index) => {
        const startDate = new Date(currentYear, index, 1);
        const endDate = new Date(currentYear, index + 1, 1);

        const count = await Challenge.countDocuments({
          createdAt: { $gte: startDate, $lt: endDate }
        });

        return count;
      })
    );

    res.status(200).json({
      success: true,
      data: {
        labels: months,
        datasets: [{
          label: 'Challenges Created',
          data: challengeCounts,
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.5)',
        }]
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch challenge chart data',
      error: error.message,
    });
  }
};

export const getChallengeMetrics = async (req, res) => {
  try {
    const { challengeId } = req.params;

    const challenge = await Challenge.findById(challengeId).populate('createdBy', 'name email');
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    // Get all submissions for this challenge
    const submissions = await ChallengeSubmission.find({ challengeId })
      .populate('userId', 'name email')
      .sort({ submittedAt: -1 });

    // Basic metrics
    const totalAttempts = submissions.length;
    const uniqueParticipants = new Set(submissions.map(s => s.userId?._id?.toString())).size;

    // Calculate average score and time
    let totalScore = 0;
    let totalTime = 0;
    let scoreDistribution = { '0-20': 0, '21-40': 0, '41-60': 0, '61-80': 0, '81-100': 0 };

    submissions.forEach(submission => {
      const percentage = Math.round((submission.score / challenge.points) * 100);
      totalScore += percentage;
      totalTime += submission.timeSpent || 0;

      if (percentage <= 20) scoreDistribution['0-20']++;
      else if (percentage <= 40) scoreDistribution['21-40']++;
      else if (percentage <= 60) scoreDistribution['41-60']++;
      else if (percentage <= 80) scoreDistribution['61-80']++;
      else scoreDistribution['81-100']++;
    });

    const averageScore = totalAttempts > 0 ? Math.round(totalScore / totalAttempts) : 0;
    const averageTime = totalAttempts > 0 ? Math.round(totalTime / totalAttempts) : 0;

    // Question-wise performance
    const questionStats = challenge.questions.map((question, index) => {
      const questionSubmissions = submissions.map(s =>
        s.answers.find(a => a.questionId.toString() === question._id.toString())
      ).filter(Boolean);

      const correctCount = questionSubmissions.filter(a => a.isCorrect).length;
      const totalAnswered = questionSubmissions.length;
      const successRate = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;

      return {
        questionNumber: index + 1,
        question: question.question,
        correctAnswers: correctCount,
        totalAttempts: totalAnswered,
        successRate
      };
    });

    // Recent submissions (last 10)
    const recentSubmissions = submissions.slice(0, 10).map(submission => ({
      id: submission._id,
      user: {
        name: submission.userId?.name || 'Anonymous',
        email: submission.userId?.email
      },
      score: submission.score,
      percentage: Math.round((submission.score / challenge.points) * 100),
      correctAnswers: submission.correctAnswers,
      totalQuestions: submission.totalQuestions,
      timeSpent: submission.timeSpent,
      submittedAt: submission.submittedAt
    }));

    // Time-based analytics
    const now = new Date();
    const last24Hours = submissions.filter(s => (now - new Date(s.submittedAt)) < 24 * 60 * 60 * 1000).length;
    const last7Days = submissions.filter(s => (now - new Date(s.submittedAt)) < 7 * 24 * 60 * 60 * 1000).length;
    const last30Days = submissions.filter(s => (now - new Date(s.submittedAt)) < 30 * 24 * 60 * 60 * 1000).length;

    res.status(200).json({
      success: true,
      data: {
        challenge: {
          id: challenge._id,
          title: challenge.title,
          description: challenge.description,
          category: challenge.category,
          difficulty: challenge.difficulty,
          points: challenge.points,
          numberOfQuestions: challenge.numberOfQuestions,
          startDateTime: challenge.startDateTime,
          endDateTime: challenge.endDateTime,
          status: challenge.status,
          createdBy: challenge.createdBy
        },
        metrics: {
          totalAttempts,
          uniqueParticipants,
          averageScore,
          averageTime,
          successRate: challenge.successRate || 0,
          scoreDistribution,
          activity: {
            last24Hours,
            last7Days,
            last30Days
          }
        },
        questionStats,
        recentSubmissions
      }
    });
  } catch (error) {
    console.error('Error fetching challenge metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch challenge metrics',
      error: error.message
    });
  }
};