import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Download, Plus, Search } from 'lucide-react';
import SubjectSelector from '../../components/LearningContentManagement/SubjectSelector';
import LessonTable from '../../components/LearningContentManagement/LessonTable';
import LessonFormModal from '../../components/LearningContentManagement/LessonFormModal';
import LearningContentHeader from '../../components/LearningContentManagement/LearningContentHeader';
import LessonFilters from '../../components/LearningContentManagement/LessonFilters';
import useInstructorSubjects from '../../components/LearningContentManagement/useInstructorSubjects';
import useInstructorLessons from '../../components/LearningContentManagement/useInstructorLessons';
import useFormData from '../../components/LearningContentManagement/useFormData';
import useLessonHandlers from '../../components/LearningContentManagement/useLessonHandlers';

const LearningContentManagement = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedModule, setSelectedModule] = useState('all');

  // Use custom hooks
  const { subjects, loading: subjectsLoading, error: subjectsError } = useInstructorSubjects(user);
  const { allLessons, loading: lessonsLoading, error: lessonsError, success, handleCreateLesson, handleUpdateLesson, handleDeleteLesson, fetchLessons } = useInstructorLessons(selectedSubject);
  const {
    formData,
    setFormData,
    contentCards,
    setContentCards,
    currentCard,
    setCurrentCard,
    currentCardImages,
    setCurrentCardImages,
    editingCardIndex,
    setEditingCardIndex,
    quizQuestions,
    setQuizQuestions,
    currentQuestion,
    setCurrentQuestion,
    editingQuestionId,
    setEditingQuestionId,
    bulkFile,
    setBulkFile,
    videoData,
    setVideoData,
    resetForm,
    canProceedToStep2
  } = useFormData(selectedSubject);

  const {
    showCreateModal,
    setShowCreateModal,
    editMode,
    editingLesson,
    createStep,
    setCreateStep,
    handleNext,
    handleAddCard,
    handleRemoveCard,
    handleEditCard,
    handleCancelEditCard,
    handleAddQuestion,
    handleRemoveQuestion,
    handleEditQuestion,
    handleCancelEditQuestion,
    handleDownloadTemplate,
    handleBulkCsvAdd,
    handleCancel,
    handleEdit
  } = useLessonHandlers(
    selectedSubject,
    formData,
    setFormData,
    contentCards,
    setContentCards,
    currentCard,
    setCurrentCard,
    currentCardImages,
    setCurrentCardImages,
    editingCardIndex,
    setEditingCardIndex,
    quizQuestions,
    setQuizQuestions,
    currentQuestion,
    setCurrentQuestion,
    editingQuestionId,
    setEditingQuestionId,
    setBulkFile,
    videoData,
    setVideoData,
    resetForm
  );

  // Set initial subject
  useEffect(() => {
    if (subjects.length > 0 && !selectedSubject) {
      setSelectedSubject(subjects[0].name);
    }
  }, [subjects, selectedSubject]);

  // Update formData subject when selectedSubject changes
  useEffect(() => {
    if (selectedSubject) {
      setFormData(prev => ({ ...prev, subject: selectedSubject }));
    }
  }, [selectedSubject, setFormData]);

  // Fetch lessons when selectedSubject changes
  useEffect(() => {
    if (selectedSubject) {
      fetchLessons();
    }
  }, [selectedSubject, fetchLessons]);


  const lessons = allLessons;
  const uniqueModules = ['all', ...new Set(lessons.map(lesson => lesson.module))];

  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          lesson.module.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesModule = selectedModule === 'all' || lesson.module === selectedModule;
    return matchesSearch && matchesModule;
  });

  const error = subjectsError || lessonsError;
  const loading = subjectsLoading || lessonsLoading;

  const setError = () => {}; // Placeholder since we don't need to set error manually
  const setSuccess = () => {}; // Placeholder since we don't need to set success manually

  const handleCreateLessonSubmit = async (lessonData) => {
    if (editMode && editingLesson) {
      await handleUpdateLesson(editingLesson._id, lessonData);
    } else {
      await handleCreateLesson(lessonData);
    }
    handleCancel();
  };

  return (
    <div>
      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-100 border border-red-400 text-red-700">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
              ×
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 rounded-lg bg-green-100 border border-green-400 text-green-700">
          <div className="flex items-center justify-between">
            <span>{success}</span>
            <button onClick={() => setSuccess(null)} className="text-green-700 hover:text-green-900">
              ×
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
          <SubjectSelector
            subjects={subjects}
            selectedSubject={selectedSubject}
            onSelectSubject={setSelectedSubject}
            isDark={isDark}
            showActions={false}
            onViewUsers={(subject) => navigate(`/instructor/learning/users/${encodeURIComponent(subject.name)}`)}
            loading={loading}
          />

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
                      isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                <select
                  value={selectedModule}
                  onChange={(e) => setSelectedModule(e.target.value)}
                  className={`px-4 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
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

            <LessonTable
              lessons={filteredLessons}
              isDark={isDark}
              onViewMetrics={(lesson) => navigate(`/instructor/learning/metrics/${lesson._id}`)}
              onEdit={handleEdit}
              onDelete={(lesson) => handleDeleteLesson(lesson._id)}
              showOrderColumn={true}
            />

            <div className={`px-6 py-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Showing {filteredLessons.length} lessons in {selectedSubject}
              </p>
              <div className="flex gap-2">
                <button className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'} transition-colors`}>
                  Previous
                </button>
                <button className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'} transition-colors`}>
                  Next
                </button>
              </div>
            </div>
          </div>

          <LessonFormModal
            showModal={showCreateModal}
            onClose={handleCancel}
            editMode={editMode}
            createStep={createStep}
            setCreateStep={setCreateStep}
            formData={formData}
            setFormData={setFormData}
            subjects={subjects}
            contentCards={contentCards}
            setContentCards={setContentCards}
            currentCard={currentCard}
            setCurrentCard={setCurrentCard}
            currentCardImages={currentCardImages}
            setCurrentCardImages={setCurrentCardImages}
            editingCardIndex={editingCardIndex}
            setEditingCardIndex={setEditingCardIndex}
            quizQuestions={quizQuestions}
            setQuizQuestions={setQuizQuestions}
            currentQuestion={currentQuestion}
            setCurrentQuestion={setCurrentQuestion}
            editingQuestionId={editingQuestionId}
            setEditingQuestionId={setEditingQuestionId}
            bulkFile={bulkFile}
            setBulkFile={setBulkFile}
            videoData={videoData}
            setVideoData={setVideoData}
            isDark={isDark}
            onNext={handleNext}
            onAddCard={handleAddCard}
            onRemoveCard={handleRemoveCard}
            onEditCard={handleEditCard}
            onCancelEditCard={handleCancelEditCard}
            onAddQuestion={handleAddQuestion}
            onRemoveQuestion={handleRemoveQuestion}
            onEditQuestion={handleEditQuestion}
            onCancelEditQuestion={handleCancelEditQuestion}
            onDownloadTemplate={handleDownloadTemplate}
            onBulkCsvAdd={handleBulkCsvAdd}
            onBack={() => setCreateStep(1)}
            onCreateLesson={handleCreateLessonSubmit}
            canProceedToStep2={canProceedToStep2}
          />

        </>
      )}
    </div>
  );
};

export default LearningContentManagement;