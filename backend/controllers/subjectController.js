import Subject from '../models/Subject.js';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';
import path from 'path';

export const createSubject = async (req, res) => {
  try {
    console.log('Create subject request:', {
      body: req.body,
      file: req.file ? { filename: req.file.filename, mimetype: req.file.mimetype, size: req.file.size } : null
    });

    const { name, description, icon } = req.body;

    const existingSubject = await Subject.findOne({ name });
    if (existingSubject) {
      return res.status(400).json({
        success: false,
        message: 'Subject with this name already exists'
      });
    }

    let imageUrl = '';
    if (req.file) {
      console.log('Uploading file to Cloudinary...');
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'subjects',
        public_id: `subject_${Date.now()}`,
        resource_type: 'image'
      });
      imageUrl = result.secure_url;
      console.log('Cloudinary upload successful:', imageUrl);

      // Remove temp file
      fs.unlinkSync(req.file.path);
    }

    const subject = await Subject.create({
      name,
      description,
      icon,
      image: imageUrl,
      createdBy: req.user._id
    });

    console.log('Subject created successfully:', subject._id);
    res.status(201).json({
      success: true,
      data: subject,
      message: 'Subject created successfully'
    });
  } catch (error) {
    console.error('Create subject error:', error);
    // Clean up temp file if upload failed
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: 'Failed to create subject: ' + error.message
    });
  }
};

export const getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({ isActive: true }).sort({ createdAt: -1 });

    const Lesson = (await import('../models/Lesson.js')).default;

    const subjectsWithCounts = await Promise.all(
      subjects.map(async (subject) => {
        const lessonCount = await Lesson.countDocuments({ subject: subject.name });
        return {
          ...subject.toObject(),
          lessons: lessonCount
        };
      })
    );

    res.status(200).json({
      success: true,
      data: subjectsWithCounts
    });
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subjects'
    });
  }
};

export const getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    res.status(200).json({
      success: true,
      data: subject
    });
  } catch (error) {
    console.error('Get subject error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subject'
    });
  }
};

export const updateSubject = async (req, res) => {
  try {
    const { name, description, icon } = req.body;

    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    if (name && name !== subject.name) {
      const existingSubject = await Subject.findOne({ name });
      if (existingSubject) {
        return res.status(400).json({
          success: false,
          message: 'Subject with this name already exists'
        });
      }
    }

    let imageUrl = subject.image; // Keep existing image by default
    if (req.file) {
      // Upload new image to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'subjects',
        public_id: `subject_${Date.now()}`,
        resource_type: 'image'
      });
      imageUrl = result.secure_url;

      // Remove temp file
      fs.unlinkSync(req.file.path);
    }

    if (name) subject.name = name;
    if (description) subject.description = description;
    if (icon !== undefined) subject.icon = icon;
    subject.image = imageUrl;

    await subject.save();

    res.status(200).json({
      success: true,
      data: subject,
      message: 'Subject updated successfully'
    });
  } catch (error) {
    console.error('Update subject error:', error);
    // Clean up temp file if upload failed
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: 'Failed to update subject'
    });
  }
};

export const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    const subjectName = subject.name;

    await Subject.findByIdAndDelete(req.params.id);

    const User = (await import('../models/User.js')).default;
    await User.updateMany(
      { subjects: subjectName },
      { $pull: { subjects: subjectName } }
    );

    res.status(200).json({
      success: true,
      message: 'Subject deleted successfully'
    });
  } catch (error) {
    console.error('Delete subject error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete subject'
    });
  }
};

export const enrollSubject = async (req, res) => {
  try {
    const { subjectId } = req.body;
    const userId = req.user._id;

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    const User = (await import('../models/User.js')).default;
    const user = await User.findById(userId);

    const alreadyEnrolled = user.enrolledSubjects.some(
      enrollment => enrollment.subjectId.toString() === subjectId
    );

    if (alreadyEnrolled) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this subject'
      });
    }

    user.enrolledSubjects.push({ subjectId });
    await user.save();

    subject.students += 1;
    await subject.save();

    res.status(200).json({
      success: true,
      message: 'Successfully enrolled in subject'
    });
  } catch (error) {
    console.error('Enroll subject error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to enroll in subject'
    });
  }
};

export const getEnrolledSubjects = async (req, res) => {
  try {
    const userId = req.user._id;
    const User = (await import('../models/User.js')).default;

    const user = await User.findById(userId).populate('enrolledSubjects.subjectId');

    const enrolledSubjects = user.enrolledSubjects
      .filter(enrollment => enrollment.subjectId)
      .map(enrollment => ({
        ...enrollment.subjectId.toObject(),
        enrolledAt: enrollment.enrolledAt
      }));

    res.status(200).json({
      success: true,
      data: enrolledSubjects
    });
  } catch (error) {
    console.error('Get enrolled subjects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enrolled subjects'
    });
  }
};

export const checkEnrollment = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const userId = req.user._id;

    const User = (await import('../models/User.js')).default;
    const user = await User.findById(userId);

    const isEnrolled = user.enrolledSubjects.some(
      enrollment => enrollment.subjectId.toString() === subjectId
    );

    res.status(200).json({
      success: true,
      isEnrolled
    });
  } catch (error) {
    console.error('Check enrollment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check enrollment'
    });
  }
};

export const getSubjectChartData = async (req, res) => {
  try {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const currentYear = new Date().getFullYear();

    const subjectCounts = await Promise.all(
      months.map(async (month, index) => {
        const startDate = new Date(currentYear, index, 1);
        const endDate = new Date(currentYear, index + 1, 1);

        const count = await Subject.countDocuments({
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
          label: 'Subjects Created',
          data: subjectCounts,
          borderColor: 'rgb(245, 158, 11)',
          backgroundColor: 'rgba(245, 158, 11, 0.5)',
        }]
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subject chart data',
      error: error.message,
    });
  }
};
