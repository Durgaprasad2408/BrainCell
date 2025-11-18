import React from 'react';
import { Play } from 'lucide-react';
import YouTube from 'react-youtube';
import NavigationButtons from './NavigationButtons';
import FAQSection from './FAQSection';

const VideoContent = ({
  currentContent,
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
  if (!currentContent || currentContent.type !== 'Video') return null;

  const videoContent = currentContent.videoContent || {};

  // Gets YouTube video ID from URL
  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYouTubeVideoId(videoContent.videoUrl);

  // Options for the react-youtube player
  const youtubePlayerOptions = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 0,
      modestbranding: 1,
      rel: 0, // Don't show related videos
    },
  };

  // Single handler for both video types
  const handleVideoEnd = () => {
    markAsCompleted(currentContent._id);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className={`text-3xl font-bold mb-2 transition-colors duration-200 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          {currentContent.title}
        </h1>
      </div>

      <div className={`rounded-lg overflow-hidden transition-colors duration-200 ${
        isDark ? 'bg-gray-800' : 'bg-white'
      } shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>

        {videoId ? (
          // Use react-youtube component for YouTube videos
          <div className="relative" style={{ paddingTop: '56.25%' }}>
            <YouTube
              videoId={videoId}
              opts={youtubePlayerOptions}
              onEnd={handleVideoEnd} // Auto-completes on end
              className="absolute top-0 left-0 w-full h-full"
            />
          </div>
        ) : videoContent.videoUrl && !videoId ? (
          // Use standard <video> tag for direct files
          <video
            className="w-full"
            controls
            controlsList="nodownload"
            preload="metadata"
            onEnded={handleVideoEnd} // Auto-completes on end
          >
            <source src={videoContent.videoUrl} type="video/mp4" />
            <source src={videoContent.videoUrl} type="video/webm" />
            <source src={videoContent.videoUrl} type="video/ogg" />
            Your browser does not support the video tag.
          </video>
        ) : (
          // Fallback
          <div className={`p-12 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Video content not available</p>
          </div>
        )}
      </div>

      {videoContent.description && (
        <div className={`mt-6 p-6 rounded-lg transition-colors duration-200 ${
          isDark ? 'bg-gray-800' : 'bg-white'
        } shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className={`text-xl font-semibold mb-4 transition-colors duration-200 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Description
          </h2>
          <p className={`transition-colors duration-200 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {videoContent.description}
          </p>
        </div>
      )}

      {videoContent.transcript && (
        <div className={`mt-6 p-6 rounded-lg transition-colors duration-200 ${
          isDark ? 'bg-gray-800' : 'bg-white'
        } shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className={`text-xl font-semibold mb-4 transition-colors duration-200 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Transcript
          </h2>
          <div className={`prose max-w-none transition-colors duration-200 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {videoContent.transcript.split('\n').map((paragraph, pIndex) => (
              <p key={pIndex} className="mb-4 leading-relaxed whitespace-pre-line">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      )}

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

export default VideoContent;