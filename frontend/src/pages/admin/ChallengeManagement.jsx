import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Copy,
  Filter,
  BarChart3,
  Star,
  X,
  ChevronRight,
  ChevronLeft,
  Download
} from 'lucide-react';
import * as challengeService from '../../api/challengeService';
import Papa from 'papaparse';

const ChallengeManagement = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);

  const [challengeData, setChallengeData] = useState({
    title: '',
    category: 'daily',
    difficulty: 'Easy',
    points: '',
    numberOfQuestions: '',
    description: '',
    startDate: '',
    startTime: '',
    endTime: ''
  });

  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    answer: '',
    explanation: ''
  });
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [bulkFile, setBulkFile] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const handleDownloadTemplate = () => {
    const link = document.createElement('a');
    link.href = '/Questions_Template.csv';
    link.download = 'Questions_Template.csv';
    link.click();
  };

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const response = await challengeService.getAllChallenges();
      setChallenges(response.data || []);
    } catch (error) {
      console.error('Error fetching challenges:', error);
      alert('Failed to fetch challenges');
    } finally {
      setLoading(false);
    }
  };

  const filteredChallenges = challenges.filter(challenge => {
    const matchesSearch = challenge.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || challenge.category.toLowerCase() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // --- DYNAMIC STATS: Upcoming, Live, Completed ---
  const now = new Date();

  const upcoming = challenges.filter(c => new Date(c.startDateTime) > now).length;
  const live = challenges.filter(c => {
    const start = new Date(c.startDateTime);
    const end = new Date(c.endDateTime);
    return start <= now && now <= end;
  }).length;
  const completed = challenges.filter(c => new Date(c.endDateTime) < now).length;

  const stats = [
    { label: 'Total Challenges', value: challenges.length, color: 'blue' },
    { label: 'Upcoming',        value: upcoming,       color: 'purple' },
    { label: 'Live',            value: live,           color: 'green' },
    { label: 'Completed',       value: completed,      color: 'yellow' }
  ];

  const getDifficultyColor = (difficulty) => {
    if (difficulty === 'Easy') return isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800';
    if (difficulty === 'Medium') return isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800';
    return isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800';
  };

  const determineStatus = (challenge) => {
    const now = new Date();
    const startDateTime = new Date(challenge.startDateTime);
    const endDateTime = new Date(challenge.endDateTime);

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      return 'unknown';
    }

    if (now < startDateTime) {
      return 'upcoming';
    } else if (now >= startDateTime && now <= endDateTime) {
      return 'live';
    } else {
      return 'completed';
    }
  };

  const getStatusColor = (status) => {
    if (status === 'live') return isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800';
    if (status === 'completed') return isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800';
    if (status === 'upcoming') return isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800';
    return isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-700';
  };

  const getSuccessRateColor = (rate) => {
    if (rate >= 75) return 'text-green-500';
    if (rate >= 60) return 'text-blue-500';
    if (rate >= 45) return 'text-yellow-500';
    return 'text-red-500';
  };

  const handleChallengeDataChange = (field, value) => {
    setChallengeData(prev => ({ ...prev, [field]: value }));
  };

  const handleCurrentQuestionChange = (field, value, optionIndex = null) => {
    if (field === 'options' && optionIndex !== null) {
      const newOptions = [...currentQuestion.options];
      newOptions[optionIndex] = value;
      setCurrentQuestion(prev => ({ ...prev, options: newOptions }));
    } else {
      setCurrentQuestion(prev => ({ ...prev, [field]: value }));
    }
  };

  const addQuestion = () => {
    if (currentQuestion.question && currentQuestion.options.every(opt => opt) && currentQuestion.answer && currentQuestion.explanation) {
      if (editingQuestionId) {
        setQuestions(prev => prev.map(q =>
          q.id === editingQuestionId ? { ...currentQuestion, id: editingQuestionId } : q
        ));
        setEditingQuestionId(null);
      } else {
        setQuestions(prev => [...prev, { ...currentQuestion, id: Date.now() }]);
      }
      setCurrentQuestion({
        question: '',
        options: ['', '', '', ''],
        answer: '',
        explanation: ''
      });
    } else {
      alert('Please fill all question fields');
    }
  };

  const removeQuestion = (id) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
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

  const editQuestion = (question) => {
    setEditingQuestionId(question.id);
    setCurrentQuestion({
      question: question.question,
      options: [...question.options],
      answer: question.answer,
      explanation: question.explanation || ''
    });
  };

  const cancelEditQuestion = () => {
    setEditingQuestionId(null);
    setCurrentQuestion({
      question: '',
      options: ['', '', '', ''],
      answer: '',
      explanation: ''
    });
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

          setQuestions(prev => [...prev, ...newQuestions]);
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

  const handleNextStep = () => {
    if (!challengeData.title || !challengeData.points || !challengeData.numberOfQuestions || !challengeData.description) {
      alert('Please fill all challenge details');
      return;
    }

    if (challengeData.category === 'daily' || challengeData.category === 'weekly') {
      if (!challengeData.startDate || !challengeData.startTime || !challengeData.endTime) {
        alert('Please fill all schedule details (Start Date, Start Time, End Time)');
        return;
      }

      const startDateTime = new Date(`${challengeData.startDate}T${challengeData.startTime}`);
      const endDateTime = new Date(`${challengeData.startDate}T${challengeData.endTime}`);

      if (endDateTime <= startDateTime) {
        alert('The end time must be after the start time.');
        return;
      }
    }

    setCurrentStep(2);
  };

  const handlePreviousStep = () => {
    setCurrentStep(1);
  };

  const handleCreateChallenge = async () => {
    if (questions.length === 0) {
      alert('Please add at least one question');
      return;
    }

    try {
      const startDateTime = new Date(`${challengeData.startDate}T${challengeData.startTime}`);
      const endDateTime = new Date(`${challengeData.startDate}T${challengeData.endTime}`);

      const payload = {
        ...challengeData,
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
        questions: questions.map(({ id, ...rest }) => rest),
        status: 'Published'
      };

      delete payload.startDate;
      delete payload.startTime;
      delete payload.endTime;

      if (editMode && editingChallenge) {
        await challengeService.updateChallenge(editingChallenge._id || editingChallenge.id, payload);
        alert('Challenge updated successfully');
      } else {
        await challengeService.createChallenge(payload);
        alert('Challenge created successfully');
      }

      await fetchChallenges();
      resetModal();
    } catch (error) {
      console.error('Error saving challenge:', error);
      alert(error.message || 'Failed to save challenge');
    }
  };

  const handleEditChallenge = (challenge) => {
    setEditMode(true);
    setEditingChallenge(challenge);

    const startDateObj = new Date(challenge.startDateTime);
    const endDateObj = new Date(challenge.endDateTime);

    const startDate = startDateObj.toISOString().split('T')[0];

    const startTime = startDateObj.toTimeString().split(' ')[0].substring(0, 5);
    const endTime = endDateObj.toTimeString().split(' ')[0].substring(0, 5);

    setChallengeData({
      title: challenge.title,
      category: challenge.category,
      difficulty: challenge.difficulty,
      points: challenge.points.toString(),
      numberOfQuestions: challenge.numberOfQuestions?.toString() || '',
      description: challenge.description || '',
      startDate,
      startTime,
      endTime
    });
    setQuestions(challenge.questions || []);
    setShowCreateModal(true);
  };

  const handleDeleteChallenge = async (id) => {
    if (!confirm('Are you sure you want to delete this challenge?')) {
      return;
    }

    try {
      await challengeService.deleteChallenge(id);
      alert('Challenge deleted successfully');
      await fetchChallenges();
    } catch (error) {
      console.error('Error deleting challenge:', error);
      alert('Failed to delete challenge');
    }
  };

  const resetModal = () => {
    setShowCreateModal(false);
    setEditMode(false);
    setEditingChallenge(null);
    setCurrentStep(1);
    setChallengeData({
      title: '',
      category: 'daily',
      difficulty: 'Easy',
      points: '',
      numberOfQuestions: '',
      description: '',
      startDate: '',
      startTime: '',
      endTime: ''
    });
    setQuestions([]);
    setCurrentQuestion({
      question: '',
      options: ['', '', '', ''],
      answer: '',
      explanation: ''
    });
    setBulkFile(null);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
            Challenge Management
          </h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Create and manage learning challenges
          </p>
        </div>
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
            Create Challenge
          </button>
        </div>
      </div>

      {/* DYNAMIC STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 border`}
          >
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>{stat.label}</p>
            <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
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
                placeholder="Search challenges..."
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
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="all">All Categories</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <tr>
                <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                  Challenge
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                  Category
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                  Difficulty
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                  Stats
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                  Status
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredChallenges.map((challenge) => (
                <tr key={challenge._id} className={`${isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'} transition-colors`}>
                  <td className="px-6 py-4">
                    <div>
                      <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-1`}>
                        {challenge.title}
                      </div>
                      <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        <Star className="w-3 h-3" />
                        {challenge.points} points
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${
                      isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {challenge.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getDifficultyColor(challenge.difficulty)}`}>
                      {challenge.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                      <div className="flex items-center gap-1 mb-1">
                        <BarChart3 className="w-3 h-3" />
                        {challenge.attempts || 0} attempts
                      </div>
                      <div className={`text-xs font-medium ${getSuccessRateColor(challenge.successRate || 0)}`}>
                        {challenge.successRate || 0}% success rate
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(determineStatus(challenge))}`}>
                      {determineStatus(challenge)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/admin/challenges/metrics/${challenge._id}`)}
                        className={`p-2 rounded-lg ${
                          isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                        } transition-colors`}
                        title="View Challenge Metrics"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditChallenge(challenge)}
                        className={`p-2 rounded-lg ${
                          isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                        } transition-colors`}
                        title="Edit Challenge"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteChallenge(challenge._id || challenge.id)}
                        className={`p-2 rounded-lg ${
                          isDark ? 'hover:bg-red-900/20 text-red-400' : 'hover:bg-red-50 text-red-600'
                        } transition-colors`}
                        title="Delete Challenge"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={`px-6 py-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Showing {filteredChallenges.length} of {challenges.length} challenges
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

      {/* MODAL REMAINS UNCHANGED */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } rounded-xl border shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className={`p-6 border-b ${
              isDark ? 'border-gray-700' : 'border-gray-200'
            } flex items-center justify-between`}>
              <div>
                <h2 className={`text-2xl font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>{editMode ? 'Edit Challenge' : 'Create New Challenge'}</h2>
                <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Step {currentStep} of 2: {currentStep === 1 ? 'Challenge Details' : 'Add Questions'}
                </p>
              </div>
              <button
                onClick={resetModal}
                className={`p-2 rounded-lg ${
                  isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                } transition-colors`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {currentStep === 1 && (
              <div className="p-6 space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>Title *</label>
                  <input
                    type="text"
                    value={challengeData.title}
                    onChange={(e) => handleChallengeDataChange('title', e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Enter challenge title"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>Category</label>
                    <select
                      value={challengeData.category}
                      onChange={(e) => handleChallengeDataChange('category', e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>Difficulty</label>
                    <select
                      value={challengeData.difficulty}
                      onChange={(e) => handleChallengeDataChange('difficulty', e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>Points *</label>
                    <input
                      type="number"
                      value={challengeData.points}
                      onChange={(e) => handleChallengeDataChange('points', e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Enter points"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>Number of Questions to Show *</label>
                    <input
                      type="number"
                      min="1"
                      value={challengeData.numberOfQuestions}
                      onChange={(e) => handleChallengeDataChange('numberOfQuestions', e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Enter number of questions"
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>Description *</label>
                  <textarea
                    rows={4}
                    value={challengeData.description}
                    onChange={(e) => handleChallengeDataChange('description', e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Enter challenge description"
                  ></textarea>
                </div>

                {(challengeData.category === 'daily' || challengeData.category === 'weekly') && (
                  <div className={`${
                    isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-blue-50 border-blue-200'
                  } rounded-lg p-4 border space-y-4`}>
                    <h3 className={`text-sm font-semibold mb-3 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>Schedule Challenge</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>Start Date *</label>
                        <input
                          type="date"
                          value={challengeData.startDate}
                          onChange={(e) => handleChallengeDataChange('startDate', e.target.value)}
                          className={`w-full px-4 py-2 rounded-lg border ${
                            isDark
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>Start Time *</label>
                        <input
                          type="time"
                          value={challengeData.startTime}
                          onChange={(e) => handleChallengeDataChange('startTime', e.target.value)}
                          className={`w-full px-4 py-2 rounded-lg border ${
                            isDark
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>End Time *</label>
                        <input
                          type="time"
                          value={challengeData.endTime}
                          onChange={(e) => handleChallengeDataChange('endTime', e.target.value)}
                          className={`w-full px-4 py-2 rounded-lg border ${
                            isDark
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                      </div>
                    </div>

                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      This challenge will only be visible to users during the scheduled time period on the start date.
                    </p>
                  </div>
                )}
              </div>
            )}

            {currentStep === 2 && (
              <div className="p-6 space-y-6">
                <div className={`${
                  isDark ? 'bg-gray-700/50' : 'bg-gray-50'
                } rounded-lg p-4 border ${
                  isDark ? 'border-gray-600' : 'border-gray-200'
                }`}>
                  <h3 className={`text-lg font-semibold mb-4 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>{editingQuestionId ? 'Edit Question' : 'Add Single Question'}</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>Question *</label>
                      <textarea
                        rows={3}
                        value={currentQuestion.question}
                        onChange={(e) => handleCurrentQuestionChange('question', e.target.value)}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="Enter the question"
                      ></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentQuestion.options.map((option, index) => (
                        <div key={index}>
                          <label className={`block text-sm font-medium mb-2 ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}>Option {index + 1} *</label>
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => handleCurrentQuestionChange('options', e.target.value, index)}
                            className={`w-full px-4 py-2 rounded-lg border ${
                              isDark
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            placeholder={`Enter option ${index + 1}`}
                          />
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>Correct Answer *</label>
                      <select
                        value={currentQuestion.answer}
                        onChange={(e) => handleCurrentQuestionChange('answer', e.target.value)}
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
                      }`}>Explanation for Correct Answer *</label>
                      <textarea
                        rows={3}
                        value={currentQuestion.explanation}
                        onChange={(e) => handleCurrentQuestionChange('explanation', e.target.value)}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="Explain why this is the correct answer"
                      ></textarea>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={addQuestion}
                        className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                          isDark
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        <Plus className="w-5 h-5 inline mr-2" />
                        {editingQuestionId ? 'Update Question' : 'Add Question'}
                      </button>
                      {editingQuestionId && (
                        <button
                          onClick={cancelEditQuestion}
                          className={`px-6 py-3 rounded-lg font-medium transition-all ${
                            isDark
                              ? 'bg-gray-600 hover:bg-gray-700 text-white'
                              : 'bg-gray-600 hover:bg-gray-700 text-white'
                          }`}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
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

                {questions.length > 0 && (
                  <div className="mt-6">
                    <h3 className={`text-lg font-semibold mb-4 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>Added Questions ({questions.length})</h3>
                    <div className="space-y-3">
                      {questions.map((q, index) => (
                        <div
                          key={q.id}
                          className={`${
                            isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
                          } rounded-lg p-4 border`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              Question {index + 1}
                            </h4>
                            <div className="flex gap-2">
                              <button
                                onClick={() => editQuestion(q)}
                                className={`p-1 rounded ${
                                  isDark ? 'hover:bg-blue-900/20 text-blue-400' : 'hover:bg-blue-50 text-blue-600'
                                } transition-colors`}
                                title="Edit Question"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => removeQuestion(q.id)}
                                className={`p-1 rounded ${
                                  isDark ? 'hover:bg-red-900/20 text-red-400' : 'hover:bg-red-50 text-red-600'
                                } transition-colors`}
                                title="Delete Question"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <p className={`text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {q.question}
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-xs mb-2">
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
                  </div>
                )}
              </div>
            )}

            <div className={`p-6 border-t ${
              isDark ? 'border-gray-700' : 'border-gray-200'
            } flex justify-between gap-3`}>
              <div>
                {currentStep === 2 && (
                  <button
                    onClick={handlePreviousStep}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                        : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                    } transition-colors`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={resetModal}
                  className={`px-6 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                      : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                  } transition-colors`}
                >
                  Cancel
                </button>
                {currentStep === 1 ? (
                  <button
                    onClick={handleNextStep}
                    className="flex items-center gap-2 px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleCreateChallenge}
                    className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                  >
                    {editMode ? 'Update Challenge' : 'Create Challenge'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChallengeManagement;