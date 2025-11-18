import { useState } from 'react';

const useLessonHandlers = (selectedSubject, formData, setFormData, contentCards, setContentCards, currentCard, setCurrentCard, currentCardImages, setCurrentCardImages, editingCardIndex, setEditingCardIndex, quizQuestions, setQuizQuestions, currentQuestion, setCurrentQuestion, editingQuestionId, setEditingQuestionId, setBulkFile, videoData, setVideoData, resetForm) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [createStep, setCreateStep] = useState(1);

  const handleNext = (e) => {
    e.preventDefault();
    setCreateStep(2);
  };

  const handleAddCard = () => {
    if (editingCardIndex !== null) {
      const updatedCards = [...contentCards];
      updatedCards[editingCardIndex] = {
        heading: currentCard.heading,
        content: currentCard.content,
        images: currentCardImages.map(file => ({
          file,
          preview: typeof file === 'string' ? file : URL.createObjectURL(file),
          caption: ''
        })),
        order: editingCardIndex
      };
      setContentCards(updatedCards);
      setEditingCardIndex(null);
    } else {
      const newCard = {
        heading: currentCard.heading,
        content: currentCard.content,
        images: currentCardImages.map(file => ({
          file,
          preview: URL.createObjectURL(file),
          caption: ''
        })),
        order: contentCards.length
      };
      setContentCards(prev => [...prev, newCard]);
    }

    setCurrentCard({ heading: '', content: '', images: [], order: 0 });
    setCurrentCardImages([]);
  };

  const handleRemoveCard = (index) => {
    setContentCards(contentCards.filter((_, i) => i !== index));
  };

  const handleEditCard = (index) => {
    const card = contentCards[index];
    setCurrentCard({
      heading: card.heading,
      content: card.content,
      images: card.images,
      order: card.order
    });
    setCurrentCardImages(card.images.map(img => img.file));
    setEditingCardIndex(index);
  };

  const handleCancelEditCard = () => {
    setCurrentCard({ heading: '', content: '', images: [], order: 0 });
    setCurrentCardImages([]);
    setEditingCardIndex(null);
  };

  const handleAddQuestion = () => {
    if (editingQuestionId !== null) {
      setQuizQuestions(prev =>
        prev.map(q => q.id === editingQuestionId ? { ...currentQuestion, id: editingQuestionId } : q)
      );
      setEditingQuestionId(null);
    } else {
      setQuizQuestions(prev => [...prev, { ...currentQuestion, id: Date.now() }]);
    }
    setCurrentQuestion({
      question: '',
      options: ['', '', '', ''],
      answer: '',
      explanation: ''
    });
  };

  const handleRemoveQuestion = (id) => {
    setQuizQuestions(quizQuestions.filter(q => q.id !== id));
    if (editingQuestionId === id) {
      setEditingQuestionId(null);
      setCurrentQuestion({
        question: '',
        options: ['', '', '', ''],
        answer: '',
        explanation: ''
      });
    }
  };

  const handleEditQuestion = (question) => {
    setEditingQuestionId(question.id);
    setCurrentQuestion({
      question: question.question,
      options: question.options,
      answer: question.answer,
      explanation: question.explanation
    });
  };

  const handleCancelEditQuestion = () => {
    setEditingQuestionId(null);
    setCurrentQuestion({
      question: '',
      options: ['', '', '', ''],
      answer: '',
      explanation: ''
    });
  };

  const handleDownloadTemplate = () => {
    const link = document.createElement('a');
    link.href = '/Questions_Template.csv';
    link.download = 'Questions_Template.csv';
    link.click();
  };

  const handleBulkCsvAdd = (newQuestions) => {
    setQuizQuestions(prev => [...prev, ...newQuestions]);
    setBulkFile(null);
  };

  const handleCancel = () => {
    setShowCreateModal(false);
    setEditMode(false);
    setEditingLesson(null);
    setCreateStep(1);
    resetForm(selectedSubject);
  };

  const handleEdit = (lesson) => {
    setEditMode(true);
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title,
      module: lesson.module,
      type: lesson.type,
      duration: lesson.duration,
      subject: selectedSubject
    });

    if (lesson.type === 'Lesson' && lesson.contentCards) {
      const parsedCards = lesson.contentCards.map((card, index) => ({
        heading: card.heading,
        content: card.content,
        images: card.images?.map(img => ({
          file: img.url,
          preview: img.url,
          caption: img.caption || '',
          cloudinaryPublicId: img.cloudinaryPublicId || ''
        })) || [],
        order: index
      }));
      setContentCards(parsedCards);
    }

    if (lesson.type === 'Quiz' && lesson.quizQuestions) {
      setQuizQuestions(lesson.quizQuestions);
    }

    if (lesson.type === 'Video' && lesson.videoContent) {
      setVideoData(lesson.videoContent);
    }

    setShowCreateModal(true);
    setCreateStep(2);
  };

  const canProceedToStep2 = () => {
    if (formData.type === 'Lesson') return contentCards.length > 0;
    if (formData.type === 'Quiz') return quizQuestions.length > 0;
    if (formData.type === 'Video') return videoData.videoUrl || videoData.videoFile;
    return false;
  };

  return {
    showCreateModal,
    setShowCreateModal,
    editMode,
    editingLesson,
    createStep,
    setCreateStep,
    handleNext,
    handleAddCard,
    handleRemoveCard,
    handleEditCard,
    handleCancelEditCard,
    handleAddQuestion,
    handleRemoveQuestion,
    handleEditQuestion,
    handleCancelEditQuestion,
    handleDownloadTemplate,
    handleBulkCsvAdd,
    handleCancel,
    handleEdit,
    canProceedToStep2
  };
};

export default useLessonHandlers;