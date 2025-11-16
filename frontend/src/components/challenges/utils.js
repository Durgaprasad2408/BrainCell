import Papa from 'papaparse';

export const downloadTemplate = () => {
  const link = document.createElement('a');
  link.href = '/Questions_Template.csv';
  link.download = 'Questions_Template.csv';
  link.click();
};

export const parseBulkCsv = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('Please select a CSV file first.'));
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const newQuestions = [];
          let index = 0;

          for (const row of results.data) {
            const options = [
              row.option1,
              row.option2,
              row.option3,
              row.option4
            ].filter(opt => opt && opt.trim() !== '');

            if (!row.question || options.length < 2 || !row.answer || !row.explanation) {
              throw new Error(`Row ${index + 1} is missing required fields. Make sure you have 'question', 'answer', 'explanation', and at least two options.`);
            }
            if (!options.includes(row.answer)) {
              throw new Error(`The answer "${row.answer}" for question "${row.question}" (Row ${index + 1}) is not listed in its options.`);
            }

            newQuestions.push({
              question: row.question,
              options: options,
              answer: row.answer,
              explanation: row.explanation,
              id: Date.now() + index++
            });
          }

          resolve(newQuestions);

        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(new Error(`Failed to parse CSV file: ${error.message}`));
      }
    });
  });
};

export const getStatusColor = (status, isDark) => {
  if (isDark) {
    switch (status) {
      case 'live': return 'bg-green-900/30 text-green-400 border-green-700';
      case 'completed': return 'bg-blue-900/30 text-blue-400 border-blue-700';
      case 'upcoming': return 'bg-yellow-900/30 text-yellow-400 border-yellow-700';
      default: return 'bg-gray-700 text-gray-300 border-gray-600';
    }
  } else {
    switch (status) {
      case 'live': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'upcoming': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }
};

export const getDifficultyColor = (difficulty) => {
  switch (difficulty) {
    case 'Easy': return 'text-green-600';
    case 'Medium': return 'text-yellow-600';
    case 'Hard': return 'text-red-600';
    default: return 'text-gray-600';
  }
};

export const getBadgeColor = (badge) => {
  switch (badge) {
    case 'gold': return 'bg-yellow-400 text-yellow-900';
    case 'silver': return 'bg-gray-300 text-gray-800';
    case 'bronze': return 'bg-orange-400 text-orange-900';
    default: return 'bg-gray-200 text-gray-700';
  }
};

export const formatDate = (dateString) => {
  const dateObj = new Date(dateString);
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

export const formatTime = (dateString) => {
  const dateObj = new Date(dateString);
  return dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

export const getSuccessRateColor = (rate) => {
  if (rate >= 75) return 'text-green-500';
  if (rate >= 60) return 'text-blue-500';
  if (rate >= 45) return 'text-yellow-500';
  return 'text-red-500';
};

export const determineStatus = (challenge) => {
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
};

export const filterChallenges = (challenges, searchQuery, selectedCategory) => {
  return challenges.filter(challenge => {
    const matchesSearch = challenge.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || challenge.category.toLowerCase() === selectedCategory;
    return matchesSearch && matchesCategory;
  });
};

export const validateChallengeData = (challengeData, step = 1) => {
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
};

export const processChallengeForSubmission = (challengeData, questions) => {
  const startDateTime = new Date(`${challengeData.startDate}T${challengeData.startTime}`);
  const endDateTime = new Date(`${challengeData.startDate}T${challengeData.endTime}`);

  return {
    ...challengeData,
    startDateTime: startDateTime.toISOString(),
    endDateTime: endDateTime.toISOString(),
    questions: questions.map((q) => ({ 
      question: q.question, 
      options: q.options, 
      answer: q.answer, 
      explanation: q.explanation 
    })),
    status: 'Published'
  };
};

export const resetChallengeForm = () => ({
  title: '',
  category: 'daily',
  difficulty: 'Easy',
  points: '',
  numberOfQuestions: '',
  description: '',
  startDate: '',
  startTime: '',
  endTime: ''
});

export const resetQuestionForm = () => ({
  question: '',
  options: ['', '', '', ''],
  answer: '',
  explanation: ''
});