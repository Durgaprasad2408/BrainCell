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
  if (status === 'Published' || status === 'live') return isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800';
  if (status === 'completed') return isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800';
  if (status === 'upcoming') return isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800';
  return isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-700';
};

export const getDifficultyColor = (difficulty, isDark) => {
  if (difficulty === 'Easy') return isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800';
  if (difficulty === 'Medium') return isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800';
  return isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800';
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