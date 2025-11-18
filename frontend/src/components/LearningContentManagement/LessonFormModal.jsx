import React from 'react';
import { X } from 'lucide-react';
import ContentCardBuilder from './ContentCardBuilder';
import QuizBuilder from './QuizBuilder';
import VideoBuilder from './VideoBuilder';

const LessonFormModal = ({
  showModal,
  onClose,
  editMode,
  createStep,
  setCreateStep,
  formData,
  setFormData,
  subjects,
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
  isDark,
  onNext,
  onAddCard,
  onRemoveCard,
  onEditCard,
  onCancelEditCard,
  onAddQuestion,
  onRemoveQuestion,
  onEditQuestion,
  onCancelEditQuestion,
  onDownloadTemplate,
  onBulkCsvAdd,
  onBack,
  onCreateLesson,
  canProceedToStep2
}) => {
  if (!showModal) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'duration') {
      const numericValue = value.replace(/\D/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: numericValue ? parseInt(numericValue) : ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
        <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {editMode ? 'Edit Lesson' : 'Create New Lesson'}
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'} transition-colors`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {createStep === 1 ? (
          <form onSubmit={onNext} className="p-6 space-y-6">
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
                onClick={onClose}
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

            {formData.type === 'Lesson' && (
              <ContentCardBuilder
                contentCards={contentCards}
                currentCard={currentCard}
                setCurrentCard={setCurrentCard}
                currentCardImages={currentCardImages}
                setCurrentCardImages={setCurrentCardImages}
                editingCardIndex={editingCardIndex}
                setEditingCardIndex={setEditingCardIndex}
                isDark={isDark}
                onAddCard={onAddCard}
                onRemoveCard={onRemoveCard}
                onEditCard={onEditCard}
                onCancelEditCard={onCancelEditCard}
              />
            )}

            {formData.type === 'Quiz' && (
              <QuizBuilder
                quizQuestions={quizQuestions}
                currentQuestion={currentQuestion}
                setCurrentQuestion={setCurrentQuestion}
                editingQuestionId={editingQuestionId}
                setEditingQuestionId={setEditingQuestionId}
                bulkFile={bulkFile}
                setBulkFile={setBulkFile}
                isDark={isDark}
                onAddQuestion={onAddQuestion}
                onRemoveQuestion={onRemoveQuestion}
                onEditQuestion={onEditQuestion}
                onCancelEditQuestion={onCancelEditQuestion}
                onDownloadTemplate={onDownloadTemplate}
                onBulkCsvAdd={onBulkCsvAdd}
              />
            )}

            {formData.type === 'Video' && (
              <VideoBuilder
                videoData={videoData}
                setVideoData={setVideoData}
                isDark={isDark}
              />
            )}

            <div className={`flex gap-3 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                type="button"
                onClick={onBack}
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
                onClick={() => onCreateLesson({
                  title: formData.title,
                  subject: formData.subject,
                  module: formData.module,
                  type: formData.type,
                  duration: formData.duration,
                  contentCards,
                  quizQuestions,
                  videoData
                })}
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
  );
};

export default LessonFormModal;