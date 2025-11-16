import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { Plus, Download } from 'lucide-react';
import * as challengeService from '../../api/challengeService';

// Import new components
import ChallengeStats from '../../components/challenges/ChallengeStats';
import ChallengeFilters from '../../components/challenges/ChallengeFilters';
import ChallengeList from '../../components/challenges/ChallengeList';
import ChallengePagination from '../../components/challenges/ChallengePagination';
import ChallengeModal from '../../components/challenges/ChallengeModal';
import QuestionForm from '../../components/challenges/QuestionForm';

// Import utilities
import { 
  filterChallenges,
  downloadTemplate,
  parseBulkCsv,
  getDifficultyColor,
  getSuccessRateColor,
  getStatusColor,
  determineStatus,
  validateChallengeData,
  processChallengeForSubmission,
  resetChallengeForm,
  resetQuestionForm
} from '../../components/challenges/utils';

const AdminChallengeManagement = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Form state
  const [challengeData, setChallengeData] = useState(resetChallengeForm());
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(resetQuestionForm());
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [bulkFile, setBulkFile] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch challenges on component mount
  useEffect(() => {
    fetchChallenges();
  }, []);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, pageSize]);

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

  // Filter challenges
  const filteredChallenges = filterChallenges(challenges, searchQuery, selectedCategory);

  // Paginate challenges
  const paginatedChallenges = filteredChallenges.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Question management
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
      setCurrentQuestion(resetQuestionForm());
    } else {
      alert('Please fill all question fields');
    }
  };

  const removeQuestion = (id) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
    if (editingQuestionId === id) {
      setEditingQuestionId(null);
      setCurrentQuestion(resetQuestionForm());
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
    setCurrentQuestion(resetQuestionForm());
  };

  // Bulk CSV handling
  const handleBulkCsvAdd = async () => {
    try {
      const newQuestions = await parseBulkCsv(bulkFile);
      setQuestions(prev => [...prev, ...newQuestions]);
      setBulkFile(null);
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = null;
      alert(`Successfully added ${newQuestions.length} questions!`);
    } catch (error) {
      console.error('Error processing CSV:', error);
      alert(`Failed to add bulk questions: ${error.message}`);
    }
  };

  // Step navigation
  const handleNextStep = () => {
    const validation = validateChallengeData(challengeData, 1);
    if (!validation.isValid) {
      alert(validation.message);
      return;
    }
    setCurrentStep(2);
  };

  const handlePreviousStep = () => {
    setCurrentStep(1);
  };

  // Challenge CRUD operations
  const handleCreateChallenge = async () => {
    if (questions.length === 0) {
      alert('Please add at least one question');
      return;
    }

    try {
      const payload = processChallengeForSubmission(challengeData, questions);
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

    setChallengeData({
      title: challenge.title,
      category: challenge.category,
      difficulty: challenge.difficulty,
      points: challenge.points.toString(),
      numberOfQuestions: challenge.numberOfQuestions?.toString() || '',
      description: challenge.description || '',
      startDate: startDateObj.toISOString().split('T')[0],
      startTime: startDateObj.toTimeString().split(' ')[0].substring(0, 5),
      endTime: endDateObj.toTimeString().split(' ')[0].substring(0, 5)
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
    setChallengeData(resetChallengeForm());
    setQuestions([]);
    setCurrentQuestion(resetQuestionForm());
    setBulkFile(null);
  };

  const handleDownloadTemplate = downloadTemplate;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading challenges...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
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
              isDark ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            <Download className="w-5 h-5" />
            Download Template
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Plus className="w-5 h-5" />
            Create Challenge
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <ChallengeStats challenges={challenges} />

      {/* Main Content */}
      <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border shadow-sm`}>
        {/* Filters */}
        <ChallengeFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          pageSize={pageSize}
          setPageSize={setPageSize}
        />

        {/* Challenge List */}
        <ChallengeList
          challenges={paginatedChallenges}
          navigate={navigate}
          handleEditChallenge={handleEditChallenge}
          handleDeleteChallenge={handleDeleteChallenge}
          getDifficultyColor={(difficulty) => getDifficultyColor(difficulty, isDark)}
          getSuccessRateColor={getSuccessRateColor}
          getStatusColor={(status) => getStatusColor(status, isDark)}
          determineStatus={determineStatus}
          metricsRoutePrefix="/admin"
        />

        {/* Pagination */}
        <ChallengePagination
          filteredChallengesLength={filteredChallenges.length}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          pageSize={pageSize}
        />
      </div>

      {/* Challenge Modal */}
      <ChallengeModal
        showCreateModal={showCreateModal}
        resetModal={resetModal}
        editMode={editMode}
        currentStep={currentStep}
        challengeData={challengeData}
        setChallengeData={setChallengeData}
        handleNextStep={handleNextStep}
        handlePreviousStep={handlePreviousStep}
        handleCreateChallenge={handleCreateChallenge}
      >
        {currentStep === 2 && (
          <QuestionForm
            currentQuestion={currentQuestion}
            setCurrentQuestion={setCurrentQuestion}
            questions={questions}
            editingQuestionId={editingQuestionId}
            bulkFile={bulkFile}
            setBulkFile={setBulkFile}
            handleBulkCsvAdd={handleBulkCsvAdd}
            addQuestion={addQuestion}
            editQuestion={editQuestion}
            removeQuestion={removeQuestion}
            cancelEditQuestion={cancelEditQuestion}
          />
        )}
      </ChallengeModal>
    </div>
  );
};

export default AdminChallengeManagement;