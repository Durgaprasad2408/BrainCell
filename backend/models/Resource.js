import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['pdf', 'video', 'link']
  },
  subCategory: {
    type: String,
    required: true,
    enum: ['notes', 'computative', 'videos', 'external-links'],
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true
  },
  cloudinaryPublicId: {
    type: String
  },
  size: {
    type: String
  },
  duration: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  downloads: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  clicks: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.model('Resource', resourceSchema);
