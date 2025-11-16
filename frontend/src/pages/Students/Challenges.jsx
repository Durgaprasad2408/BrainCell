// src/pages/Students/Challenges.jsx

import React, { useState, useEffect } from 'react';
import * as challengeService from '../../api/challengeService';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import {
  ScheduleInfoBanner,
  ChallengeTabs,
  ChallengeGrid,
  ChallengePagination,
  formatDate,
  formatTime,
  determineStatus
} from '../../components/challenges';

const Challenges = () => {
  const { isAuthenticated } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('upcoming');
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [completedChallenges, setCompletedChallenges] = useState({});
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4; // 2 rows of 3 cards

  useEffect(() => {
    fetchChallenges();
  }, [isAuthenticated]);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when tab changes
  }, [activeTab]);



  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const response = await challengeService.getPublishedChallenges();
      const fetchedChallenges = response.data || [];

      const mappedChallenges = fetchedChallenges.map(challenge => {
        const startTime = new Date(challenge.startDateTime);
        const endTime = new Date(challenge.endDateTime);
        const durationMinutes = Math.round((endTime - startTime) / (1000 * 60));

        return {
          ...challenge,
          id: challenge._id,
          subtitle: challenge.description,
          date: formatDate(challenge.startDateTime),
          time: `${formatTime(challenge.startDateTime)} - ${formatTime(challenge.endDateTime)}`,
          status: determineStatus(challenge),
          participants: challenge.attempts || 0,
          questionsCount: challenge.numberOfQuestions || challenge.questions?.length || 0,
          duration: durationMinutes,
          toppers: [],
          // We only need to know if questions exist, not the full array here
          hasQuestions: (challenge.questions?.length || 0) > 0,
          numberOfQuestions: challenge.numberOfQuestions || challenge.questions?.length || 0
        };
      });

      setChallenges(mappedChallenges);

      if (isAuthenticated) {
        await fetchUserSubmissions(mappedChallenges);
      }
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSubmissions = async (challengeList) => {
    if (!isAuthenticated) return;
    const submissions = {};
    for (const challenge of challengeList) {
      try {
        const response = await challengeService.checkUserSubmission(challenge.id);
        if (response.success && response.hasSubmitted) {
          submissions[challenge.id] = response.submission;
        }
      } catch (error) {
        console.error(`Error checking submission for challenge ${challenge.id}:`, error);
      }
    }
    setCompletedChallenges(submissions);
  };

  useEffect(() => {
    let timer = null; 
    const liveChallenge = challenges.find(c => c.status === 'live');
    if (liveChallenge && liveChallenge.endDateTime) {
      const endDateTime = new Date(liveChallenge.endDateTime);
      if (!isNaN(endDateTime.getTime())) {
         timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = endDateTime.getTime() - now;
            if (distance > 0) {
              const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
              const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
              const seconds = Math.floor((distance % (1000 * 60)) / 1000);
              const formattedMinutes = String(minutes).padStart(2, '0');
              const formattedSeconds = String(seconds).padStart(2, '0');
              setTimeRemaining(`${hours}h ${formattedMinutes}m ${formattedSeconds}s`);
            } else {
              setTimeRemaining('Challenge Ended');
              clearInterval(timer);
            }
          }, 1000);
      } else {
        console.error("Invalid endDateTime for live challenge:", liveChallenge);
        setTimeRemaining('Invalid end time');
      }
    } else {
      setTimeRemaining(null);
    }
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [challenges]);

  const filteredChallenges = challenges.filter(challenge => challenge.status === activeTab);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedChallenges = filteredChallenges.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className={`min-h-screen pt-20 transition-colors duration-200 ${isDark ? 'bg-gray-900 text-gray-200' : 'bg-gray-50 text-gray-800'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ScheduleInfoBanner />
        <ChallengeTabs activeTab={activeTab} setActiveTab={setActiveTab} isDark={isDark} />
        <ChallengeGrid
          loading={loading}
          filteredChallenges={paginatedChallenges}
          completedChallenges={completedChallenges}
          timeRemaining={timeRemaining}
          activeTab={activeTab}
          isDark={isDark}
        />
        <ChallengePagination
          filteredChallengesLength={filteredChallenges.length}
          currentPage={currentPage}
          setCurrentPage={handlePageChange}
          pageSize={itemsPerPage}
          isDark={isDark}
        />
      </div>
    </div>
  );
};

export default Challenges;