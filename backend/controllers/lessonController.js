import mongoose from 'mongoose';
import Lesson from '../models/Lesson.js';
import LessonProgress from '../models/LessonProgress.js';
import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';
import { Readable } from 'stream';

const uploadToCloudinary = (buffer, resourceType, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType,
        folder: folder
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    const readableStream = Readable.from(buffer);
    readableStream.pipe(uploadStream);
  });
};

export const createLesson = async (req, res) => {
  try {
    const { title, subject, module, type, duration, contentCards, quizQuestions, videoContent, status } = req.body;

    if (!title || !subject || !module || !type || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Title, subject, module, type, and duration are required'
      });
    }

    const parsedContentCards = contentCards ? JSON.parse(contentCards) : [];
    const parsedQuizQuestions = quizQuestions ? JSON.parse(quizQuestions) : [];
    const parsedVideoContent = videoContent ? JSON.parse(videoContent) : {};

    const lastLesson = await Lesson.findOne({ subject, module }).sort({ order: -1 });
    const order = lastLesson ? lastLesson.order + 1 : 1;

    const lesson = await Lesson.create({
      title,
      subject,
      module,
      type,
      duration,
      contentCards: parsedContentCards,
      quizQuestions: parsedQuizQuestions,
      videoContent: parsedVideoContent,
      status: status || 'Published',
      order,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Lesson created successfully',
      data: lesson
    });
  } catch (error) {
    console.error('Error creating lesson:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create lesson',
      error: error.message
    });
  }
};

export const getAllLessons = async (req, res) => {
  try {
    const { subject, module, type, search } = req.query;

    let matchQuery = {};

    if (subject && subject !== 'all') {
      matchQuery.subject = subject;
    }

    if (module && module !== 'all') {
      matchQuery.module = module;
    }

    if (type && type !== 'all') {
      matchQuery.type = type;
    }

    if (search) {
      matchQuery.$or = [
        { title: { $regex: search, $options: 'i' } },
        { module: { $regex: search, $options: 'i' } }
      ];
    }

    const lessons = await Lesson.aggregate([
      { $match: matchQuery },
      { $sort: { createdAt: 1 } },
      {
        $lookup: {
          from: 'lessonprogresses', // MongoDB collection name for LessonProgress model
          localField: '_id',
          foreignField: 'lesson',
          as: 'progress'
        }
      },
      {
        $addFields: {
          completions: {
            $size: {
              $filter: {
                input: '$progress',
                as: 'p',
                cond: { $eq: ['$$p.completed', true] }
              }
            }
          }
        }
      },
      { $project: { progress: 0 } } // Remove the temporary progress field
    ]);

    // Since we are using aggregation, we need to manually populate createdBy if needed,
    // but for this view, we can skip it for simplicity or use another lookup if necessary.
    // Assuming 'createdBy' population is not strictly required for the table view based on the screenshot.
    // If it is required, we would need another $lookup. For now, we rely on the existing fields.

    res.status(200).json({
      success: true,
      count: lessons.length,
      data: lessons
    });
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lessons',
      error: error.message
    });
  }
};

export const getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    res.status(200).json({
      success: true,
      data: lesson
    });
  } catch (error) {
    console.error('Error fetching lesson:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lesson',
      error: error.message
    });
  }
};

export const updateLesson = async (req, res) => {
  try {
    const { title, module, duration, contentCards, quizQuestions, videoContent, status } = req.body;

    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    if (title) lesson.title = title;
    if (module) lesson.module = module;
    if (duration) lesson.duration = duration;
    if (status) lesson.status = status;

    if (contentCards) {
      lesson.contentCards = JSON.parse(contentCards);
    }

    if (quizQuestions) {
      lesson.quizQuestions = JSON.parse(quizQuestions);
    }

    if (videoContent) {
      lesson.videoContent = JSON.parse(videoContent);
    }

    await lesson.save();

    res.status(200).json({
      success: true,
      message: 'Lesson updated successfully',
      data: lesson
    });
  } catch (error) {
    console.error('Error updating lesson:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update lesson',
      error: error.message
    });
  }
};

export const deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    if (lesson.contentCards) {
      for (const card of lesson.contentCards) {
        if (card.images) {
          for (const image of card.images) {
            if (image.cloudinaryPublicId) {
              await cloudinary.uploader.destroy(image.cloudinaryPublicId);
            }
          }
        }
      }
    }

    if (lesson.videoContent && lesson.videoContent.cloudinaryPublicId) {
      await cloudinary.uploader.destroy(lesson.videoContent.cloudinaryPublicId, {
        resource_type: 'video'
      });
    }

    await Lesson.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Lesson deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete lesson',
      error: error.message
    });
  }
};

export const uploadCardImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images provided'
      });
    }

    const uploadedImages = [];

    for (const file of req.files) {
      try {
        const uploadResult = await uploadToCloudinary(
          file.buffer,
          'image',
          'lessons/cards'
        );

        uploadedImages.push({
          url: uploadResult.secure_url,
          cloudinaryPublicId: uploadResult.public_id,
          caption: ''
        });
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({
          success: false,
          message: `Failed to upload image ${file.originalname}: ${uploadError.message}`
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Images uploaded successfully',
      data: uploadedImages
    });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload images',
      error: error.message
    });
  }
};

export const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No video file provided'
      });
    }

    try {
      const uploadResult = await uploadToCloudinary(
        req.file.buffer,
        'video',
        'lessons/videos'
      );

      res.status(200).json({
        success: true,
        message: 'Video uploaded successfully',
        data: {
          videoUrl: uploadResult.secure_url,
          cloudinaryPublicId: uploadResult.public_id,
          duration: uploadResult.duration,
          format: uploadResult.format
        }
      });
    } catch (uploadError) {
      console.error('Cloudinary video upload error:', uploadError);
      return res.status(500).json({
        success: false,
        message: `Failed to upload video: ${uploadError.message}`
      });
    }
  } catch (error) {
    console.error('Error uploading video:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload video',
      error: error.message
    });
  }
};

export const updateLessonOrder = async (req, res) => {
  try {
    const { lessonId, newOrder } = req.body;

    const lesson = await Lesson.findById(lessonId);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    const oldOrder = lesson.order;
    lesson.order = newOrder;
    await lesson.save();

    if (newOrder > oldOrder) {
      await Lesson.updateMany(
        {
          subject: lesson.subject,
          module: lesson.module,
          order: { $gt: oldOrder, $lte: newOrder },
          _id: { $ne: lessonId }
        },
        { $inc: { order: -1 } }
      );
    } else if (newOrder < oldOrder) {
      await Lesson.updateMany(
        {
          subject: lesson.subject,
          module: lesson.module,
          order: { $gte: newOrder, $lt: oldOrder },
          _id: { $ne: lessonId }
        },
        { $inc: { order: 1 } }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Lesson order updated successfully'
    });
  } catch (error) {
    console.error('Error updating lesson order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update lesson order',
      error: error.message
    });
  }
};

export const getInstructorStats = async (req, res) => {
  try {
    const instructorId = req.user._id;
    const { period = 'all' } = req.query;

    const totalLessons = await Lesson.countDocuments({ createdBy: instructorId });
    const publishedLessons = await Lesson.countDocuments({ createdBy: instructorId, status: 'Published' });
    const draftLessons = await Lesson.countDocuments({ createdBy: instructorId, status: 'Draft' });

    // Calculate date range based on period
    let startDate;
    const now = new Date();

    switch (period) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '1w':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '1m':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '6m':
        startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
      default:
        startDate = new Date(0); // Beginning of time
        break;
    }

    const lessonsInPeriod = await Lesson.find({
      createdBy: instructorId,
      createdAt: { $gte: startDate }
    }).sort({ createdAt: 1 });

    // Group by date for chart
    const lessonChartData = {};
    lessonsInPeriod.forEach(lesson => {
      const date = lesson.createdAt.toISOString().split('T')[0];
      lessonChartData[date] = (lessonChartData[date] || 0) + 1;
    });

    const chartLabels = Object.keys(lessonChartData).sort();
    const chartData = chartLabels.map(date => lessonChartData[date]);

    res.status(200).json({
      success: true,
      data: {
        totalLessons,
        publishedLessons,
        draftLessons,
        lessonChart: {
          labels: chartLabels,
          data: chartData
        }
      }
    });
  } catch (error) {
    console.error('Error fetching instructor lesson stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lesson stats',
      error: error.message
    });
  }
};

export const markLessonComplete = async (req, res) => {
  try {
    const { lessonId } = req.body;
    const userId = req.user._id;

    if (!lessonId) {
      return res.status(400).json({
        success: false,
        message: 'Lesson ID is required'
      });
    }

    // Validate that lessonId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid lesson ID format'
      });
    }

    // Verify that the lesson exists
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    // Find and update or create the LessonProgress record
    const progress = await LessonProgress.findOneAndUpdate(
      { user: userId, lesson: lessonId },
      { completed: true, completedAt: new Date() },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Lesson marked as complete',
      data: progress
    });
  } catch (error) {
    console.error('Error marking lesson complete:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark lesson complete',
      error: error.message
    });
  }
};

export const getLessonStats = async (req, res) => {
  try {
    const totalLessons = await Lesson.countDocuments();
    const publishedLessons = await Lesson.countDocuments({ status: 'Published' });
    const draftLessons = await Lesson.countDocuments({ status: 'Draft' });

    // Count by type
    const lessonTypes = await Lesson.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    const totalQuizzes = lessonTypes.find(type => type._id === 'quiz')?.count || 0;
    const totalVideos = lessonTypes.find(type => type._id === 'video')?.count || 0;

    res.status(200).json({
      success: true,
      data: {
        totalLessons,
        publishedLessons,
        draftLessons,
        totalQuizzes,
        totalVideos
      }
    });
  } catch (error) {
    console.error('Error fetching lesson stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lesson stats',
      error: error.message
    });
  }
};

export const getLessonMetrics = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid lesson ID format'
      });
    }

    // Get lesson details
    const lesson = await Lesson.findById(id).populate('createdBy', 'name email');
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    // Get total students count
    const totalStudents = await User.countDocuments({ role: 'user' });

    // Get completion data
    const completionData = await LessonProgress.find({ lesson: id })
      .populate('user', 'name email')
      .sort({ completedAt: -1 });

    const totalCompletions = completionData.length;
    const completionRate = totalStudents > 0 ? (totalCompletions / totalStudents) * 100 : 0;

    // Get recent completions (last 10)
    const recentCompletions = completionData.slice(0, 10).map(progress => ({
      user: progress.user.name,
      email: progress.user.email,
      completedAt: progress.completedAt
    }));

    // Calculate completion trend (completions per month for last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const completionTrend = await LessonProgress.aggregate([
      { $match: { lesson: id, completedAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$completedAt' },
            month: { $month: '$completedAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Format trend data
    const trendData = completionTrend.map(item => ({
      month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
      completions: item.count
    }));

    res.status(200).json({
      success: true,
      data: {
        lesson: {
          id: lesson._id,
          title: lesson.title,
          subject: lesson.subject,
          module: lesson.module,
          type: lesson.type,
          duration: lesson.duration,
          status: lesson.status,
          rating: lesson.rating,
          createdBy: lesson.createdBy,
          createdAt: lesson.createdAt,
          contentCards: lesson.contentCards,
          quizQuestions: lesson.quizQuestions,
          videoContent: lesson.videoContent
        },
        metrics: {
          totalCompletions,
          totalStudents,
          completionRate: Math.round(completionRate * 100) / 100, // Round to 2 decimal places
          averageRating: lesson.rating || 0,
          recentCompletions,
          completionTrend: trendData
        }
      }
    });
  } catch (error) {
    console.error('Error fetching lesson metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lesson metrics',
      error: error.message
    });
  }
};
