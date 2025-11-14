import mongoose from 'mongoose';

const contentCardSchema = new mongoose.Schema({
  heading: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  images: [{
    url: String,
    caption: String,
    cloudinaryPublicId: String
  }],
  order: {
    type: Number,
    required: true
  }
});

const quizQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: [{
    type: String,
    required: true
  }],
  answer: {
    type: String,
    required: true
  },
  explanation: String
});

const videoContentSchema = new mongoose.Schema({
  videoUrl: String,
  videoFile: String,
  cloudinaryPublicId: String,
  description: String,
  transcript: String
});

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  module: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Lesson', 'Quiz', 'Video']
  },
  duration: {
    type: String,
    required: true
  },
  order: {
    type: Number,
    default: 0
  },
  contentCards: [contentCardSchema],
  quizQuestions: [quizQuestionSchema],
  videoContent: videoContentSchema,
  status: {
    type: String,
    enum: ['Published', 'Draft'],
    default: 'Published'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  completions: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.model('Lesson', lessonSchema);
