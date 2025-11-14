import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  options: [{
    type: String,
    required: true
  }],
  answer: {
    type: String,
    required: true
  },
  explanation: {
    type: String,
    trim: true
  }
});

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['daily', 'weekly'],
    trim: true
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Easy', 'Medium', 'Hard']
  },
  points: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },

  // --- UPDATED: Replaced 4 old fields with these 2 ---
  startDateTime: {
    type: Date,
    required: true
  },
  endDateTime: {
    type: Date,
    required: false
  },
  // --- END UPDATE ---

  numberOfQuestions: {
    type: Number,
    required: true,
    default: 10
  },
  questions: [questionSchema],
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
  attempts: {
    type: Number,
    default: 0
  },
  successRate: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.model('Challenge', challengeSchema);