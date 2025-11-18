import { useState } from 'react';

const useFormData = (initialSubject = '') => {
  const [formData, setFormData] = useState({
    title: '',
    module: '',
    type: 'Lesson',
    duration: '',
    subject: initialSubject
  });

  const [contentCards, setContentCards] = useState([]);
  const [currentCard, setCurrentCard] = useState({
    heading: '',
    content: '',
    images: [],
    order: 0
  });
  const [currentCardImages, setCurrentCardImages] = useState([]);
  const [editingCardIndex, setEditingCardIndex] = useState(null);

  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    answer: '',
    explanation: ''
  });
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [bulkFile, setBulkFile] = useState(null);

  const [videoData, setVideoData] = useState({
    videoFile: null,
    videoUrl: '',
    description: '',
    transcript: ''
  });

  const resetForm = (selectedSubject = '') => {
    setFormData({
      title: '',
      module: '',
      type: 'Lesson',
      duration: '',
      subject: selectedSubject
    });
    setContentCards([]);
    setCurrentCard({ heading: '', content: '', images: [], order: 0 });
    setCurrentCardImages([]);
    setQuizQuestions([]);
    setCurrentQuestion({
      question: '',
      options: ['', '', '', ''],
      answer: '',
      explanation: ''
    });
    setEditingQuestionId(null);
    setVideoData({
      videoFile: null,
      videoUrl: '',
      description: '',
      transcript: ''
    });
    setBulkFile(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'duration') {
      const numericValue = value.replace(/\D/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: numericValue ? `${numericValue} min` : ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const canProceedToStep2 = () => {
    if (formData.type === 'Lesson') return contentCards.length > 0;
    if (formData.type === 'Quiz') return quizQuestions.length > 0;
    if (formData.type === 'Video') return videoData.videoUrl || videoData.videoFile;
    return false;
  };

  return {
    formData,
    setFormData,
    contentCards,
    setContentCards,
    currentCard,
    setCurrentCard,
    currentCardImages,
    setCurrentCardImages,
    editingCardIndex,
    setEditingCardIndex,
    quizQuestions,
    setQuizQuestions,
    currentQuestion,
    setCurrentQuestion,
    editingQuestionId,
    setEditingQuestionId,
    bulkFile,
    setBulkFile,
    videoData,
    setVideoData,
    resetForm,
    handleInputChange,
    canProceedToStep2
  };
};

export default useFormData;