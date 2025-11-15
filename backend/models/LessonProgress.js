import mongoose from 'mongoose';

const lessonProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

lessonProgressSchema.index({ user: 1, lesson: 1 }, { unique: true });

export default mongoose.model('LessonProgress', lessonProgressSchema);