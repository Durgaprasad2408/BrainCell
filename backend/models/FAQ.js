import mongoose from 'mongoose';

const faqSchema = new mongoose.Schema({
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true,
    index: true
  },
  lessonTitle: {
    type: String,
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
    index: true
  },
  subjectName: {
    type: String,
    required: true
  },
  module: {
    type: String,
    required: true
  },
  question: {
    type: String,
    required: true,
    trim: true
  },
  answer: {
    type: String,
    default: null
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  instructorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  instructorName: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'answered'],
    default: 'pending',
    index: true
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  answeredAt: {
    type: Date,
    default: null
  }
});

faqSchema.index({ lesson: 1, status: 1 });
faqSchema.index({ subject: 1, status: 1 });
faqSchema.index({ isPublished: 1 });

export default mongoose.model('FAQ', faqSchema);
