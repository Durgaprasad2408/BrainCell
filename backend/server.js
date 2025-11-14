import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import resourceRoutes from './routes/resources.js';
import challengeRoutes from './routes/challenges.js';
import subjectRoutes from './routes/subjects.js';
import lessonRoutes from './routes/lessons.js';
import faqRoutes from './routes/faqs.js';

dotenv.config();

const app = express();

// Connect to database
connectDB();

app.use(cors({
  origin: process.env.CLIENT_URL || 'https://braincell-campus.vercel.app', // Use environment variable with fallback
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configure multer for memory storage (Vercel serverless compatible)
import multer from 'multer';
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Remove the static file serving since we can't serve files from disk in serverless
// app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/faqs', faqRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

const PORT = process.env.PORT || 5000;

// For Vercel serverless functions, export the app
export default app;

// For local development, listen on port
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
