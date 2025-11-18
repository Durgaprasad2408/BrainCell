import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getAllSubjects, checkEnrollment } from '../../api/subjectService';
import { getAllLessons, markLessonComplete } from '../../api/lessonService';
import { getLessonFAQs, submitQuery } from '../../api/faqService';
import { useTheme } from '../../contexts/ThemeContext';
import LoadingSpinner from '../../components/subject/LoadingSpinner';
import WelcomeMessage from '../../components/subject/WelcomeMessage';
import SubjectSidebar from '../../components/subject/SubjectSidebar';
import LessonContent from '../../components/subject/LessonContent';
import VideoContent from '../../components/subject/VideoContent';
import QuizContent from '../../components/subject/QuizContent';
import { Eye } from 'lucide-react';

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
  const markAsCompleted = async (lessonId) => {
    if (completedItems[lessonId]) return; // Don't re-mark
    
    try {
      // 1. Call backend API to record completion
      await markLessonComplete(lessonId);

      // 2. Update local state/storage
      const newCompleted = { ...completedItems, [lessonId]: true };
      saveProgress(newCompleted);
      
      // Optional: Re-fetch lessons to update progress bar immediately if needed,
      // but local state update should suffice for immediate visual feedback.
      // If the instructor view is still showing 0, it means the student's action
      // wasn't recorded. This API call fixes that.

    } catch (error) {
      console.error('Failed to mark lesson complete on server:', error);
      // Optionally show an error message to the user
      alert('Failed to record completion on the server. Please try again.');
    }
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







  // Loading spinner
  if (loading) {
    return <LoadingSpinner isDark={isDark} />;
  }

  // Main component render
  return (
    <div className={`flex flex-col min-h-screen transition-colors duration-200 ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="flex flex-1 pt-20">
        <SubjectSidebar
          subject={subject}
          lessons={lessons}
          completedItems={completedItems}
          quizResults={quizResults}
          expandedWeeks={expandedWeeks}
          toggleModule={toggleModule}
          selectContent={selectContent}
          sidebarVisible={sidebarVisible}
          setSidebarVisible={setSidebarVisible}
          completedLessonCount={completedLessonCount}
          isDark={isDark}
          groupLessonsByModule={groupLessonsByModule}
          isUnlocked={isUnlocked}
        />

        {/* Mobile overlay for sidebar */}
        {sidebarVisible && subject && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden top-20"
            onClick={() => setSidebarVisible(false)}
          />
        )}

        {/* Main content area */}
        <div className={`flex-1 flex flex-col min-h-0 ${subject && sidebarVisible ? 'md:ml-80' : ''} transition-all duration-300`}>
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
                  currentContent.type === 'Lesson' ? (
                    <LessonContent
                      currentContent={currentContent}
                      completedItems={completedItems}
                      markAsCompleted={markAsCompleted}
                      navigationDetails={navigationDetails}
                      selectContent={selectContent}
                      faqs={faqs}
                      newQuestion={newQuestion}
                      setNewQuestion={setNewQuestion}
                      handleSubmitQuery={handleSubmitQuery}
                      submittingQuery={submittingQuery}
                      querySuccess={querySuccess}
                      isDark={isDark}
                    />
                  ) :
                  currentContent.type === 'Quiz' ? (
                    <QuizContent
                      currentContent={currentContent}
                      quizResults={quizResults}
                      quizAnswers={quizAnswers}
                      handleQuizAnswer={handleQuizAnswer}
                      submitQuiz={submitQuiz}
                      retakeQuiz={retakeQuiz}
                      navigationDetails={navigationDetails}
                      selectContent={selectContent}
                      isDark={isDark}
                    />
                  ) :
                  (
                    <VideoContent
                      currentContent={currentContent}
                      markAsCompleted={markAsCompleted}
                      navigationDetails={navigationDetails}
                      selectContent={selectContent}
                      faqs={faqs}
                      newQuestion={newQuestion}
                      setNewQuestion={setNewQuestion}
                      handleSubmitQuery={handleSubmitQuery}
                      submittingQuery={submittingQuery}
                      querySuccess={querySuccess}
                      isDark={isDark}
                    />
                  )
                ) : (
                  // Welcome message if no content is selected
                  <WelcomeMessage subject={subject} isDark={isDark} />
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