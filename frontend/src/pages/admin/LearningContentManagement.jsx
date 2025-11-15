import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
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
  Eye
} from 'lucide-react';
import {
  getAllSubjects,
  createSubject,
  updateSubject,
  deleteSubject
} from '../../api/subjectService';
import { getAllLessons } from '../../api/lessonService';
import { useNavigate } from 'react-router-dom';

const LearningContentManagement = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedModule, setSelectedModule] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '', description: '', icon: '', image: null });
  const [editMode, setEditMode] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [editingSubject, setEditingSubject] = useState(null);
  const [showDeleteSubjectModal, setShowDeleteSubjectModal] = useState(false);
  const [deletingSubject, setDeletingSubject] = useState(null);
  const [createStep, setCreateStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    module: '',
    type: 'Lesson',
    duration: '',
    subject: ''
  });
  const [contentCards, setContentCards] = useState([]);
  const [currentCard, setCurrentCard] = useState({
    heading: '',
    content: ''
  });
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    answer: '',
    explanation: ''
  });
  const [videoData, setVideoData] = useState({
    videoFile: null,
    videoUrl: '',
    description: '',
    transcript: ''
  });

  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await getAllSubjects();
      if (response.success) {
        setSubjects(response.data);
        if (response.data.length > 0 && !selectedSubject) {
          setSelectedSubject(response.data[0].name);
          setFormData(prev => ({ ...prev, subject: response.data[0].name }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
      setError('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubject = async () => {
    if (!newSubject.name || !newSubject.description || !newSubject.image) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('name', newSubject.name);
      formData.append('description', newSubject.description);
      if (newSubject.image) formData.append('image', newSubject.image);

      const response = await createSubject(formData);
      if (response.success) {
        await fetchSubjects();
        setShowAddSubjectModal(false);
        setNewSubject({ name: '', description: '', icon: '', image: null });
        setEditingSubject(null);
      }
    } catch (error) {
      console.error('Failed to create subject:', error);
      setError(error.response?.data?.message || 'Failed to create subject');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubject = async () => {
    if (!newSubject.name || !newSubject.description || !editingSubject) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('name', newSubject.name);
      formData.append('description', newSubject.description);
      if (newSubject.image) formData.append('image', newSubject.image);

      const response = await updateSubject(editingSubject._id, formData);
      if (response.success) {
        await fetchSubjects();
        if (selectedSubject === editingSubject.name) {
          setSelectedSubject(newSubject.name);
        }
        setShowAddSubjectModal(false);
        setNewSubject({ name: '', description: '', icon: '', image: null });
        setEditingSubject(null);
      }
    } catch (error) {
      console.error('Failed to update subject:', error);
      setError(error.response?.data?.message || 'Failed to update subject');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubject = async () => {
    if (!deletingSubject) return;

    try {
      setLoading(true);
      const response = await deleteSubject(deletingSubject._id);
      if (response.success) {
        await fetchSubjects();
        if (selectedSubject === deletingSubject.name) {
          const remainingSubjects = subjects.filter(s => s._id !== deletingSubject._id);
          setSelectedSubject(remainingSubjects.length > 0 ? remainingSubjects[0].name : '');
        }
        setShowDeleteSubjectModal(false);
        setDeletingSubject(null);
      }
    } catch (error) {
      console.error('Failed to delete subject:', error);
      setError(error.response?.data?.message || 'Failed to delete subject');
    } finally {
      setLoading(false);
    }
  };

  const [allLessons, setAllLessons] = useState([]);

  const fetchLessonsForSubject = useCallback(async () => {
    if (!selectedSubject) return;
    try {
      const response = await getAllLessons({ subject: selectedSubject });
      setAllLessons(response.data || []);
    } catch (error) {
      console.error('Failed to fetch lessons:', error);
      setAllLessons([]);
    }
  }, [selectedSubject]);

  useEffect(() => {
    fetchLessonsForSubject();
  }, [fetchLessonsForSubject]);

  const lessons = allLessons;

  const uniqueModules = ['all', ...new Set(lessons.map(lesson => lesson.module))];

  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lesson.module.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesModule = selectedModule === 'all' || lesson.module === selectedModule;
    return matchesSearch && matchesModule;
  });

  const getTypeColor = (type) => {
    if (type === 'Lesson') return isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800';
    if (type === 'Quiz') return isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800';
    return isDark ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-800';
  };

  const handleNext = (e) => {
    e.preventDefault();
    setCreateStep(2);
  };

  const handleAddCard = () => {
    if (currentCard.heading && currentCard.content) {
      setContentCards([...contentCards, currentCard]);
      setCurrentCard({ heading: '', content: '' });
    }
  };

  const handleRemoveCard = (index) => {
    setContentCards(contentCards.filter((_, i) => i !== index));
  };

  const handleAddQuestion = () => {
    if (currentQuestion.question && currentQuestion.options.every(opt => opt) && currentQuestion.answer) {
      setQuizQuestions([...quizQuestions, { ...currentQuestion, id: Date.now() }]);
      setCurrentQuestion({
        question: '',
        options: ['', '', '', ''],
        answer: '',
        explanation: ''
      });
    }
  };

  const handleRemoveQuestion = (id) => {
    setQuizQuestions(quizQuestions.filter(q => q.id !== id));
  };

  const handleQuestionChange = (field, value, optionIndex = null) => {
    if (field === 'options' && optionIndex !== null) {
      const newOptions = [...currentQuestion.options];
      newOptions[optionIndex] = value;
      setCurrentQuestion({ ...currentQuestion, options: newOptions });
    } else {
      setCurrentQuestion({ ...currentQuestion, [field]: value });
    }
  };

  const handleCreateLesson = () => {
    const lessonData = {
      ...formData,
      content: formData.type === 'Lesson' ? { sections: contentCards } :
               formData.type === 'Quiz' ? { questions: quizQuestions } :
               videoData
    };

    console.log(editMode ? 'Updating lesson:' : 'Creating lesson:', lessonData);
    handleCancel();
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
    setCurrentCard({ heading: '', content: '' });
    setQuizQuestions([]);
    setCurrentQuestion({
      question: '',
      options: ['', '', '', ''],
      answer: '',
      explanation: ''
    });
    setVideoData({
      videoFile: null,
      videoUrl: '',
      description: '',
      transcript: ''
    });
  };

  const handleEdit = (lesson) => {
    setEditMode(true);
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title,
      module: lesson.module,
      type: lesson.type,
      duration: lesson.duration,
      subject: selectedSubject
    });
    setShowCreateModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const canProceedToStep2 = () => {
    if (formData.type === 'Lesson') {
      return contentCards.length > 0;
    } else if (formData.type === 'Quiz') {
      return quizQuestions.length > 0;
    } else if (formData.type === 'Video') {
      return videoData.videoUrl || videoData.videoFile;
    }
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
            Learning Content Management
          </h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Create and organize learning modules and lessons
          </p>
        </div>
        <button
          onClick={() => setShowAddSubjectModal(true)}
          className={`mt-4 md:mt-0 flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            isDark
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          <Plus className="w-5 h-5" />
          Add New Subject
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        {loading && subjects.length === 0 ? (
          <div className={`col-span-full text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Loading subjects...
          </div>
        ) : subjects.length === 0 ? (
          <div className={`col-span-full text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            No subjects found. Click "Add New Subject" to create one.
          </div>
        ) : (
          subjects.map((subject, index) => (
            <div
              key={subject._id || index}
              className={`relative group rounded-xl border transition-all ${
                selectedSubject === subject.name
                  ? isDark
                    ? 'bg-blue-600 border-blue-500 shadow-lg'
                    : 'bg-blue-600 border-blue-500 shadow-lg'
                  : isDark
                  ? 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              <button
                onClick={() => setSelectedSubject(subject.name)}
                className="w-full px-6 py-4 text-left"
              >
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
              </button>
            <div className={`absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingSubject(subject);
                  setNewSubject({
                    name: subject.name,
                    description: subject.description || '',
                    icon: subject.icon || '',
                    image: null
                  });
                  setShowAddSubjectModal(true);
                }}
                className={`p-1.5 rounded-lg ${
                  isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-white hover:bg-gray-100 text-gray-600'
                } shadow-sm`}
                title="Edit Subject"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDeletingSubject(subject);
                  setShowDeleteSubjectModal(true);
                }}
                className={`p-1.5 rounded-lg ${
                  isDark ? 'bg-red-900/50 hover:bg-red-900 text-red-400' : 'bg-red-50 hover:bg-red-100 text-red-600'
                } shadow-sm`}
                title="Delete Subject"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            </div>
          ))
        )}
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
              {filteredLessons.length === 0 ? (
                <tr>
                  <td colSpan="6" className={`px-6 py-12 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {loading ? 'Loading lessons...' : 'No lessons found for this subject'}
                  </td>
                </tr>
              ) : (
                filteredLessons.map((lesson, index) => {
                  const getIcon = (type) => {
                    if (type === 'Quiz') return CheckSquare;
                    if (type === 'Video') return VideoIcon;
                    return BookOpen;
                  };
                  const Icon = getIcon(lesson.type);

                  return (
                    <tr key={lesson._id} className={`${isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'} transition-colors`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            className={`p-1 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <span className={`font-mono text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                            {index + 1}
                          </span>
                          <button
                            className={`p-1 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                          >
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
                              {lesson.duration || 'N/A'}
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
                          <div className="mb-1">{lesson.completions || 0} completions</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/admin/learning/metrics/${lesson._id}`)}
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
                })
              )}
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
                  Duration
                </label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., 25 min"
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
                  <h3 className={`font-semibold mb-2 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    Lesson Details
                  </h3>
                  <div className={`text-sm space-y-1 ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    <p><strong>Title:</strong> {formData.title}</p>
                    <p><strong>Module:</strong> {formData.module}</p>
                    <p><strong>Type:</strong> {formData.type}</p>
                    <p><strong>Duration:</strong> {formData.duration}</p>
                  </div>
                </div>

                {formData.type === 'Lesson' && (
                  <div>
                    <h3 className={`text-lg font-semibold mb-4 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
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
                              <h4 className={`font-semibold ${
                                isDark ? 'text-white' : 'text-gray-900'
                              }`}>
                                {card.heading}
                              </h4>
                              <button
                                onClick={() => handleRemoveCard(index)}
                                className={`p-1 rounded ${
                                  isDark ? 'hover:bg-gray-600 text-red-400' : 'hover:bg-gray-100 text-red-600'
                                }`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <p className={`text-sm whitespace-pre-line ${
                              isDark ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                              {card.content.length > 150 ? card.content.substring(0, 150) + '...' : card.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="space-y-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>
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
                        <label className={`block text-sm font-medium mb-2 ${
                          isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>
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

                      <button
                        type="button"
                        onClick={handleAddCard}
                        disabled={!currentCard.heading || !currentCard.content}
                        className={`w-full px-4 py-2 rounded-lg border-2 border-dashed font-medium transition-all ${
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
                        Add Card
                      </button>
                    </div>
                  </div>
                )}

                {formData.type === 'Quiz' && (
                  <div>
                    <h3 className={`text-lg font-semibold mb-4 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
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
                              <h4 className={`font-semibold ${
                                isDark ? 'text-white' : 'text-gray-900'
                              }`}>
                                Question {index + 1}
                              </h4>
                              <button
                                onClick={() => handleRemoveQuestion(q.id)}
                                className={`p-1 rounded ${
                                  isDark ? 'hover:bg-gray-600 text-red-400' : 'hover:bg-gray-100 text-red-600'
                                }`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
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
                        <label className={`block text-sm font-medium mb-2 ${
                          isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>
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
                            <label className={`block text-sm font-medium mb-2 ${
                              isDark ? 'text-gray-300' : 'text-gray-700'
                            }`}>
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
                        <label className={`block text-sm font-medium mb-2 ${
                          isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>
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
                        <label className={`block text-sm font-medium mb-2 ${
                          isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>
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

                      <button
                        type="button"
                        onClick={handleAddQuestion}
                        disabled={!currentQuestion.question || !currentQuestion.options.every(opt => opt) || !currentQuestion.answer}
                        className={`w-full px-4 py-2 rounded-lg border-2 border-dashed font-medium transition-all ${
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
                        Add Question
                      </button>
                    </div>
                  </div>
                )}

                {formData.type === 'Video' && (
                  <div>
                    <h3 className={`text-lg font-semibold mb-4 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      Video Content
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>
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
                        <label className={`block text-sm font-medium mb-2 ${
                          isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Upload Video File
                        </label>
                        <div className={`border-2 border-dashed rounded-lg p-8 text-center ${
                          isDark ? 'border-gray-600' : 'border-gray-300'
                        }`}>
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
                        <label className={`block text-sm font-medium mb-2 ${
                          isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>
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
                        <label className={`block text-sm font-medium mb-2 ${
                          isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>
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

                <div className={`flex gap-3 pt-4 border-t ${
                  isDark ? 'border-gray-700' : 'border-gray-200'
                }`}>
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

      {showAddSubjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl max-w-2xl w-full`}>
            <div className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} p-6 flex items-center justify-between`}>
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {editingSubject ? 'Edit Subject' : 'Add New Subject'}
              </h2>
              <button
                onClick={() => {
                  setShowAddSubjectModal(false);
                  setNewSubject({ name: '', description: '', icon: '', image: null });
                  setEditingSubject(null);
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
                  Subject Image *
                </label>
                <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
                  isDark ? 'border-gray-600' : 'border-gray-300'
                }`}>
                  <Upload className={`w-8 h-8 mx-auto mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewSubject({ ...newSubject, image: e.target.files[0] })}
                    className="hidden"
                    id="subject-image-upload"
                  />
                  <label
                    htmlFor="subject-image-upload"
                    className={`cursor-pointer px-4 py-2 rounded-lg font-medium ${
                      isDark
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    }`}
                  >
                    Choose Image File
                  </label>
                  {newSubject.image && (
                    <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Selected: {newSubject.image.name}
                    </p>
                  )}
                </div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-2`}>
                  Upload an image to represent this subject
                </p>
              </div>
            </div>

            <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} p-6 flex gap-3 justify-end`}>
              <button
                onClick={() => {
                  setShowAddSubjectModal(false);
                  setNewSubject({ name: '', description: '', icon: '', image: null });
                  setEditingSubject(null);
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
                  if (editingSubject) {
                    handleUpdateSubject();
                  } else {
                    handleCreateSubject();
                  }
                }}
                disabled={!newSubject.name || !newSubject.description || !newSubject.image || loading}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  !newSubject.name || !newSubject.description || loading
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {loading ? 'Processing...' : editingSubject ? 'Update Subject' : 'Add Subject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteSubjectModal && deletingSubject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl max-w-md w-full`}>
            <div className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} p-6`}>
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Delete Subject
              </h2>
            </div>

            <div className="p-6">
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
                Are you sure you want to delete <strong>{deletingSubject.name}</strong>?
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                This will remove the subject and all its associated lessons ({deletingSubject.lessons} lessons). This action cannot be undone.
              </p>
            </div>

            <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} p-6 flex gap-3 justify-end`}>
              <button
                onClick={() => {
                  setShowDeleteSubjectModal(false);
                  setDeletingSubject(null);
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
                onClick={handleDeleteSubject}
                disabled={loading}
                className="px-6 py-2 rounded-lg font-medium bg-red-600 hover:bg-red-700 text-white transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Deleting...' : 'Delete Subject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningContentManagement;
