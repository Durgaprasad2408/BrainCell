import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, Trash2, Eye, EyeOff, CheckCircle, Clock, BookOpen } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { getQueriesForInstructor, answerQuery, deleteQuery, togglePublishStatus } from '../../api/faqService';

const Queries = () => {
  const { isDark } = useTheme();
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQueries(true);

    const interval = setInterval(() => {
      fetchQueries(false);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const fetchQueries = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      const response = await getQueriesForInstructor();
      console.log('Fetched queries:', response);
      setQueries(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error fetching queries:', error);
      alert(`Failed to fetch queries: ${error.message || 'Unknown error'}`);
      setQueries([]);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  const handleAnswerSubmit = async () => {
    if (!selectedQuery || !answer.trim()) return;

    setSubmitting(true);
    try {
      await answerQuery(selectedQuery._id, answer.trim());
      setAnswer('');
      setSelectedQuery(null);
      await fetchQueries();
    } catch (error) {
      console.error('Error answering query:', error);
      alert(error.message || 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (queryId) => {
    if (!confirm('Are you sure you want to delete this query?')) return;

    try {
      await deleteQuery(queryId);
      await fetchQueries();
    } catch (error) {
      console.error('Error deleting query:', error);
      alert(error.message || 'Failed to delete query');
    }
  };

  const handleTogglePublish = async (queryId) => {
    try {
      await togglePublishStatus(queryId);
      await fetchQueries();
    } catch (error) {
      console.error('Error toggling publish status:', error);
      alert(error.message || 'Failed to update FAQ status');
    }
  };

  const filteredQueries = queries.filter(query => {
    if (filter === 'pending') return query.status === 'pending';
    if (filter === 'answered') return query.status === 'answered';
    return true;
  });

  const pendingCount = queries.filter(q => q.status === 'pending').length;
  const answeredCount = queries.filter(q => q.status === 'answered').length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-3xl font-bold mb-2 transition-colors duration-200 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          Student Queries
        </h1>
        <p className={`transition-colors duration-200 ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Answer student questions and manage FAQs
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : isDark
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All ({queries.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            filter === 'pending'
              ? 'bg-orange-600 text-white'
              : isDark
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => setFilter('answered')}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            filter === 'answered'
              ? 'bg-green-600 text-white'
              : isDark
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Answered ({answeredCount})
        </button>
      </div>

      {filteredQueries.length === 0 ? (
        <div className={`text-center py-12 rounded-lg transition-colors duration-200 ${
          isDark ? 'bg-gray-800' : 'bg-white'
        } border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <MessageCircle className={`w-16 h-16 mx-auto mb-4 ${
            isDark ? 'text-gray-600' : 'text-gray-400'
          }`} />
          <h3 className={`text-xl font-semibold mb-2 transition-colors duration-200 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            No queries found
          </h3>
          <p className={`transition-colors duration-200 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {filter === 'pending' ? 'All queries have been answered' : 'Students haven\'t asked any questions yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQueries.map((query) => (
            <div
              key={query._id}
              className={`p-6 rounded-lg transition-colors duration-200 ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              } border`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      query.status === 'pending'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {query.status === 'pending' ? (
                        <><Clock className="w-3 h-3 inline mr-1" />Pending</>
                      ) : (
                        <><CheckCircle className="w-3 h-3 inline mr-1" />Answered</>
                      )}
                    </span>
                    {query.status === 'answered' && (
                      <button
                        onClick={() => handleTogglePublish(query._id)}
                        className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                          query.isPublished
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {query.isPublished ? (
                          <><Eye className="w-3 h-3" />Published</>
                        ) : (
                          <><EyeOff className="w-3 h-3" />Hidden</>
                        )}
                      </button>
                    )}
                  </div>
                  <div className={`text-sm mb-2 transition-colors duration-200 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <span className="font-medium">{query.subjectName || query.subject?.name}</span>
                    {query.module && <span> • Module: {query.module}</span>}
                    {(query.lessonTitle || query.lesson?.title) && <span> • Topic: {query.lessonTitle || query.lesson?.title}</span>}
                  </div>
                  <div className={`text-sm transition-colors duration-200 ${
                    isDark ? 'text-gray-500' : 'text-gray-500'
                  }`}>
                    Asked by {query.studentName} on {new Date(query.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(query._id)}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    isDark
                      ? 'hover:bg-gray-700 text-red-400'
                      : 'hover:bg-gray-100 text-red-600'
                  }`}
                  title="Delete query"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className={`mb-4 p-4 rounded-lg transition-colors duration-200 ${
                isDark ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <p className={`font-medium mb-1 transition-colors duration-200 ${
                  isDark ? 'text-blue-300' : 'text-blue-700'
                }`}>
                  Question:
                </p>
                <p className={`transition-colors duration-200 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {query.question}
                </p>
              </div>

              {query.status === 'answered' ? (
                <div className={`p-4 rounded-lg transition-colors duration-200 ${
                  isDark ? 'bg-gray-700' : 'bg-green-50'
                } border ${isDark ? 'border-gray-600' : 'border-green-200'}`}>
                  <p className={`font-medium mb-1 transition-colors duration-200 ${
                    isDark ? 'text-green-300' : 'text-green-700'
                  }`}>
                    Answer:
                  </p>
                  <p className={`transition-colors duration-200 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {query.answer}
                  </p>
                  <div className={`mt-2 text-xs transition-colors duration-200 ${
                    isDark ? 'text-gray-500' : 'text-gray-600'
                  }`}>
                    Answered by {query.instructorName} on {new Date(query.answeredAt).toLocaleDateString()}
                  </div>
                </div>
              ) : (
                <div>
                  {selectedQuery?._id === query._id ? (
                    <div className="space-y-3">
                      <textarea
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="Type your answer here..."
                        rows={4}
                        className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleAnswerSubmit}
                          disabled={!answer.trim() || submitting}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                            !answer.trim() || submitting
                              ? isDark
                                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          <Send className="w-4 h-4" />
                          {submitting ? 'Submitting...' : 'Submit Answer'}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedQuery(null);
                            setAnswer('');
                          }}
                          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                            isDark
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedQuery(query)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Answer Query
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Queries;
