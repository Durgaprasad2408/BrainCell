import React from 'react';
import ItemsPerPageSelector from './ItemsPerPageSelector';
import PaginationControls from './PaginationControls';

const ContentDisplay = ({
  lesson,
  currentPage,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  isDark
}) => {
  const renderLessonContent = () => {
    if (!lesson?.contentCards || lesson.contentCards.length === 0) {
      return (
        <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          No lesson content available
        </p>
      );
    }

    return (
      <div className="space-y-3">
        {lesson.contentCards.map((card, index) => (
          <div key={index} className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
            <h5 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
              {card.heading}
            </h5>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
              {card.content}
            </p>
            {card.images && card.images.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {card.images.map((img, i) => (
                  <img
                    key={i}
                    src={img.url}
                    alt={img.caption || `Image ${i + 1}`}
                    className="w-20 h-20 object-cover rounded border"
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderQuizContent = () => {
    if (!lesson?.quizQuestions || lesson.quizQuestions.length === 0) {
      return (
        <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          No quiz content available
        </p>
      );
    }

    const totalItems = lesson.quizQuestions.length;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = lesson.quizQuestions.slice(startIndex, endIndex);

    return (
      <>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h4 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Quiz Questions ({lesson.quizQuestions.length})
            </h4>

            <ItemsPerPageSelector
              value={itemsPerPage}
              onChange={onItemsPerPageChange}
              isDark={isDark}
            />
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-3">
            {currentItems.map((question, index) => (
              <div key={startIndex + index} className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                <h5 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                  Question {startIndex + index + 1}
                </h5>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-3`}>
                  {question.question}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {question.options.map((option, i) => (
                    <div
                      key={i}
                      className={`px-3 py-2 rounded text-sm ${
                        option === question.answer
                          ? isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
                          : isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {i + 1}. {option}
                    </div>
                  ))}
                </div>
                {question.explanation && (
                  <p className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <strong>Explanation:</strong> {question.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <PaginationControls
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
          isDark={isDark}
        />
      </>
    );
  };

  const renderVideoContent = () => {
    if (!lesson?.videoContent) {
      return (
        <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          No video content available
        </p>
      );
    }

    return (
      <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
        {lesson.videoContent.videoUrl && (
          <div className="mb-3">
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <strong>Video URL:</strong> {lesson.videoContent.videoUrl}
            </p>
          </div>
        )}
        {lesson.videoContent.description && (
          <div className="mb-3">
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <strong>Description:</strong> {lesson.videoContent.description}
            </p>
          </div>
        )}
        {lesson.videoContent.transcript && (
          <div>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <strong>Transcript:</strong> {lesson.videoContent.transcript}
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (lesson?.type) {
      case 'Lesson':
        return renderLessonContent();
      case 'Quiz':
        return renderQuizContent();
      case 'Video':
        return renderVideoContent();
      default:
        return (
          <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Unknown content type
          </p>
        );
    }
  };

  return (
    <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
      <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
        {lesson?.type} Content
      </h3>

      {renderContent()}
    </div>
  );
};

export default ContentDisplay;