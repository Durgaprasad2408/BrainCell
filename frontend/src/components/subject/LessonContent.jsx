import React from 'react';
import { CheckCircle } from 'lucide-react';
import NavigationButtons from './NavigationButtons';
import FAQSection from './FAQSection';

const LessonContent = ({
  currentContent,
  completedItems,
  markAsCompleted,
  navigationDetails,
  selectContent,
  faqs,
  newQuestion,
  setNewQuestion,
  handleSubmitQuery,
  submittingQuery,
  querySuccess,
  isDark
}) => {
  if (!currentContent || currentContent.type !== 'Lesson') return null;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className={`text-3xl font-bold mb-2 transition-colors duration-200 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          {currentContent.title}
        </h1>
      </div>

      <div className="space-y-8">
        {currentContent.contentCards.map((card, index) => (
          <div key={index} className={`p-6 rounded-lg transition-colors duration-200 ${
            isDark ? 'bg-gray-800' : 'bg-white'
          } shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className={`text-xl font-semibold mb-4 transition-colors duration-200 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {card.heading}
            </h2>
            <div className={`prose max-w-none transition-colors duration-200 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {card.content.split('\n').map((paragraph, pIndex) => (
                <p key={pIndex} className="mb-4 leading-relaxed whitespace-pre-line">
                  {paragraph}
                </p>
              ))}
            </div>
            {card.images && card.images.length > 0 && (
              <div className="mt-4 space-y-4">
                {card.images.map((image, imgIndex) => (
                  <div key={imgIndex}>
                    <img
                      src={image.url}
                      alt={image.caption || `Image ${imgIndex + 1}`}
                      className="rounded-lg max-w-full h-auto"
                    />
                    {image.caption && (
                      <p className={`text-sm mt-2 italic ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {image.caption}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={() => markAsCompleted(currentContent._id)}
          disabled={completedItems[currentContent._id]}
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            completedItems[currentContent._id]
              ? isDark
                ? 'bg-green-800 text-green-200 cursor-not-allowed'
                : 'bg-green-100 text-green-800 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {completedItems[currentContent._id] ? (
            <>
              <CheckCircle className="w-5 h-5 inline mr-2" />
              Completed
            </>
          ) : (
            'Mark as Complete'
          )}
        </button>
      </div>

      <NavigationButtons
        navigationDetails={navigationDetails}
        selectContent={selectContent}
        isDark={isDark}
      />
      <FAQSection
        faqs={faqs}
        newQuestion={newQuestion}
        setNewQuestion={setNewQuestion}
        handleSubmitQuery={handleSubmitQuery}
        submittingQuery={submittingQuery}
        querySuccess={querySuccess}
        isDark={isDark}
      />
    </div>
  );
};

export default LessonContent;