import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { createLesson, getAllLessons, updateLesson, deleteLesson, uploadCardImages, uploadVideo } from '../../api/lessonService';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ArrowUp,
  ArrowDown,
  BookOpen,
  CheckSquare,
  Video as VideoIcon,
  X,
  Upload,
  Eye,
  Image as ImageIcon,
  Download
} from 'lucide-react';

const LearningContentManagement = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedModule, setSelectedModule] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '', description: '', icon: '' });
  const [editMode, setEditMode] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [createStep, setCreateStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    module: '',
    type: 'Lesson',
    duration: '',
    subject: ''
  });

  // Lesson card state with images
  const [contentCards, setContentCards] = useState([]);
  const [currentCard, setCurrentCard] = useState({
    heading: '',
    content: '',
    images: [],
    order: 0
  });
  const [currentCardImages, setCurrentCardImages] = useState([]);
  const [editingCardIndex, setEditingCardIndex] = useState(null);

  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    answer: '',
    explanation: ''
  });
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [bulkFile, setBulkFile] = useState(null);
  const [videoData, setVideoData] = useState({
    videoFile: null,
    videoUrl: '',
    description: '',
    transcript: ''
  });

  const [subjects, setSubjects] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (subjects.length > 0 && !selectedSubject) {
      setSelectedSubject(subjects[0].name);
      setFormData(prev => ({ ...prev, subject: subjects[0].name }));
    }
  }, [subjects, selectedSubject]);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/subjects`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success && user?.subjects) {
        const userSubjects = response.data.data.filter(subject =>
          user.subjects.some(userSubject =>
            userSubject.toLowerCase() === subject.name.toLowerCase()
          )
        );
        setSubjects(userSubjects);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setError('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const fetchLessons = useCallback(async () => {
    if (!selectedSubject) return;
    try {
      setLoading(true);
      const response = await getAllLessons({ subject: selectedSubject });
      if (response.success) {
        setLessons(response.data);
      }
    } catch (error) {
      console.error('Error fetching lessons:', error);
      setError('Failed to load lessons');
    } finally {
      setLoading(false);
    }
  }, [selectedSubject]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  const getIconForType = (type) => {
    if (type === 'Lesson') return BookOpen;
    if (type === 'Quiz') return CheckSquare;
    return VideoIcon;
  };

  const uniqueModules = ['all', ...new Set(lessons.map(lesson => lesson.module))];

  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lesson.module.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesModule = selectedModule === 'all' || lesson.module === selectedModule;
    return matchesSearch && matchesModule;
  }).map(lesson => ({
    ...lesson,
    icon: getIconForType(lesson.type)
  }));

  const getTypeColor = (type) => {
    if (type === 'Lesson') return isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800';
    if (type === 'Quiz') return isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800';
    return isDark ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-800';
  };

  const handleNext = (e) => {
    e.preventDefault();
    setCreateStep(2);
  };

  // Image Upload Handlers
  const handleCardImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setCurrentCardImages(prev => [...prev, ...files]);
  };

  const handleRemoveCardImage = (index) => {
    setCurrentCardImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddCard = () => {
    if (!currentCard.heading || !currentCard.content) return;

    if (editingCardIndex !== null) {
      const updatedCards = [...contentCards];
      updatedCards[editingCardIndex] = {
        heading: currentCard.heading,
        content: currentCard.content,
        images: currentCardImages.map(file => ({
          file,
          preview: typeof file === 'string' ? file : URL.createObjectURL(file),
          caption: ''
        })),
        order: editingCardIndex
      };
      setContentCards(updatedCards);
      setEditingCardIndex(null);
    } else {
      const newCard = {
        heading: currentCard.heading,
        content: currentCard.content,
        images: currentCardImages.map(file => ({
          file,
          preview: URL.createObjectURL(file),
          caption: ''
        })),
        order: contentCards.length
      };
      setContentCards(prev => [...prev, newCard]);
    }

    setCurrentCard({ heading: '', content: '', images: [], order: 0 });
    setCurrentCardImages([]);
  };

  const handleRemoveCard = (index) => {
    setContentCards(prev => prev.filter((_, i) => i !== index));
  };

  const handleEditCard = (index) => {
    const card = contentCards[index];
    setCurrentCard({
      heading: card.heading,
      content: card.content,
      images: card.images,
      order: card.order
    });
    setCurrentCardImages(card.images.map(img => img.file));
    setEditingCardIndex(index);
  };

  const handleCancelEditCard = () => {
    setCurrentCard({ heading: '', content: '', images: [], order: 0 });
    setCurrentCardImages([]);
    setEditingCardIndex(null);
  };

  const handleAddQuestion = () => {
    if (currentQuestion.question && currentQuestion.options.every(opt => opt) && currentQuestion.answer) {
      if (editingQuestionId !== null) {
        setQuizQuestions(prev =>
          prev.map(q => q.id === editingQuestionId ? { ...currentQuestion, id: editingQuestionId } : q)
        );
        setEditingQuestionId(null);
      } else {
        setQuizQuestions(prev => [...prev, { ...currentQuestion, id: Date.now() }]);
      }
      setCurrentQuestion({
        question: '',
        options: ['', '', '', ''],
        answer: '',
        explanation: ''
      });
    }
  };

  const handleRemoveQuestion = (id) => {
    setQuizQuestions(prev => prev.filter(q => q.id !== id));
    if (editingQuestionId === id) {
      setEditingQuestionId(null);
      setCurrentQuestion({
        question: '',
        options: ['', '', '', ''],
        answer: '',
        explanation: ''
      });
    }
  };

  const handleEditQuestion = (question) => {
    setEditingQuestionId(question.id);
    setCurrentQuestion({
      question: question.question,
      options: question.options,
      answer: question.answer,
      explanation: question.explanation
    });
  };

  const handleCancelEditQuestion = () => {
    setEditingQuestionId(null);
    setCurrentQuestion({
      question: '',
      options: ['', '', '', ''],
      answer: '',
      explanation: ''
    });
  };

  const handleDownloadTemplate = () => {
    const link = document.createElement('a');
    link.href = '/Questions_Template.csv';
    link.download = 'Questions_Template.csv';
    link.click();
  };

  const handleBulkCsvAdd = () => {
    if (!bulkFile) {
      alert('Please select a CSV file first.');
      return;
    }

    Papa.parse(bulkFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const newQuestions = [];
          let index = 0;

          for (const row of results.data) {
            const options = [
              row.option1,
              row.option2,
              row.option3,
              row.option4
            ].filter(opt => opt && opt.trim() !== '');

            if (!row.question || options.length < 2 || !row.answer || !row.explanation) {
              throw new Error(`Row ${index + 1} is missing required fields. Make sure you have 'question', 'answer', 'explanation', and at least two options.`);
            }
            if (!options.includes(row.answer)) {
              throw new Error(`The answer "${row.answer}" for question "${row.question}" (Row ${index + 1}) is not listed in its options.`);
            }

            newQuestions.push({
              question: row.question,
              options: options,
              answer: row.answer,
              explanation: row.explanation,
              id: Date.now() + index++
            });
          }

          setQuizQuestions(prev => [...prev, ...newQuestions]);
          setBulkFile(null);
          const fileInput = document.querySelector('input[type="file"]');
          if (fileInput) fileInput.value = null;

          alert(`Successfully added ${newQuestions.length} questions!`);

        } catch (error) {
          console.error('Error processing CSV:', error);
          alert(`Failed to add bulk questions: ${error.message}`);
        }
      },
      error: (error) => {
        console.error('Error parsing CSV file:', error);
        alert(`Failed to parse CSV file: ${error.message}`);
      }
    });
  };

  const handleQuestionChange = (field, value, optionIndex = null) => {
    if (field === 'options' && optionIndex !== null) {
      const newOptions = [...currentQuestion.options];
      newOptions[optionIndex] = value;
      setCurrentQuestion(prev => ({ ...prev, options: newOptions }));
    } else {
      setCurrentQuestion(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleCreateLesson = async () => {
    try {
      setLoading(true);
      setError(null);

      let uploadedCards = [];
      let processedVideoData = { ...videoData };

      if (formData.type === 'Lesson') {
        if (contentCards.length === 0) {
          setError('Please add at least one content card');
          setLoading(false);
          return;
        }

        uploadedCards = await Promise.all(
          contentCards.map(async (card) => {
            const cardImages = [];

            if (card.images && card.images.length > 0) {
              for (const img of card.images) {
                if (img.file instanceof File) {
                  try {
                    const uploadResponse = await uploadCardImages([img.file]);
                    if (uploadResponse.success) {
                      cardImages.push(...uploadResponse.data);
                    }
                  } catch (uploadError) {
                    console.error('Image upload error:', uploadError);
                    throw new Error(`Failed to upload image: ${uploadError.message}`);
                  }
                } else if (typeof img.file === 'string') {
                  cardImages.push({
                    url: img.file,
                    cloudinaryPublicId: img.cloudinaryPublicId || '',
                    caption: img.caption || ''
                  });
                }
              }
            }

            return {
              heading: card.heading,
              content: card.content,
              images: cardImages,
              order: card.order
            };
          })
        );
      }

      if (formData.type === 'Video') {
        if (!videoData.videoUrl && !videoData.videoFile) {
          setError('Please provide a video URL or upload a video file');
          setLoading(false);
          return;
        }

        if (videoData.videoFile instanceof File) {
          try {
            const uploadResponse = await uploadVideo(videoData.videoFile);
            if (uploadResponse.success) {
              processedVideoData = {
                videoUrl: uploadResponse.data.videoUrl,
                cloudinaryPublicId: uploadResponse.data.cloudinaryPublicId,
                description: videoData.description,
                transcript: videoData.transcript
              };
            }
          } catch (uploadError) {
            console.error('Video upload error:', uploadError);
            setError(`Failed to upload video: ${uploadError.message}`);
            setLoading(false);
            return;
          }
        } else {
          processedVideoData = {
            videoUrl: videoData.videoUrl,
            description: videoData.description,
            transcript: videoData.transcript
          };
        }
      }

      if (formData.type === 'Quiz' && quizQuestions.length === 0) {
        setError('Please add at least one quiz question');
        setLoading(false);
        return;
      }

      const lessonPayload = {
        title: formData.title,
        subject: formData.subject,
        module: formData.module,
        type: formData.type,
        duration: formData.duration,
        contentCards: formData.type === 'Lesson' ? JSON.stringify(uploadedCards) : JSON.stringify([]),
        quizQuestions: formData.type === 'Quiz' ? JSON.stringify(quizQuestions) : JSON.stringify([]),
        videoContent: formData.type === 'Video' ? JSON.stringify(processedVideoData) : JSON.stringify({}),
        status: 'Published'
      };

      if (editMode && editingLesson) {
        await updateLesson(editingLesson._id, lessonPayload);
        setSuccess('Lesson updated successfully!');
      } else {
        await createLesson(lessonPayload);
        setSuccess('Lesson created successfully!');
      }

      await fetchLessons();
      handleCancel();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error saving lesson:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save lesson';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowCreateModal(false);
    setEditMode(false);
    setEditingLesson(null);
    setCreateStep(1);
    setFormData({
      title: '',
      module: '',
      type: 'Lesson',
      duration: '',
      subject: selectedSubject
    });
    setContentCards([]);
    setCurrentCard({ heading: '', content: '', images: [], order: 0 });
    setCurrentCardImages([]);
    setQuizQuestions([]);
    setCurrentQuestion({
      question: '',
      options: ['', '', '', ''],
      answer: '',
      explanation: ''
    });
    setEditingQuestionId(null);
    setVideoData({
      videoFile: null,
      videoUrl: '',
      description: '',
      transcript: ''
    });
    setBulkFile(null);
  };

  const handleEdit = (lesson) => {
    setEditMode(true);
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title,
      module: lesson.module,
      type: lesson.type,
      duration: lesson.duration,
      subject: lesson.subject
    });

    if (lesson.type === 'Lesson' && lesson.contentCards) {
      const parsedCards = lesson.contentCards.map((card, index) => ({
        heading: card.heading,
        content: card.content,
        images: card.images?.map(img => ({
          file: img.url,
          preview: img.url,
          caption: img.caption || '',
          cloudinaryPublicId: img.cloudinaryPublicId || ''
        })) || [],
        order: index
      }));
      setContentCards(parsedCards);
    }

    if (lesson.type === 'Quiz' && lesson.quizQuestions) {
      setQuizQuestions(lesson.quizQuestions);
    }

    if (lesson.type === 'Video' && lesson.videoContent) {
      setVideoData(lesson.videoContent);
    }

    setShowCreateModal(true);
    setCreateStep(2);
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Are you sure you want to delete this lesson?')) return;

    try {
      setLoading(true);
      await deleteLesson(lessonId);
      setSuccess('Lesson deleted successfully!');
      await fetchLessons();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error deleting lesson:', error);
      setError(error.response?.data?.message || 'Failed to delete lesson');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'duration') {
      const numericValue = value.replace(/\D/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: numericValue ? `${numericValue} min` : ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const canProceedToStep2 = () => {
    if (formData.type === 'Lesson') return contentCards.length > 0;
    if (formData.type === 'Quiz') return quizQuestions.length > 0;
    if (formData.type === 'Video') return videoData.videoUrl || videoData.videoFile;
    return false;
  };

  return (
    <div>
      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-100 border border-red-400 text-red-700">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 rounded-lg bg-green-100 border border-green-400 text-green-700">
          <div className="flex items-center justify-between">
            <span>{success}</span>
            <button onClick={() => setSuccess(null)} className="text-green-700 hover:text-green-900">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
            Learning Content Management
          </h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Create and organize learning modules and lessons for your assigned subjects
          </p>
        </div>
        {subjects.length > 0 && (
          <div className="flex gap-3 mt-4 md:mt-0">
            <button
              onClick={handleDownloadTemplate}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                isDark
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              <Download className="w-5 h-5" />
              Download Template
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                isDark
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <Plus className="w-5 h-5" />
              Add Content
            </button>
          </div>
        )}
      </div>

      {loading && subjects.length === 0 ? (
        <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border shadow-sm p-12 text-center`}>
          <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Loading subjects...
          </p>
        </div>
      ) : subjects.length === 0 ? (
        <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border shadow-sm p-12 text-center`}>
          <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            No subjects assigned yet. Please contact an administrator to assign subjects to your account.
          </p>
        </div>
      ) : (
        <>
          <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
            {subjects.map((subject, index) => (
              <div className="relative">
                <button
                  key={index}
                  onClick={() => setSelectedSubject(subject.name)}
                  className={`px-6 py-4 rounded-xl border transition-all whitespace-nowrap w-full ${
                    selectedSubject === subject.name
                      ? isDark
                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg'
                        : 'bg-blue-600 border-blue-500 text-white shadow-lg'
                      : isDark
                      ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="text-left">
                      <div className={`font-semibold mb-1 ${
                        selectedSubject === subject.name ? 'text-white' : isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {subject.name}
                      </div>
                      <div className={`text-xs ${
                        selectedSubject === subject.name ? 'text-blue-100' : isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {subject.lessons} lessons · {subject.students} students
                      </div>
                    </div>
                  </div>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/instructor/learning/users/${encodeURIComponent(subject.name)}`);
                  }}
                  className={`absolute top-2 right-2 p-1.5 rounded-lg ${
                    isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-white hover:bg-gray-100 text-gray-600'
                  } shadow-sm`}
                  title="View Subject Users"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border shadow-sm`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    placeholder="Search lessons..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                <select
                  value={selectedModule}
                  onChange={(e) => setSelectedModule(e.target.value)}
                  className={`px-4 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  {uniqueModules.map((module, index) => (
                    <option key={index} value={module}>
                      {module === 'all' ? 'All Modules' : module}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <tr>
                    <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                      Order
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                      Content
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                      Module
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                      Type
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                      Performance
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredLessons.map((lesson) => {
                    const Icon = lesson.icon;
                    return (
                      <tr key={lesson._id} className={`${isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'} transition-colors`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button className={`p-1 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <span className={`font-mono text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                              {lesson.order}
                            </span>
                            <button className={`p-1 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                              <ArrowDown className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                              <Icon className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                            </div>
                            <div>
                              <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {lesson.title}
                              </div>
                              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {lesson.duration}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                          {lesson.module}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getTypeColor(lesson.type)}`}>
                            {lesson.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                            <div className="mb-1">{lesson.completions} completions</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => navigate(`/instructor/learning/metrics/${lesson._id}`)}
                              className={`p-2 rounded-lg ${
                                isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                              } transition-colors`}
                              title="View Metrics"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(lesson)}
                              className={`p-2 rounded-lg ${
                                isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                              } transition-colors`}
                              title="Edit Content"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteLesson(lesson._id)}
                              className={`p-2 rounded-lg ${
                                isDark ? 'hover:bg-red-900/20 text-red-400' : 'hover:bg-red-50 text-red-600'
                              } transition-colors`}
                              title="Delete Content"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className={`px-6 py-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Showing {filteredLessons.length} lessons in {selectedSubject}
              </p>
              <div className="flex gap-2">
                <button
                  className={`px-4 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                      : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                  } transition-colors`}
                >
                  Previous
                </button>
                <button
                  className={`px-4 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                      : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                  } transition-colors`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* Create/Edit Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
                <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {editMode ? 'Edit Lesson' : 'Create New Lesson'}
                  </h2>
                  <button
                    onClick={handleCancel}
                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'} transition-colors`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {createStep === 1 ? (
                  <form onSubmit={handleNext} className="p-6 space-y-6">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Subject
                      </label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      >
                        {subjects.map((subject, index) => (
                          <option key={index} value={subject.name}>
                            {subject.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Lesson Title
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., Introduction to Finite Automata"
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Module
                      </label>
                      <input
                        type="text"
                        name="module"
                        value={formData.module}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., Finite Automata"
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Content Type
                      </label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        required
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      >
                        <option value="Lesson">Lesson</option>
                        <option value="Quiz">Quiz</option>
                        <option value="Video">Video</option>
                      </select>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Duration (Minutes)
                      </label>
                      <input
                        type="text"
                        name="duration"
                        value={formData.duration}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., 25"
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={handleCancel}
                        className={`flex-1 px-6 py-3 rounded-lg border font-medium transition-all ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                            : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-6 py-3 rounded-lg font-medium transition-all bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Next
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="p-6 space-y-6">
                    <div className={`p-4 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Lesson Details
                      </h3>
                      <div className={`text-sm space-y-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        <p><strong>Title:</strong> {formData.title}</p>
                        <p><strong>Module:</strong> {formData.module}</p>
                        <p><strong>Type:</strong> {formData.type}</p>
                        <p><strong>Duration:</strong> {formData.duration}</p>
                      </div>
                    </div>

                    {/* LESSON CONTENT WITH IMAGES */}
                    {formData.type === 'Lesson' && (
                      <div>
                        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          Content Cards ({contentCards.length})
                        </h3>

                        {contentCards.length > 0 && (
                          <div className="space-y-3 mb-6">
                            {contentCards.map((card, index) => (
                              <div
                                key={index}
                                className={`p-4 rounded-lg border ${
                                  isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                                }`}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {card.heading}
                                  </h4>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleEditCard(index)}
                                      className={`p-1 rounded ${
                                        isDark ? 'hover:bg-gray-600 text-blue-400' : 'hover:bg-gray-100 text-blue-600'
                                      }`}
                                      title="Edit Card"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleRemoveCard(index)}
                                      className={`p-1 rounded ${
                                        isDark ? 'hover:bg-gray-600 text-red-400' : 'hover:bg-gray-100 text-red-600'
                                      }`}
                                      title="Delete Card"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                                <p className={`text-sm whitespace-pre-line mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                  {card.content.length > 150 ? card.content.substring(0, 150) + '...' : card.content}
                                </p>
                                {card.images && card.images.length > 0 && (
                                  <div className="flex gap-2 mt-2 flex-wrap">
                                    {card.images.map((img, i) => (
                                      <img
                                        key={i}
                                        src={img.preview}
                                        alt={`Preview ${i + 1}`}
                                        className="w-20 h-20 object-cover rounded border"
                                      />
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="space-y-4">
                          <div>
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              Card Heading
                            </label>
                            <input
                              type="text"
                              value={currentCard.heading}
                              onChange={(e) => setCurrentCard({ ...currentCard, heading: e.target.value })}
                              placeholder="e.g., What are Formal Languages?"
                              className={`w-full px-4 py-2 rounded-lg border ${
                                isDark
                                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                          </div>

                          <div>
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              Card Content
                            </label>
                            <textarea
                              value={currentCard.content}
                              onChange={(e) => setCurrentCard({ ...currentCard, content: e.target.value })}
                              placeholder="Enter the detailed content for this section..."
                              rows={8}
                              className={`w-full px-4 py-2 rounded-lg border ${
                                isDark
                                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                              } focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical`}
                            />
                          </div>

                          <div>
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              Images (Optional)
                            </label>
                            <div className={`border-2 border-dashed rounded-lg p-6 ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'}`}>
                              <div className="flex items-center justify-center mb-4">
                                <ImageIcon className={`w-8 h-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                              </div>
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleCardImageUpload}
                                className="hidden"
                                id="card-images"
                              />
                              <label
                                htmlFor="card-images"
                                className={`cursor-pointer px-4 py-2 rounded-lg font-medium block text-center ${
                                  isDark
                                    ? 'bg-gray-600 hover:bg-gray-500 text-white'
                                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                                }`}
                              >
                                Choose Images
                              </label>
                              {currentCardImages.length > 0 && (
                                <div className="mt-4 grid grid-cols-3 gap-2">
                                      {currentCardImages.map((file, index) => (
                                    <div key={index} className="relative">
                                      <img
                                        src={typeof file === 'string' ? file : URL.createObjectURL(file)}
                                        alt={`Preview ${index + 1}`}
                                        className="w-full h-24 object-cover rounded"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveCardImage(index)}
                                        className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-3">
                            {editingCardIndex !== null && (
                              <button
                                type="button"
                                onClick={handleCancelEditCard}
                                className={`flex-1 px-4 py-2 rounded-lg border font-medium transition-all ${
                                  isDark
                                    ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                                    : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                                }`}
                              >
                                Cancel
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={handleAddCard}
                              disabled={!currentCard.heading || !currentCard.content}
                              className={`${
                                editingCardIndex !== null ? 'flex-1' : 'w-full'
                              } px-4 py-2 rounded-lg border-2 border-dashed font-medium transition-all ${
                                currentCard.heading && currentCard.content
                                  ? isDark
                                    ? 'border-blue-600 text-blue-400 hover:bg-blue-600/10'
                                    : 'border-blue-600 text-blue-600 hover:bg-blue-50'
                                  : isDark
                                    ? 'border-gray-600 text-gray-500 cursor-not-allowed'
                                    : 'border-gray-300 text-gray-400 cursor-not-allowed'
                              }`}
                            >
                              <Plus className="w-5 h-5 inline mr-2" />
                              {editingCardIndex !== null ? 'Update Card' : 'Add Card'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* QUIZ SECTION */}
                    {formData.type === 'Quiz' && (
                      <div>
                        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          Quiz Questions ({quizQuestions.length})
                        </h3>

                        {quizQuestions.length > 0 && (
                          <div className="space-y-3 mb-6">
                            {quizQuestions.map((q, index) => (
                              <div
                                key={q.id}
                                className={`p-4 rounded-lg border ${
                                  isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                                }`}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Question {index + 1}
                                  </h4>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleEditQuestion(q)}
                                      className={`p-1 rounded ${
                                        isDark ? 'hover:bg-gray-600 text-blue-400' : 'hover:bg-gray-100 text-blue-600'
                                      }`}
                                      title="Edit Question"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleRemoveQuestion(q.id)}
                                      className={`p-1 rounded ${
                                        isDark ? 'hover:bg-gray-600 text-red-400' : 'hover:bg-gray-100 text-red-600'
                                      }`}
                                      title="Delete Question"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                                <p className={`text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                  {q.question}
                                </p>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  {q.options.map((opt, i) => (
                                    <div
                                      key={i}
                                      className={`px-2 py-1 rounded ${
                                        opt === q.answer
                                          ? isDark
                                            ? 'bg-green-900/30 text-green-400'
                                            : 'bg-green-100 text-green-800'
                                          : isDark
                                          ? 'bg-gray-600 text-gray-300'
                                          : 'bg-gray-200 text-gray-700'
                                      }`}
                                    >
                                      {i + 1}. {opt}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="space-y-4">
                          <div>
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              Question
                            </label>
                            <textarea
                              value={currentQuestion.question}
                              onChange={(e) => handleQuestionChange('question', e.target.value)}
                              placeholder="Enter the question"
                              rows={3}
                              className={`w-full px-4 py-2 rounded-lg border ${
                                isDark
                                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            {currentQuestion.options.map((option, index) => (
                              <div key={index}>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                  Option {index + 1}
                                </label>
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) => handleQuestionChange('options', e.target.value, index)}
                                  placeholder={`Enter option ${index + 1}`}
                                  className={`w-full px-4 py-2 rounded-lg border ${
                                    isDark
                                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                />
                              </div>
                            ))}
                          </div>

                          <div>
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              Correct Answer
                            </label>
                            <select
                              value={currentQuestion.answer}
                              onChange={(e) => handleQuestionChange('answer', e.target.value)}
                              className={`w-full px-4 py-2 rounded-lg border ${
                                isDark
                                  ? 'bg-gray-700 border-gray-600 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            >
                              <option value="">Select correct answer</option>
                              {currentQuestion.options.map((option, index) => (
                                <option key={index} value={option} disabled={!option}>
                                  Option {index + 1}: {option || '(empty)'}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              Explanation (Optional)
                            </label>
                            <textarea
                              value={currentQuestion.explanation}
                              onChange={(e) => handleQuestionChange('explanation', e.target.value)}
                              placeholder="Explain why this is the correct answer..."
                              rows={3}
                              className={`w-full px-4 py-2 rounded-lg border ${
                                isDark
                                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                          </div>

                          <div className="flex gap-3">
                            {editingQuestionId !== null && (
                              <button
                                type="button"
                                onClick={handleCancelEditQuestion}
                                className={`flex-1 px-4 py-2 rounded-lg border font-medium transition-all ${
                                  isDark
                                    ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                                    : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                                }`}
                              >
                                Cancel
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={handleAddQuestion}
                              disabled={!currentQuestion.question || !currentQuestion.options.every(opt => opt) || !currentQuestion.answer}
                              className={`${
                                editingQuestionId !== null ? 'flex-1' : 'w-full'
                              } px-4 py-2 rounded-lg border-2 border-dashed font-medium transition-all ${
                                currentQuestion.question && currentQuestion.options.every(opt => opt) && currentQuestion.answer
                                  ? isDark
                                    ? 'border-blue-600 text-blue-400 hover:bg-blue-600/10'
                                    : 'border-blue-600 text-blue-600 hover:bg-blue-50'
                                  : isDark
                                    ? 'border-gray-600 text-gray-500 cursor-not-allowed'
                                    : 'border-gray-300 text-gray-400 cursor-not-allowed'
                              }`}
                            >
                              <Plus className="w-5 h-5 inline mr-2" />
                              {editingQuestionId !== null ? 'Update Question' : 'Add Question'}
                            </button>
                          </div>
                        </div>

                        <div className={`mt-6 ${
                          isDark ? 'bg-gray-700/50' : 'bg-gray-50'
                        } rounded-lg p-4 border ${
                          isDark ? 'border-gray-600' : 'border-gray-200'
                        }`}>
                          <h3 className={`text-lg font-semibold mb-4 ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}>
                            Bulk Add via CSV
                          </h3>
                          <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Upload a CSV file with columns: <b>question</b>, <b>option1</b>, <b>option2</b>, <b>option3</b>, <b>option4</b>, <b>answer</b>, <b>explanation</b>.
                          </p>
                          <p className={`text-xs mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Note: The <b>answer</b> must exactly match the text in one of the option columns.
                          </p>

                          <input
                            type="file"
                            accept=".csv"
                            onChange={(e) => setBulkFile(e.target.files[0])}
                            className={`w-full px-4 py-2 rounded-lg border ${
                              isDark
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            } file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0
                              file:text-sm file:font-semibold
                              ${isDark ? 'file:bg-blue-600 file:text-white hover:file:bg-blue-700' : 'file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200'}
                            `}
                          />
                          <button
                            onClick={handleBulkCsvAdd}
                            disabled={!bulkFile}
                            className={`mt-3 w-full px-6 py-3 rounded-lg font-medium transition-all ${
                              isDark
                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                : 'bg-green-600 hover:bg-green-700 text-white'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            <Plus className="w-5 h-5 inline mr-2" />
                            Add Questions from CSV
                          </button>
                        </div>
                      </div>
                    )}

                    {/* VIDEO SECTION */}
                    {formData.type === 'Video' && (
                      <div>
                        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          Video Content
                        </h3>

                        <div className="space-y-4">
                          <div>
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              Video URL
                            </label>
                            <input
                              type="url"
                              value={videoData.videoUrl}
                              onChange={(e) => setVideoData({ ...videoData, videoUrl: e.target.value })}
                              placeholder="https://youtube.com/watch?v=..."
                              className={`w-full px-4 py-2 rounded-lg border ${
                                isDark
                                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                          </div>

                          <div className="text-center">
                            <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>OR</p>
                          </div>

                          <div>
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              Upload Video File
                            </label>
                            <div className={`border-2 border-dashed rounded-lg p-8 text-center ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
                              <Upload className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                              <input
                                type="file"
                                accept="video/*"
                                onChange={(e) => setVideoData({ ...videoData, videoFile: e.target.files[0] })}
                                className="hidden"
                                id="video-upload"
                              />
                              <label
                                htmlFor="video-upload"
                                className={`cursor-pointer px-4 py-2 rounded-lg font-medium ${
                                  isDark
                                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                                }`}
                              >
                                Choose File
                              </label>
                              {videoData.videoFile && (
                                <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                  Selected: {videoData.videoFile.name}
                                </p>
                              )}
                            </div>
                          </div>

                          <div>
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              Description
                            </label>
                            <textarea
                              value={videoData.description}
                              onChange={(e) => setVideoData({ ...videoData, description: e.target.value })}
                              placeholder="Describe what this video covers..."
                              rows={4}
                              className={`w-full px-4 py-2 rounded-lg border ${
                                isDark
                                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                          </div>

                          <div>
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              Transcript (Optional)
                            </label>
                            <textarea
                              value={videoData.transcript}
                              onChange={(e) => setVideoData({ ...videoData, transcript: e.target.value })}
                              placeholder="Paste the video transcript here..."
                              rows={6}
                              className={`w-full px-4 py-2 rounded-lg border ${
                                isDark
                                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className={`flex gap-3 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                      <button
                        type="button"
                        onClick={() => setCreateStep(1)}
                        className={`flex-1 px-6 py-3 rounded-lg border font-medium transition-all ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                            : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={handleCreateLesson}
                        disabled={!canProceedToStep2()}
                        className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                          canProceedToStep2()
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : isDark
                              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {editMode ? 'Update Lesson' : 'Create Lesson'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Add Subject Modal */}
          {showAddSubjectModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl max-w-2xl w-full`}>
                <div className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} p-6 flex items-center justify-between`}>
                  <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Add New Subject
                  </h2>
                  <button
                    onClick={() => {
                      setShowAddSubjectModal(false);
                      setNewSubject({ name: '', description: '', icon: '' });
                    }}
                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Subject Name
                    </label>
                    <input
                      type="text"
                      value={newSubject.name}
                      onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                      placeholder="e.g., Theory of Computation"
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Description
                    </label>
                    <textarea
                      value={newSubject.description}
                      onChange={(e) => setNewSubject({ ...newSubject, description: e.target.value })}
                      placeholder="Describe what this subject covers..."
                      rows={4}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Icon (Emoji)
                    </label>
                    <input
                      type="text"
                      value={newSubject.icon}
                      onChange={(e) => setNewSubject({ ...newSubject, icon: e.target.value })}
                      placeholder="📚"
                      maxLength={2}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                      Enter an emoji to represent this subject
                    </p>
                  </div>
                </div>

                <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} p-6 flex gap-3 justify-end`}>
                  <button
                    onClick={() => {
                      setShowAddSubjectModal(false);
                      setNewSubject({ name: '', description: '', icon: '' });
                    }}
                    className={`px-6 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                        : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                    } transition-colors`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      console.log('Adding subject:', newSubject);
                      setShowAddSubjectModal(false);
                      setNewSubject({ name: '', description: '', icon: '' });
                    }}
                    disabled={!newSubject.name || !newSubject.description}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      !newSubject.name || !newSubject.description
                        ? 'bg-gray-400 cursor-not-allowed text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    Add Subject
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LearningContentManagement;