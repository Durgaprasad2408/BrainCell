import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import {
  XCircle
} from 'lucide-react';
import * as challengeService from '../../api/challengeService';
import MetricsHeader from '../../components/metrics/MetricsHeader';
import KeyMetricsCards from '../../components/metrics/KeyMetricsCards';
import ScoreDistribution from '../../components/metrics/ScoreDistribution';
import QuestionPerformance from '../../components/metrics/QuestionPerformance';
import RecentSubmissions from '../../components/metrics/RecentSubmissions';

const ChallengeMetrics = () => {
  const { challengeId } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('scoreDistribution');

  useEffect(() => {
    fetchMetrics();
  }, [challengeId]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await challengeService.getChallengeMetrics(challengeId);
      setMetrics(response.data);
    } catch (error) {
      console.error('Error fetching metrics:', error);
      setError('Failed to load challenge metrics');
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className={`text-center p-8 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {error || 'Challenge not found'}
          </h2>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { challenge, metrics: metricsData, questionStats, recentSubmissions } = metrics;

  return (
    <div className="min-h-screen">
      <MetricsHeader challenge={challenge} metricsData={metricsData} />

      <div className="p-6 space-y-6">
        <KeyMetricsCards
          metricsData={metricsData}
          questionStats={questionStats}
          setActiveTab={setActiveTab}
          activeTab={activeTab}
        />

        {/* Tab Content */}
        {activeTab === 'scoreDistribution' && <ScoreDistribution metricsData={metricsData} />}
        {activeTab === 'questionPerformance' && <QuestionPerformance questionStats={questionStats} />}
        {activeTab === 'recentSubmissions' && <RecentSubmissions recentSubmissions={recentSubmissions} />}
      </div>
    </div>
  );
};

export default ChallengeMetrics;