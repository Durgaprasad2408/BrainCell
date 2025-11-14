import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronRight, ChevronLeft, Lock, CheckCircle, Play, BookOpen, HelpCircle, Eye, EyeOff, MessageCircle, Send } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getAllSubjects, checkEnrollment } from '../../api/subjectService';
import { getAllLessons } from '../../api/lessonService';
import { getLessonFAQs, submitQuery } from '../../api/faqService';
import { useTheme } from '../../contexts/ThemeContext';
import YouTube from 'react-youtube'; // Import react-youtube

const SubjectContent = () => {
  const { subjectName } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [subject, setSubject] = useState(null);
  const [expandedWeeks, setExpandedWeeks] = useState({});
  const [completedItems, setCompletedItems] = useState({});
  const [currentContent, setCurrentContent] = useState(null);
  const [sidebarVisible, setSidebarVisible] = useState(window.innerWidth >= 768);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResults, setQuizResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [faqs, setFaqs] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [submittingQuery, setSubmittingQuery] = useState(false);
  const [querySuccess, setQuerySuccess] = useState(false);

  // Correctly calculate completed count for THIS subject
  const completedLessonCount = useMemo(() => {
    if (lessons.length === 0) {
      return 0;
    }
    const currentSubjectLessonIds = new Set(lessons.map(lesson => lesson._id));
    const completedForThisSubject = Object.keys(completedItems).filter(completedId => 
      currentSubjectLessonIds.has(completedId)
    );
    return completedForThisSubject.length;
  }, [lessons, completedItems]);

  // Calculate navigation state (previous/next lessons)
  const navigationDetails = useMemo(() => {
    if (!currentContent || lessons.length === 0) {
      return { prevLesson: null, nextLesson: null, isCurrentCompleted: false };
    }

    const currentIndex = lessons.findIndex(lesson => lesson._id === currentContent._id);
    if (currentIndex === -1) {
      return { prevLesson: null, nextLesson: null, isCurrentCompleted: false };
    }

    const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
    const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;
    
    let isCurrentCompleted = !!completedItems[currentContent._id];
    
    if (currentContent.type === 'Quiz') {
      const quizResult = quizResults[currentContent._id];
      isCurrentCompleted = !!(quizResult && quizResult.passed);
    }

    return { prevLesson, nextLesson, isCurrentCompleted };
  }, [currentContent, lessons, completedItems, quizResults]);

  useEffect(() => {
    // Reset current content when subject changes to ensure new content is selected
    setCurrentContent(null);
    fetchSubjectAndLessons();
  }, [subjectName]);

  const fetchSubjectAndLessons = async () => {
    try {
      setLoading(true);
      const response = await getAllSubjects();
      const foundSubject = response.data.find(s => s.name === decodeURIComponent(subjectName));

      if (!foundSubject) {
        navigate('/student/learning');
        return;
      }

      setSubject(foundSubject);

      const enrollmentResponse = await checkEnrollment(foundSubject._id);
      setIsEnrolled(enrollmentResponse.isEnrolled);

      if (!enrollmentResponse.isEnrolled) {
        navigate('/student/learning');
        return;
      }

      const lessonsResponse = await getAllLessons({ subject: foundSubject.name });
      setLessons(lessonsResponse.data || []);
    } catch (error) {
      console.error('Error fetching subject and lessons:', error);
      navigate('/learning');
    } finally {
      setLoading(false);
    }
  };

  const groupLessonsByModule = () => {
    const grouped = {};
    lessons.forEach(lesson => {
      if (!grouped[lesson.module]) {
        grouped[lesson.module] = [];
      }
      grouped[lesson.module].push(lesson);
    });
    return grouped;
  };

  // Load progress from localStorage on mount
  useEffect(() => {
    const savedProgress = localStorage.getItem('learning-progress');
    const savedAnswers = localStorage.getItem('quiz-answers');
    const savedResults = localStorage.getItem('quiz-results');

    if (savedProgress) {
      setCompletedItems(JSON.parse(savedProgress));
    }
    if (savedAnswers) {
      setQuizAnswers(JSON.parse(savedAnswers));
    }
    if (savedResults) {
      setQuizResults(JSON.parse(savedResults));
    }
  }, []);

  // Handle sidebar visibility on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarVisible(false);
      } else {
        setSidebarVisible(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const saveProgress = (newCompleted) => {
    localStorage.setItem('learning-progress', JSON.stringify(newCompleted));
    setCompletedItems(newCompleted);
  };

  const saveQuizData = (answers, results) => {
    localStorage.setItem('quiz-answers', JSON.stringify(answers));
    localStorage.setItem('quiz-results', JSON.stringify(results));
    setQuizAnswers(answers);
    setQuizResults(results);
  };

  // Logic to determine if a lesson is unlocked
  const isUnlocked = (module, lessonIndex) => {
    const moduleKeys = Object.keys(groupLessonsByModule());
    const currentModuleIndex = moduleKeys.indexOf(module);

    if (currentModuleIndex === 0 && lessonIndex === 0) return true;

    const moduleLessons = groupLessonsByModule()[module];
    if (lessonIndex > 0) {
      const prevLesson = moduleLessons[lessonIndex - 1];
      return completedItems[prevLesson._id];
    }

    if (currentModuleIndex > 0) {
      const prevModule = moduleKeys[currentModuleIndex - 1];
      const prevModuleLessons = groupLessonsByModule()[prevModule];
      const lastLesson = prevModuleLessons[prevModuleLessons.length - 1];
      return completedItems[lastLesson._id];
    }

    return false;
  };

  const toggleModule = (module) => {
    setExpandedWeeks(prev => ({
      ...prev,
      [module]: !prev[module]
    }));
  };

  // Select content and fetch FAQs if applicable
  const selectContent = async (lesson) => {
    setCurrentContent(lesson);
    setNewQuestion('');
    setQuerySuccess(false);
    if (lesson && (lesson.type === 'Lesson' || lesson.type === 'Video')) {
      await fetchFAQs(lesson._id);
    }
  };

  const fetchFAQs = async (lessonId) => {
    try {
      const response = await getLessonFAQs(lessonId);
      setFaqs(response);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      setFaqs([]);
    }
  };

  const handleSubmitQuery = async () => {
    if (!newQuestion.trim() || !currentContent) return;

    setSubmittingQuery(true);
    try {
      await submitQuery(currentContent._id, newQuestion.trim());
      setNewQuestion('');
      setQuerySuccess(true);
      setTimeout(() => setQuerySuccess(false), 3000);
    } catch (error) {
      console.error('Error submitting query:', error);
      alert(error.message || 'Failed to submit query. Please try again.');
    } finally {
      setSubmittingQuery(false);
    }
  };

  // Mark lesson as completed
  const markAsCompleted = (lessonId) => {
    if (completedItems[lessonId]) return; // Don't re-mark
    
    const newCompleted = { ...completedItems, [lessonId]: true };
    saveProgress(newCompleted);
  };

  const handleQuizAnswer = (questionId, answerIndex) => {
    const newAnswers = {
      ...quizAnswers,
      [`${currentContent._id}_${questionId}`]: answerIndex
    };
    setQuizAnswers(newAnswers);
  };

  const submitQuiz = () => {
    if (!currentContent || currentContent.type !== 'Quiz') return;

    let correct = 0;
    const total = currentContent.quizQuestions.length;

    currentContent.quizQuestions.forEach((question, index) => {
      const userAnswer = quizAnswers[`${currentContent._id}_q${index}`];
      if (userAnswer === question.answer) {
        correct++;
      }
    });

    const score = (correct / total) * 100;
    const passed = score >= 70;

    const newResults = {
      ...quizResults,
      [currentContent._id]: { correct, total, score, passed }
    };

    saveQuizData(quizAnswers, newResults);

    if (passed) {
      markAsCompleted(currentContent._id);
    }
  };

  const retakeQuiz = () => {
    const newAnswers = { ...quizAnswers };
    const newResults = { ...quizResults };

    currentContent.quizQuestions.forEach((question, index) => {
      delete newAnswers[`${currentContent._id}_q${index}`];
    });

    delete newResults[currentContent._id];

    saveQuizData(newAnswers, newResults);
  };

  // Automatically select the first uncompleted lesson on load
  useEffect(() => {
    if (loading || lessons.length === 0 || currentContent) {
      return;
    }

    const moduleLessons = groupLessonsByModule();
    const moduleKeys = Object.keys(moduleLessons);
    let firstUncompletedLesson = null;

    for (const module of moduleKeys) {
      const lessonsInModule = moduleLessons[module];
      for (let i = 0; i < lessonsInModule.length; i++) {
        const lesson = lessonsInModule[i];
        
        const unlocked = isUnlocked(module, i);
        const completed = completedItems[lesson._id];

        if (unlocked && !completed) {
          firstUncompletedLesson = lesson;
          break;
        }
      }
      if (firstUncompletedLesson) {
        break;
      }
    }

    if (firstUncompletedLesson) {
      selectContent(firstUncompletedLesson);
    } else if (lessons.length > 0) {
      // Fallback: If all are complete, show the first lesson
      const firstModuleKey = moduleKeys[0];
      if (firstModuleKey && moduleLessons[firstModuleKey].length > 0) {
        selectContent(moduleLessons[firstModuleKey][0]);
      }
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessons, completedItems, loading, currentContent]);

  // Renders the Previous/Next navigation buttons
  const renderNavigationButtons = () => {
    const { prevLesson, nextLesson, isCurrentCompleted } = navigationDetails;

    if (!currentContent) return null;

    return (
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
        {prevLesson ? (
          <button
            onClick={() => selectContent(prevLesson)}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              isDark
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>
        ) : (
          <div /> // Spacer
        )}

        {nextLesson && (
          <button
            onClick={() => selectContent(nextLesson)}
            disabled={!isCurrentCompleted}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              !isCurrentCompleted
                ? isDark
                  ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : `bg-blue-600 hover:bg-blue-700 text-white`
            }`}
            title={!isCurrentCompleted ? "Complete the current topic to unlock" : "Next Topic"}
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    );
  };

  // Renders the FAQ "Ask" form and the list of FAQs
  const renderFAQSection = () => {
    return (
      <div className="mt-8 pt-8 space-y-6 border-t border-gray-200 dark:border-gray-700">
        <div className={`p-6 rounded-lg transition-colors duration-200 ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border`}>
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            <h2 className={`text-xl font-semibold transition-colors duration-200 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Ask a Question
            </h2>
          </div>
          <div className="space-y-3">
            <textarea
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Have a question about this lesson? Ask here..."
              rows={3}
              className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <div className="flex items-center justify-between">
              <button
                onClick={handleSubmitQuery}
                disabled={!newQuestion.trim() || submittingQuery}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  !newQuestion.trim() || submittingQuery
                    ? isDark
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <Send className="w-4 h-4" />
                {submittingQuery ? 'Submitting...' : 'Submit Question'}
              </button>
              {querySuccess && (
                <span className="text-sm text-green-600 font-medium">
                  Question submitted successfully!
                </span>
              )}
            </div>
          </div>
        </div>

        {faqs.length > 0 && (
          <div className={`p-6 rounded-lg transition-colors duration-200 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } border`}>
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
              <h2 className={`text-xl font-semibold transition-colors duration-200 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Frequently Asked Questions
              </h2>
            </div>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div
                  key={faq._id}
                  className={`p-4 rounded-lg transition-colors duration-200 ${
                    isDark ? 'bg-gray-700' : 'bg-gray-50'
                  }`}
                >
                  <div className="mb-2">
                    <p className={`font-medium transition-colors duration-200 ${
                      isDark ? 'text-blue-300' : 'text-blue-700'
                    }`}>
                      Q: {faq.question}
                    </p>
                  </div>
                  <div>
                    <p className={`transition-colors duration-200 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      A: {faq.answer}
                    </p>
                  </div>
                  <div className={`mt-2 text-xs transition-colors duration-200 ${
                    isDark ? 'text-gray-500' : 'text-gray-500'
                  }`}>
                    Answered by {faq.instructorName}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Renders the collapsible sidebar
  const renderSidebar = () => {
    if (!subject) return null;

    const moduleLessons = groupLessonsByModule();

    return (
      <div className={`fixed left-0 top-20 w-80 bottom-0 overflow-y-auto border-r transition-all duration-300 z-40 md:translate-x-0 ${
        sidebarVisible ? 'translate-x-0' : '-translate-x-full'
      } ${
        isDark
          ? 'bg-gray-900 border-gray-700'
          : 'bg-white border-gray-200'
      }`}>
        <div className={`p-4 border-b transition-colors duration-200 ${
          isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
        }`}>
          <Link
            to="/student/learning"
            className={`mb-3 text-sm flex items-center gap-2 transition-colors duration-200 ${
              isDark
                ? 'text-gray-400 hover:text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to Subjects
          </Link>
          <div className="flex items-center justify-between mb-2">
            <h2 className={`text-lg font-bold transition-colors duration-200 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {subject?.name}
            </h2>
            <button
              onClick={() => setSidebarVisible(!sidebarVisible)}
              className={`p-1 rounded transition-colors duration-200 ${
                isDark
                  ? 'hover:bg-gray-700 text-gray-300'
                  : 'hover:bg-gray-200 text-gray-600'
              }`}
            >
              {sidebarVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className={`text-sm transition-colors duration-200 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Complete lessons and quizzes to unlock new content
          </p>
          <div className="mt-3">
            <div className={`text-xs font-medium mb-1 transition-colors duration-200 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Progress: {completedLessonCount}/{lessons.length}
            </div>
            <div className={`w-full h-2 rounded-full transition-colors duration-200 ${
              isDark ? 'bg-gray-700' : 'bg-gray-200'
            }`}>
              <div
                className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                style={{
                  width: `${lessons.length > 0 ? (completedLessonCount / lessons.length) * 100 : 0}%`
                }}
              />
            </div>
          </div>
        </div>

        <div className="p-2">
          {Object.keys(moduleLessons).map((module) => (
            <div key={module} className="mb-2">
              <button
                onClick={() => toggleModule(module)}
                className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-all duration-200 ${
                  isDark
                    ? 'hover:bg-gray-800 text-gray-200'
                    : 'hover:bg-gray-100 text-gray-800'
                }`}
              >
                <span className="font-medium text-sm">{module}</span>
                {expandedWeeks[module] ?
                  <ChevronDown className="w-4 h-4" /> :
                  <ChevronRight className="w-4 h-4" />
                }
              </button>

              {expandedWeeks[module] && (
                <div className="ml-4 mt-2 space-y-1">
                  {moduleLessons[module].map((lesson, lessonIndex) => {
                    const unlocked = isUnlocked(module, lessonIndex);
                    const completed = completedItems[lesson._id];
                    const isQuiz = lesson.type === 'Quiz';
                    const quizResult = quizResults[lesson._id];

                    return (
                      <button
                        key={lesson._id}
                        onClick={() => unlocked && selectContent(lesson)}
                        disabled={!unlocked}
                        className={`w-full flex items-center justify-between p-2 rounded text-left text-sm transition-all duration-200 ${
                          !unlocked
                            ? isDark
                              ? 'text-gray-600 cursor-not-allowed'
                              : 'text-gray-400 cursor-not-allowed'
                            : currentContent?._id === lesson._id
                              ? isDark
                                ? 'bg-blue-900 text-blue-200 border border-blue-700'
                                : 'bg-blue-100 text-blue-800 border border-blue-300'
                              : isDark
                                ? 'hover:bg-gray-800 text-gray-300'
                                : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          {isQuiz ? (
                            <HelpCircle className="w-4 h-4" />
                          ) : lesson.type === 'Video' ? (
                            <Play className="w-4 h-4" />
                          ) : (
                            <BookOpen className="w-4 h-4" />
                          )}
                          <span>{lesson.title}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {quizResult && (
                            <span className={`text-xs px-2 py-1 rounded ${
                              quizResult.passed
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {quizResult.score}%
                            </span>
                          )}
                          {!unlocked ? (
                            <Lock className="w-4 h-4" />
                          ) : completed ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <div className={`w-4 h-4 rounded-full border-2 transition-colors duration-200 ${
                              isDark ? 'border-gray-600' : 'border-gray-300'
                            }`} />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Renders text-based lesson content
  const renderLessonContent = () => {
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

        {renderNavigationButtons()}
        {renderFAQSection()}
      </div>
    );
  };

  // Renders video content (YouTube or direct file)
  const renderVideoContent = () => {
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
        
        {renderNavigationButtons()}
        {renderFAQSection()}
      </div>
    );
  };

  // Renders quiz content
  const renderQuizContent = () => {
    if (!currentContent || currentContent.type !== 'Quiz') return null;

    const quizResult = quizResults[currentContent._id];
    const hasAnswered = currentContent.quizQuestions.every((q, index) =>
      quizAnswers[`${currentContent._id}_q${index}`] !== undefined
    );

    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className={`text-3xl font-bold mb-2 transition-colors duration-200 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            {currentContent.title}
          </h1>
          {quizResult && (
            <div className={`p-4 rounded-lg mb-4 ${
              quizResult.passed
                ? 'bg-green-100 text-green-800 border border-green-200'
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              <h3 className="font-semibold mb-1">Results</h3>
              <p>You scored {quizResult.correct} out of {quizResult.total} ({quizResult.score}%)</p>
              {quizResult.passed ? (
                <p className="text-sm mt-1">Quiz passed! You can proceed to the next lesson.</p>
              ) : (
                <p className="text-sm mt-1">You need 70% to pass. Please review and retake.</p>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {currentContent.quizQuestions.map((question, qIndex) => {
            const userAnswer = quizAnswers[`${currentContent._id}_q${qIndex}`];
            const showResult = quizResult !== undefined;

            return (
              <div key={qIndex} className={`p-6 rounded-lg transition-colors duration-200 ${
                isDark ? 'bg-gray-800' : 'bg-white'
              } shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-semibold mb-4 transition-colors duration-200 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Question {qIndex + 1}: {question.question}
                </h3>

                <div className="space-y-2">
                  {question.options.map((option, oIndex) => {
                    let buttonClass = `w-full text-left p-3 rounded border transition-all duration-200 ${
                      isDark
                        ? 'border-gray-600 hover:border-gray-500'
                        : 'border-gray-300 hover:border-gray-400'
                    }`;

                    if (showResult) {
                      if (option === question.answer) {
                        buttonClass += ` bg-green-100 border-green-300 text-green-800`;
                      } else if (option === userAnswer && option !== question.answer) {
                        buttonClass += ` bg-red-100 border-red-300 text-red-800`;
                      } else {
                        buttonClass += isDark
                          ? ` bg-gray-700 text-gray-300`
                          : ` bg-gray-50 text-gray-600`;
                      }
                    } else {
                      if (userAnswer === option) {
                        buttonClass += ` bg-blue-100 border-blue-300 text-blue-800`;
                      } else {
                        buttonClass += isDark
                          ? ` bg-gray-700 text-gray-300 hover:bg-gray-600`
                          : ` bg-gray-50 text-gray-700 hover:bg-gray-100`;
                      }
                    }

                    return (
                      <button
                        key={oIndex}
                        onClick={() => !showResult && handleQuizAnswer(`q${qIndex}`, option)}
                        disabled={showResult}
                        className={buttonClass}
                      >
                        <div className="flex items-center">
                          <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                            userAnswer === option
                              ? 'border-blue-500 bg-blue-500'
                              : isDark
                                ? 'border-gray-500'
                                : 'border-gray-400'
                          }`}>
                            {userAnswer === option && (
                              <div className="w-2 h-2 rounded-full bg-white" />
                            )}
                          </div>
                          {option}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {showResult && question.explanation && (
                  <div className={`mt-4 p-3 rounded transition-colors duration-200 ${
                    isDark ? 'bg-gray-700' : 'bg-blue-50'
                  } border ${isDark ? 'border-gray-600' : 'border-blue-200'}`}>
                    <p className={`text-sm transition-colors duration-200 ${
                      isDark ? 'text-gray-300' : 'text-blue-800'
                    }`}>
                      <strong>Explanation:</strong> {question.explanation}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex justify-between">
          {quizResult && !quizResult.passed && (
            <button
              onClick={retakeQuiz}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors duration-200"
            >
              Retake Quiz
            </button>
          )}

          <div className="ml-auto">
            {!quizResult ? (
              <button
                onClick={submitQuiz}
                disabled={!hasAnswered}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  hasAnswered
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : isDark
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Submit Quiz
              </button>
            ) : quizResult.passed ? (
              <div className="flex items-center text-green-600">
                <CheckCircle className="w-5 h-5 mr-2" />
                Quiz Completed
              </div>
            ) : null}
          </div>
        </div>
        
        {renderNavigationButtons()}
        {/* Note: No FAQ section for Quizzes by design, but you could add renderFAQSection() here if desired */}
      </div>
    );
  };

  // Loading spinner
  if (loading) {
    return (
      <div className={`flex flex-col min-h-screen transition-colors duration-200 ${
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="flex-1 flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loading content...</p>
          </div>
        </div>
      </div>
    );
  }

  // Main component render
  return (
    <div className={`flex flex-col min-h-screen transition-colors duration-200 ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="flex flex-1 pt-20">
        {renderSidebar()}

        {/* Mobile overlay for sidebar */}
        {sidebarVisible && subject && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden top-20"
            onClick={() => setSidebarVisible(false)}
          />
        )}

        {/* Main content area */}
        <div className={`flex-1 flex flex-col min-h-0 ${subject ? 'md:ml-80' : ''} transition-all duration-300`}>
          {subject && (
            <>
              {/* Header bar for main content */}
              <div className={`p-4 border-b transition-colors duration-200 ${
                isDark
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {!sidebarVisible && (
                      <button
                        onClick={() => setSidebarVisible(true)}
                        className={`p-2 rounded transition-colors duration-200 ${
                          isDark
                            ? 'hover:bg-gray-700 text-gray-300'
                            : 'hover:bg-gray-100 text-gray-600'
                        }`}
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    )}
                    {currentContent && (
                      <div>
                        <h1 className={`text-xl font-semibold transition-colors duration-200 ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {currentContent.title}
                        </h1>
                        <p className={`text-sm transition-colors duration-200 ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {currentContent.type}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Scrollable content body */}
              <div className="flex-1 p-6 overflow-y-auto min-h-0">
                {currentContent ? (
                  currentContent.type === 'Lesson' ? renderLessonContent() :
                  currentContent.type === 'Quiz' ? renderQuizContent() :
                  renderVideoContent()
                ) : (
                  // Welcome message if no content is selected
                  <div className={`text-center py-12 transition-colors duration-200 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <h2 className="text-xl font-semibold mb-2">Welcome to {subject?.name}</h2>
                    <p>Select a lesson from the sidebar to get started</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
 
export default SubjectContent;