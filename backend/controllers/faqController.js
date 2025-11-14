import FAQ from '../models/FAQ.js';
import Lesson from '../models/Lesson.js';
import Subject from '../models/Subject.js';

export const createQuery = async (req, res) => {
  try {
    const { lessonId, question } = req.body;

    if (!lessonId || !question) {
      return res.status(400).json({ message: 'Lesson ID and question are required' });
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    const subject = await Subject.findOne({ name: lesson.subject });
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    const faq = new FAQ({
      lesson: lessonId,
      lessonTitle: lesson.title,
      subject: subject._id,
      subjectName: subject.name,
      module: lesson.module,
      question: question.trim(),
      studentId: req.user._id,
      studentName: req.user.name,
      status: 'pending'
    });

    await faq.save();

    res.status(201).json({
      message: 'Query submitted successfully',
      faq
    });
  } catch (error) {
    console.error('Error creating query:', error);
    res.status(500).json({ message: 'Failed to submit query', error: error.message });
  }
};

export const getLessonFAQs = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const faqs = await FAQ.find({
      lesson: lessonId,
      status: 'answered',
      isPublished: true
    })
      .select('question answer instructorName answeredAt createdAt')
      .sort({ answeredAt: -1 });

    res.json(faqs);
  } catch (error) {
    console.error('Error fetching lesson FAQs:', error);
    res.status(500).json({ message: 'Failed to fetch FAQs', error: error.message });
  }
};

export const getQueriesForInstructor = async (req, res) => {
  try {
    const { role } = req.user;
    let query = {};

    if (role === 'admin') {
      query = {};
    } else if (role === 'instructor') {
      const createdSubjects = await Subject.find({ createdBy: req.user._id }).select('_id');
      const createdSubjectIds = createdSubjects.map(s => s._id);

      const assignedSubjectNames = req.user.subjects || [];
      const assignedSubjects = await Subject.find({ name: { $in: assignedSubjectNames } }).select('_id');
      const assignedSubjectIds = assignedSubjects.map(s => s._id);

      const allSubjectIds = [...new Set([...createdSubjectIds, ...assignedSubjectIds])];

      query = { subject: { $in: allSubjectIds } };
    } else {
      return res.status(403).json({ message: 'Access denied' });
    }

    const queries = await FAQ.find(query)
      .populate('lesson', 'title module')
      .populate('subject', 'name')
      .sort({ createdAt: -1 });

    res.json(queries);
  } catch (error) {
    console.error('Error fetching queries:', error);
    res.status(500).json({ message: 'Failed to fetch queries', error: error.message });
  }
};

export const answerQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const { answer } = req.body;
    const { role } = req.user;

    if (!answer || !answer.trim()) {
      return res.status(400).json({ message: 'Answer is required' });
    }

    const faq = await FAQ.findById(id).populate('subject');
    if (!faq) {
      return res.status(404).json({ message: 'Query not found' });
    }

    if (role === 'instructor') {
      const isCreator = await Subject.findOne({
        _id: faq.subject._id,
        createdBy: req.user._id
      });

      const isAssigned = req.user.subjects && req.user.subjects.includes(faq.subject.name);

      if (!isCreator && !isAssigned) {
        return res.status(403).json({ message: 'You do not have access to this subject' });
      }
    } else if (role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    faq.answer = answer.trim();
    faq.instructorId = req.user._id;
    faq.instructorName = req.user.name;
    faq.status = 'answered';
    faq.answeredAt = new Date();
    faq.isPublished = true;

    await faq.save();

    res.json({
      message: 'Answer submitted successfully and added to FAQs',
      faq
    });
  } catch (error) {
    console.error('Error answering query:', error);
    res.status(500).json({ message: 'Failed to answer query', error: error.message });
  }
};

export const deleteQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.user;

    const faq = await FAQ.findById(id).populate('subject');
    if (!faq) {
      return res.status(404).json({ message: 'Query not found' });
    }

    if (role === 'instructor') {
      const isCreator = await Subject.findOne({
        _id: faq.subject._id,
        createdBy: req.user._id
      });

      const isAssigned = req.user.subjects && req.user.subjects.includes(faq.subject.name);

      if (!isCreator && !isAssigned) {
        return res.status(403).json({ message: 'You do not have access to this subject' });
      }
    } else if (role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await FAQ.findByIdAndDelete(id);

    res.json({ message: 'Query deleted successfully' });
  } catch (error) {
    console.error('Error deleting query:', error);
    res.status(500).json({ message: 'Failed to delete query', error: error.message });
  }
};

export const togglePublishStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.user;

    const faq = await FAQ.findById(id).populate('subject');
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }

    if (faq.status !== 'answered') {
      return res.status(400).json({ message: 'Cannot publish unanswered query' });
    }

    if (role === 'instructor') {
      const isCreator = await Subject.findOne({
        _id: faq.subject._id,
        createdBy: req.user._id
      });

      const isAssigned = req.user.subjects && req.user.subjects.includes(faq.subject.name);

      if (!isCreator && !isAssigned) {
        return res.status(403).json({ message: 'You do not have access to this subject' });
      }
    } else if (role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    faq.isPublished = !faq.isPublished;
    await faq.save();

    res.json({
      message: `FAQ ${faq.isPublished ? 'published' : 'unpublished'} successfully`,
      faq
    });
  } catch (error) {
    console.error('Error toggling publish status:', error);
    res.status(500).json({ message: 'Failed to update FAQ status', error: error.message });
  }
};

export const getAllPublishedFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.find({
      status: 'answered',
      isPublished: true
    })
      .select('question answer instructorName answeredAt createdAt lessonTitle subjectName')
      .sort({ answeredAt: -1 });

    res.json(faqs);
  } catch (error) {
    console.error('Error fetching all published FAQs:', error);
    res.status(500).json({ message: 'Failed to fetch all published FAQs', error: error.message });
  }
};

export default {
  createQuery,
  getLessonFAQs,
  getQueriesForInstructor,
  answerQuery,
  deleteQuery,
  togglePublishStatus,
  getAllPublishedFAQs
};
