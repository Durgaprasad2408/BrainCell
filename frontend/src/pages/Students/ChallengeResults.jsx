// src/pages/Students/ChallengeResults.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as challengeService from '../../api/challengeService';
import { useTheme } from '../../contexts/ThemeContext';
import Results from './Results'; // Import your existing Results component
import { ArrowLeft } from 'lucide-react';

const ChallengeResults = () => {
  const { challengeId } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [submission, setSubmission] = useState(null);
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch both the user's submission and the challenge details
        const [subRes, chalRes] = await Promise.all([
          challengeService.getUserSubmission(challengeId),
          challengeService.getChallengeById(challengeId) 
        ]);

        if (subRes.success) {
          setSubmission(subRes.data);
        } else {
          throw new Error(subRes.message || 'Failed to load submission');
        }

        if (chalRes.success) {
          setChallenge(chalRes.data);
        } else {
          throw new Error(chalRes.message || 'Failed to load challenge details');
        }

      } catch (err) {
        console.error('Error fetching results data:', err);
        setError(err.message || 'Could not load results.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [challengeId]);

  const handleBack = () => {
    navigate('/student/practice');
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} pt-20 pb-8 transition-colors duration-200`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loading results...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} pt-20 pb-8 transition-colors duration-200`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <button onClick={handleBack} className={`flex items-center space-x-2 mb-4 ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Challenges</span>
            </button>
            <div className="text-center py-8">
              <p className={`text-lg ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pass the fetched data to the existing Results component
  return (
    <Results
      submission={submission}
      challenge={challenge}
      onBack={handleBack}
    />
  );
};

export default ChallengeResults;