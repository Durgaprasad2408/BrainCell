import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { getLessonMetrics } from '../../api/lessonService';
import LessonMetricsHeader from '../../components/metrics/LessonMetricsHeader';
import LessonInfoCard from '../../components/metrics/LessonInfoCard';
import MetricsCards from '../../components/metrics/MetricsCards';
import CompletionsTable from '../../components/metrics/CompletionsTable';
import ContentDisplay from '../../components/metrics/ContentDisplay';

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
      <LessonMetricsHeader
        isDark={isDark}
        title="Lesson Metrics"
        subtitle={`Performance analytics for ${lesson?.title}`}
        onBack={() => navigate(-1)}
      />

      <LessonInfoCard
        lesson={lesson}
        isDark={isDark}
        formatDate={formatDate}
      />

      <MetricsCards
        metrics={metrics}
        lesson={lesson}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isDark={isDark}
      />

      {/* Tab Content */}
      {activeTab === 'completions' && (
        <CompletionsTable
          completions={metrics?.recentCompletions || []}
          lesson={lesson}
          currentPage={completionsCurrentPage}
          itemsPerPage={completionsItemsPerPage}
          onPageChange={setCompletionsCurrentPage}
          onItemsPerPageChange={setCompletionsItemsPerPage}
          isDark={isDark}
          formatDate={formatDate}
        />
      )}

      {activeTab === 'content' && (
        <ContentDisplay
          lesson={lesson}
          currentPage={quizCurrentPage}
          itemsPerPage={quizItemsPerPage}
          onPageChange={setQuizCurrentPage}
          onItemsPerPageChange={setQuizItemsPerPage}
          isDark={isDark}
        />
      )}

    </div>
  );
};

export default LessonMetrics;