import { useCallback } from 'react';
import * as challengeService from '../../api/challengeService';

export const useChallengeData = () => {
  const fetchChallenges = useCallback(async (service = challengeService.getAllChallenges) => {
    try {
      const response = await service();
      return response.data || [];
    } catch (error) {
      console.error('Error fetching challenges:', error);
      throw error;
    }
  }, []);

  return { fetchChallenges };
};

export const useChallengeFilters = () => {
  const getDifficultyColor = useCallback((difficulty, isDark) => {
    if (difficulty === 'Easy') return isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800';
    if (difficulty === 'Medium') return isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800';
    return isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800';
  }, []);

  const getStatusColor = useCallback((status, isDark) => {
    if (status === 'Published' || status === 'live') return isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800';
    if (status === 'completed') return isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800';
    if (status === 'upcoming') return isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800';
    return isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-700';
  }, []);

  const getSuccessRateColor = useCallback((rate) => {
    if (rate >= 75) return 'text-green-500';
    if (rate >= 60) return 'text-blue-500';
    if (rate >= 45) return 'text-yellow-500';
    return 'text-red-500';
  }, []);

  const determineStatus = useCallback((challenge) => {
    const now = new Date();
    const startDateTime = new Date(challenge.startDateTime);
    const endDateTime = new Date(challenge.endDateTime);

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      return 'unknown';
    }

    if (now < startDateTime) {
      return 'upcoming';
    } else if (now >= startDateTime && now <= endDateTime) {
      return 'live';
    } else {
      return 'completed';
    }
  }, []);

  return {
    getDifficultyColor,
    getStatusColor,
    getSuccessRateColor,
    determineStatus
  };
};

export const useChallengeActions = () => {
  const handleDownloadTemplate = useCallback(() => {
    const link = document.createElement('a');
    link.href = '/Questions_Template.csv';
    link.download = 'Questions_Template.csv';
    link.click();
  }, []);

  const validateChallengeData = useCallback((challengeData, step = 1) => {
    if (step === 1) {
      if (!challengeData.title || !challengeData.points || !challengeData.numberOfQuestions || !challengeData.description) {
        return { isValid: false, message: 'Please fill all challenge details' };
      }

      if (challengeData.category === 'daily' || challengeData.category === 'weekly') {
        if (!challengeData.startDate || !challengeData.startTime || !challengeData.endTime) {
          return { isValid: false, message: 'Please fill all schedule details (Start Date, Start Time, End Time)' };
        }

        const startDateTime = new Date(`${challengeData.startDate}T${challengeData.startTime}`);
        const endDateTime = new Date(`${challengeData.startDate}T${challengeData.endTime}`);

        if (endDateTime <= startDateTime) {
          return { isValid: false, message: 'The end time must be after the start time.' };
        }
      }
    }
    return { isValid: true };
  }, []);

  return {
    handleDownloadTemplate,
    validateChallengeData
  };
};

export const useChallengeForm = () => {
  const getInitialChallengeData = useCallback(() => ({
    title: '',
    category: 'daily',
    difficulty: 'Easy',
    points: '',
    numberOfQuestions: '',
    description: '',
    startDate: '',
    startTime: '',
    endTime: ''
  }), []);

  const getInitialQuestion = useCallback(() => ({
    question: '',
    options: ['', '', '', ''],
    answer: '',
    explanation: ''
  }), []);

  const processChallengeData = useCallback((challengeData, questions, editMode = false) => {
    const startDateTime = new Date(`${challengeData.startDate}T${challengeData.startTime}`);
    const endDateTime = new Date(`${challengeData.startDate}T${challengeData.endTime}`);

    const payload = {
      ...challengeData,
      startDateTime: startDateTime.toISOString(),
      endDateTime: endDateTime.toISOString(),
      questions: questions.map(({ ...rest }) => rest),
      status: 'Published'
    };

    if (!editMode) {
      delete payload.startDate;
      delete payload.startTime;
      delete payload.endTime;
    }

    return payload;
  }, []);

  return {
    getInitialChallengeData,
    getInitialQuestion,
    processChallengeData
  };
};