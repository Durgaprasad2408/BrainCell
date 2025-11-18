import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import SubjectSelector from '../../components/LearningContentManagement/SubjectSelector';
import LessonTable from '../../components/LearningContentManagement/LessonTable';
import LessonFormModal from '../../components/LearningContentManagement/LessonFormModal';
import AddSubjectModal from '../../components/LearningContentManagement/AddSubjectModal';
import DeleteSubjectModal from '../../components/LearningContentManagement/DeleteSubjectModal';
import LearningContentHeader from '../../components/LearningContentManagement/LearningContentHeader';
import LessonFilters from '../../components/LearningContentManagement/LessonFilters';
import useSubjects from '../../components/LearningContentManagement/useSubjects';
import useLessons from '../../components/LearningContentManagement/useLessons';
import useFormData from '../../components/LearningContentManagement/useFormData';
import useLessonHandlers from '../../components/LearningContentManagement/useLessonHandlers';
import useSubjectHandlers from '../../components/LearningContentManagement/useSubjectHandlers';

const LearningContentManagement = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedModule, setSelectedModule] = useState('all');

  // Use custom hooks
  const { subjects, loading: subjectsLoading, error: subjectsError, handleCreateSubject, handleUpdateSubject, handleDeleteSubject, setError } = useSubjects();
  const { allLessons, loading: lessonsLoading, error: lessonsError, success, handleCreateLesson, handleUpdateLesson, handleDeleteLesson } = useLessons(selectedSubject);
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

  const {
    showAddSubjectModal,
    setShowAddSubjectModal,
    newSubject,
    setNewSubject,
    editingSubject,
    showDeleteSubjectModal,
    deletingSubject,
    handleEditSubject,
    handleDeleteSubjectClick,
    closeAddSubjectModal,
    closeDeleteSubjectModal
  } = useSubjectHandlers();

  // Set initial subject
  useEffect(() => {
    if (subjects.length > 0 && !selectedSubject) {
      setSelectedSubject(subjects[0].name);
    }
  }, [subjects, selectedSubject]);

  const lessons = allLessons;
  const uniqueModules = ['all', ...new Set(lessons.map(lesson => lesson.module))];

  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          lesson.module.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesModule = selectedModule === 'all' || lesson.module === selectedModule;
    return matchesSearch && matchesModule;
  });

  const handleViewMetrics = (lesson) => {
    navigate(`/admin/learning/metrics/${lesson._id}`);
  };

  const handleViewUsers = (subject) => {
    navigate(`/admin/learning/users/${encodeURIComponent(subject.name)}`);
  };

  const handleCreateLessonSubmit = async () => {
    const lessonData = {
      title: formData.title,
      subject: formData.subject,
      module: formData.module,
      type: formData.type,
      duration: formData.duration,
      contentCards: formData.type === 'Lesson' ? JSON.stringify(contentCards) : JSON.stringify([]),
      quizQuestions: formData.type === 'Quiz' ? JSON.stringify(quizQuestions) : JSON.stringify([]),
      videoContent: formData.type === 'Video' ? JSON.stringify(videoData) : JSON.stringify({}),
      status: 'Published'
    };

    if (editMode) {
      await handleUpdateLesson(editingLesson._id, lessonData);
    } else {
      await handleCreateLesson(lessonData);
    }

    handleCancel();
  };




  const error = subjectsError || lessonsError;
  const loading = subjectsLoading || lessonsLoading;

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
          <span>{success}</span>
        </div>
      )}

      <LearningContentHeader
        isDark={isDark}
        title="Learning Content Management"
        description="Create and organize learning modules and lessons"
        showAddSubjectButton={true}
        onAddSubject={() => setShowAddSubjectModal(true)}
      />

      <SubjectSelector
        subjects={subjects}
        selectedSubject={selectedSubject}
        onSelectSubject={setSelectedSubject}
        isDark={isDark}
        showActions={true}
        onViewUsers={handleViewUsers}
        onEditSubject={handleEditSubject}
        onDeleteSubject={handleDeleteSubjectClick}
        loading={loading}
      />

      <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border shadow-sm`}>
        <LessonFilters
          isDark={isDark}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedModule={selectedModule}
          onModuleChange={setSelectedModule}
          uniqueModules={uniqueModules}
        />

        <LessonTable
          lessons={filteredLessons}
          isDark={isDark}
          onViewMetrics={handleViewMetrics}
          onEdit={handleEdit}
          onDelete={handleDeleteLesson}
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

      <AddSubjectModal
        showModal={showAddSubjectModal}
        onClose={closeAddSubjectModal}
        editingSubject={editingSubject}
        newSubject={newSubject}
        setNewSubject={setNewSubject}
        isDark={isDark}
        onCreateSubject={async (formData) => {
          const result = await handleCreateSubject(formData);
          if (result?.success) {
            closeAddSubjectModal();
          }
        }}
        onUpdateSubject={async (id, formData) => {
          const result = await handleUpdateSubject(id, formData);
          if (result?.success) {
            closeAddSubjectModal();
          }
        }}
        loading={loading}
      />

      <DeleteSubjectModal
        showModal={showDeleteSubjectModal}
        onClose={closeDeleteSubjectModal}
        deletingSubject={deletingSubject}
        isDark={isDark}
        onDeleteSubject={async () => {
          const result = await handleDeleteSubject(deletingSubject._id);
          if (result?.success) {
            closeDeleteSubjectModal();
          }
        }}
        loading={loading}
      />
    </div>
  );
};

export default LearningContentManagement;
