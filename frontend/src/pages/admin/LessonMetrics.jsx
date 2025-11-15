import React, { useState, useEffect, Fragment } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { getLessonMetrics } from '../../api/lessonService';
import {
  ArrowLeft,
  Users,
  TrendingUp,
  BookOpen,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const LessonMetrics = () => {
  const { isDark } = useTheme();
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('completions');

  // Pagination states
  const [completionsCurrentPage, setCompletionsCurrentPage] = useState(1);
  const [completionsItemsPerPage, setCompletionsItemsPerPage] = useState(5);
  const [quizCurrentPage, setQuizCurrentPage] = useState(1);
  const [quizItemsPerPage, setQuizItemsPerPage] = useState(5);

  // Reset to first page when itemsPerPage changes
  useEffect(() => {
    setCompletionsCurrentPage(1);
  }, [completionsItemsPerPage]);

  useEffect(() => {
    setQuizCurrentPage(1);
  }, [quizItemsPerPage]);

  useEffect(() => {
    fetchMetrics();
  }, [lessonId]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await getLessonMetrics(lessonId);
      if (response.success) {
        setLesson(response.data.lesson);
        setMetrics(response.data.metrics);
      }
    } catch (error) {
      console.error('Error fetching lesson metrics:', error);
      setError(error.response?.data?.message || 'Failed to load lesson metrics');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="mb-4 p-4 rounded-lg bg-red-100 border border-red-400 text-red-700">
          {error}
        </div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
            Lesson Metrics
          </h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Performance analytics for {lesson?.title}
          </p>
        </div>
      </div>

      {/* Lesson Info Card */}
      <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6 mb-6`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
              {lesson?.title}
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
              Subject: {lesson?.subject}
            </p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
              Module: {lesson?.module}
            </p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Type: {lesson?.type}
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Duration
              </span>
            </div>
            <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {lesson?.duration}
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-green-500" />
              <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Created
              </span>
            </div>
            <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {formatDate(lesson?.createdAt)}
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-purple-500" />
              <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Status
              </span>
            </div>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              lesson?.status === 'Published'
                ? isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
                : isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {lesson?.status}
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div
          className={`${isDark ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-gray-200 hover:bg-gray-50'} rounded-xl border p-6 cursor-pointer transition-all duration-200 ${activeTab === 'completions' ? 'ring-2 ring-blue-500' : ''}`}
          onClick={() => setActiveTab(activeTab === 'completions' ? null : 'completions')}
        >
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-500" />
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Completions</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {metrics?.totalCompletions || 0}
              </p>
            </div>
          </div>
        </div>

        <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-green-500" />
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Completion Rate</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {metrics?.completionRate || 0}%
              </p>
            </div>
          </div>
        </div>

        <div
          className={`${isDark ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-gray-200 hover:bg-gray-50'} rounded-xl border p-6 cursor-pointer transition-all duration-200 ${activeTab === 'content' ? 'ring-2 ring-purple-500' : ''}`}
          onClick={() => setActiveTab(activeTab === 'content' ? null : 'content')}
        >
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-purple-500" />
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Content</p>
              <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {lesson?.type || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-indigo-500" />
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Students</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {metrics?.totalStudents || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'completions' && (
        <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border`}>
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Recent Completions
              </h3>

              {/* Items per page dropdown */}
              <div className="flex items-center gap-2">
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Show:
                </span>
                <select
                  value={completionsItemsPerPage}
                  onChange={(e) => setCompletionsItemsPerPage(Number(e.target.value))}
                  className={`px-3 py-1 text-sm border rounded-md ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                  <option value={25}>25</option>
                </select>
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  per page
                </span>
              </div>
            </div>
          </div>

          {metrics?.recentCompletions?.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <tr>
                      <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                        #
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                        Student
                      </th>
                      {lesson?.type === 'Quiz' && (
                        <>
                          <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                            Questions Attempted
                          </th>
                          <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                            Correct
                          </th>
                          <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                            Score
                          </th>
                        </>
                      )}
                      <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                        {lesson?.type === 'Quiz' ? 'Submitted' : 'Completed At'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {(() => {
                      const totalItems = metrics.recentCompletions.length;
                      const totalPages = Math.ceil(totalItems / completionsItemsPerPage);
                      const startIndex = (completionsCurrentPage - 1) * completionsItemsPerPage;
                      const endIndex = startIndex + completionsItemsPerPage;
                      const currentItems = metrics.recentCompletions.slice(startIndex, endIndex);

                      return currentItems.map((completion, index) => (
                        <tr key={index} className={`${isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'} transition-colors`}>
                          <td className="px-6 py-4">
                            <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                              {startIndex + index + 1}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {completion.user}
                              </div>
                              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {completion.email}
                              </div>
                            </div>
                          </td>
                          {lesson?.type === 'Quiz' && (
                            <>
                              <td className="px-6 py-4">
                                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                                  {lesson?.quizQuestions?.length || 0}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                                  isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
                                }`}>
                                  {Math.floor(Math.random() * (lesson?.quizQuestions?.length || 5))} {/* Placeholder */}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {Math.floor(Math.random() * 100)}% {/* Placeholder */}
                                  </span>
                                </div>
                              </td>
                            </>
                          )}
                          <td className="px-6 py-4">
                            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                              {formatDate(completion.completedAt)}
                            </span>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  {/* Pagination info */}
                  <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {(() => {
                      const totalItems = metrics.recentCompletions.length;
                      const totalPages = Math.ceil(totalItems / completionsItemsPerPage);
                      const startIndex = (completionsCurrentPage - 1) * completionsItemsPerPage;
                      const endIndex = startIndex + completionsItemsPerPage;
                      return `Showing ${startIndex + 1} to ${Math.min(endIndex, totalItems)} of ${totalItems} completions`;
                    })()}
                  </div>

                  {/* Page navigation */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCompletionsCurrentPage(completionsCurrentPage - 1)}
                      disabled={completionsCurrentPage === 1}
                      className={`p-2 rounded-md ${
                        completionsCurrentPage === 1
                          ? 'text-gray-400 cursor-not-allowed'
                          : isDark
                            ? 'text-gray-300 hover:bg-gray-700'
                            : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {/* Page numbers */}
                    <div className="flex items-center gap-1">
                      {(() => {
                        const totalItems = metrics.recentCompletions.length;
                        const totalPages = Math.ceil(totalItems / completionsItemsPerPage);
                        return Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter(page => {
                            // Show first page, last page, current page, and pages around current
                            return (
                              page === 1 ||
                              page === totalPages ||
                              (page >= completionsCurrentPage - 1 && page <= completionsCurrentPage + 1)
                            );
                          })
                          .map((page, index, array) => (
                            <Fragment key={page}>
                              {index > 0 && array[index - 1] !== page - 1 && (
                                <span className={`px-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>...</span>
                              )}
                              <button
                                onClick={() => setCompletionsCurrentPage(page)}
                                className={`px-3 py-1 text-sm rounded-md ${
                                  completionsCurrentPage === page
                                    ? 'bg-blue-600 text-white'
                                    : isDark
                                      ? 'text-gray-300 hover:bg-gray-700'
                                      : 'text-gray-700 hover:bg-gray-100'
                                }`}
                              >
                                {page}
                              </button>
                            </Fragment>
                          ));
                      })()}
                    </div>

                    <button
                      onClick={() => setCompletionsCurrentPage(completionsCurrentPage + 1)}
                      disabled={completionsCurrentPage === Math.ceil(metrics.recentCompletions.length / completionsItemsPerPage)}
                      className={`p-2 rounded-md ${
                        completionsCurrentPage === Math.ceil(metrics.recentCompletions.length / completionsItemsPerPage)
                          ? 'text-gray-400 cursor-not-allowed'
                          : isDark
                            ? 'text-gray-300 hover:bg-gray-700'
                            : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="p-6">
              <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                No completions yet
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'content' && (
        <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
          <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
            {lesson?.type} Content
          </h3>

          {/* Content Cards - Only for Lesson type */}
          {lesson?.type === 'Lesson' && lesson?.contentCards && lesson.contentCards.length > 0 && (
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
          )}

          {/* Quiz Questions - Only for Quiz type */}
          {lesson?.type === 'Quiz' && lesson?.quizQuestions && lesson.quizQuestions.length > 0 && (
            <>
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h4 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Quiz Questions ({lesson.quizQuestions.length})
                  </h4>

                  {/* Items per page dropdown */}
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Show:
                    </span>
                    <select
                      value={quizItemsPerPage}
                      onChange={(e) => setQuizItemsPerPage(Number(e.target.value))}
                      className={`px-3 py-1 text-sm border rounded-md ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={15}>15</option>
                      <option value={20}>20</option>
                      <option value={25}>25</option>
                    </select>
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      per page
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-3">
                  {(() => {
                    const totalItems = lesson.quizQuestions.length;
                    const totalPages = Math.ceil(totalItems / quizItemsPerPage);
                    const startIndex = (quizCurrentPage - 1) * quizItemsPerPage;
                    const endIndex = startIndex + quizItemsPerPage;
                    const currentItems = lesson.quizQuestions.slice(startIndex, endIndex);

                    return currentItems.map((question, index) => (
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
                    ));
                  })()}
                </div>
              </div>

              {/* Pagination Controls for Quiz */}
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  {/* Pagination info */}
                  <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {(() => {
                      const totalItems = lesson.quizQuestions.length;
                      const totalPages = Math.ceil(totalItems / quizItemsPerPage);
                      const startIndex = (quizCurrentPage - 1) * quizItemsPerPage;
                      const endIndex = startIndex + quizItemsPerPage;
                      return `Showing ${startIndex + 1} to ${Math.min(endIndex, totalItems)} of ${totalItems} questions`;
                    })()}
                  </div>

                  {/* Page navigation */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuizCurrentPage(quizCurrentPage - 1)}
                      disabled={quizCurrentPage === 1}
                      className={`p-2 rounded-md ${
                        quizCurrentPage === 1
                          ? 'text-gray-400 cursor-not-allowed'
                          : isDark
                            ? 'text-gray-300 hover:bg-gray-700'
                            : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {/* Page numbers */}
                    <div className="flex items-center gap-1">
                      {(() => {
                        const totalItems = lesson.quizQuestions.length;
                        const totalPages = Math.ceil(totalItems / quizItemsPerPage);
                        return Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter(page => {
                            // Show first page, last page, current page, and pages around current
                            return (
                              page === 1 ||
                              page === totalPages ||
                              (page >= quizCurrentPage - 1 && page <= quizCurrentPage + 1)
                            );
                          })
                          .map((page, index, array) => (
                            <Fragment key={page}>
                              {index > 0 && array[index - 1] !== page - 1 && (
                                <span className={`px-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>...</span>
                              )}
                              <button
                                onClick={() => setQuizCurrentPage(page)}
                                className={`px-3 py-1 text-sm rounded-md ${
                                  quizCurrentPage === page
                                    ? 'bg-blue-600 text-white'
                                    : isDark
                                      ? 'text-gray-300 hover:bg-gray-700'
                                      : 'text-gray-700 hover:bg-gray-100'
                                }`}
                              >
                                {page}
                              </button>
                            </Fragment>
                          ));
                      })()}
                    </div>

                    <button
                      onClick={() => setQuizCurrentPage(quizCurrentPage + 1)}
                      disabled={quizCurrentPage === Math.ceil(lesson.quizQuestions.length / quizItemsPerPage)}
                      className={`p-2 rounded-md ${
                        quizCurrentPage === Math.ceil(lesson.quizQuestions.length / quizItemsPerPage)
                          ? 'text-gray-400 cursor-not-allowed'
                          : isDark
                            ? 'text-gray-300 hover:bg-gray-700'
                            : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Video Content - Only for Video type */}
          {lesson?.type === 'Video' && lesson?.videoContent && (
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
          )}

          {/* No content message */}
          {((lesson?.type === 'Lesson' && (!lesson?.contentCards || lesson.contentCards.length === 0)) ||
            (lesson?.type === 'Quiz' && (!lesson?.quizQuestions || lesson.quizQuestions.length === 0)) ||
            (lesson?.type === 'Video' && !lesson?.videoContent)) && (
            <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              No {lesson?.type?.toLowerCase()} content available for this lesson
            </p>
          )}
        </div>
      )}

    </div>
  );
};

export default LessonMetrics;