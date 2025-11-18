import { useState, useCallback } from 'react';
import { createLesson, getAllLessons, updateLesson, deleteLesson, uploadCardImages, uploadVideo } from '../../api/lessonService';

const useInstructorLessons = (selectedSubject) => {
  const [allLessons, setAllLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchLessons = useCallback(async () => {
    if (!selectedSubject) return;
    try {
      setLoading(true);
      const response = await getAllLessons({ subject: selectedSubject });
      if (response.success) {
        setAllLessons(response.data);
      }
    } catch (error) {
      console.error('Error fetching lessons:', error);
      setError('Failed to load lessons');
    } finally {
      setLoading(false);
    }
  }, [selectedSubject]);

  const handleCreateLesson = async (lessonData) => {
    try {
      setLoading(true);
      setError(null);

      let uploadedCards = [];
      let processedVideoData = { ...lessonData.videoData };

      if (lessonData.type === 'Lesson') {
        if (lessonData.contentCards.length === 0) {
          setError('Please add at least one content card');
          setLoading(false);
          return;
        }

        uploadedCards = await Promise.all(
          lessonData.contentCards.map(async (card) => {
            const cardImages = [];

            if (card.images && card.images.length > 0) {
              for (const img of card.images) {
                if (img.file instanceof File) {
                  try {
                    const uploadResponse = await uploadCardImages([img.file]);
                    if (uploadResponse.success) {
                      cardImages.push(...uploadResponse.data);
                    }
                  } catch (uploadError) {
                    console.error('Image upload error:', uploadError);
                    throw new Error(`Failed to upload image: ${uploadError.message}`);
                  }
                } else if (typeof img.file === 'string') {
                  cardImages.push({
                    url: img.file,
                    cloudinaryPublicId: img.cloudinaryPublicId || '',
                    caption: img.caption || ''
                  });
                }
              }
            }

            return {
              heading: card.heading,
              content: card.content,
              images: cardImages,
              order: card.order
            };
          })
        );
      }

      if (lessonData.type === 'Video') {
        if (!lessonData.videoData.videoUrl && !lessonData.videoData.videoFile) {
          setError('Please provide a video URL or upload a video file');
          setLoading(false);
          return;
        }

        if (lessonData.videoData.videoFile instanceof File) {
          try {
            const uploadResponse = await uploadVideo(lessonData.videoData.videoFile);
            if (uploadResponse.success) {
              processedVideoData = {
                videoUrl: uploadResponse.data.videoUrl,
                cloudinaryPublicId: uploadResponse.data.cloudinaryPublicId,
                description: lessonData.videoData.description,
                transcript: lessonData.videoData.transcript
              };
            }
          } catch (uploadError) {
            console.error('Video upload error:', uploadError);
            setError(`Failed to upload video: ${uploadError.message}`);
            setLoading(false);
            return;
          }
        } else {
          processedVideoData = {
            videoUrl: lessonData.videoData.videoUrl,
            description: lessonData.videoData.description,
            transcript: lessonData.videoData.transcript
          };
        }
      }

      if (lessonData.type === 'Quiz' && lessonData.quizQuestions.length === 0) {
        setError('Please add at least one quiz question');
        setLoading(false);
        return;
      }

      const lessonPayload = {
        title: lessonData.title,
        subject: lessonData.subject,
        module: lessonData.module,
        type: lessonData.type,
        duration: lessonData.duration,
        contentCards: lessonData.type === 'Lesson' ? JSON.stringify(uploadedCards) : JSON.stringify([]),
        quizQuestions: lessonData.type === 'Quiz' ? JSON.stringify(lessonData.quizQuestions) : JSON.stringify([]),
        videoContent: lessonData.type === 'Video' ? JSON.stringify(processedVideoData) : JSON.stringify({}),
        status: 'Published'
      };

      await createLesson(lessonPayload);
      setSuccess('Lesson created successfully!');
      await fetchLessons();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error saving lesson:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save lesson';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLesson = async (lessonId, lessonData) => {
    try {
      setLoading(true);
      setError(null);

      // Similar logic as create but for update
      let uploadedCards = [];
      let processedVideoData = { ...lessonData.videoData };

      if (lessonData.type === 'Lesson') {
        uploadedCards = await Promise.all(
          lessonData.contentCards.map(async (card) => {
            const cardImages = [];

            if (card.images && card.images.length > 0) {
              for (const img of card.images) {
                if (img.file instanceof File) {
                  try {
                    const uploadResponse = await uploadCardImages([img.file]);
                    if (uploadResponse.success) {
                      cardImages.push(...uploadResponse.data);
                    }
                  } catch (uploadError) {
                    console.error('Image upload error:', uploadError);
                    throw new Error(`Failed to upload image: ${uploadError.message}`);
                  }
                } else if (typeof img.file === 'string') {
                  cardImages.push({
                    url: img.file,
                    cloudinaryPublicId: img.cloudinaryPublicId || '',
                    caption: img.caption || ''
                  });
                }
              }
            }

            return {
              heading: card.heading,
              content: card.content,
              images: cardImages,
              order: card.order
            };
          })
        );
      }

      if (lessonData.type === 'Video' && lessonData.videoData.videoFile instanceof File) {
        try {
          const uploadResponse = await uploadVideo(lessonData.videoData.videoFile);
          if (uploadResponse.success) {
            processedVideoData = {
              videoUrl: uploadResponse.data.videoUrl,
              cloudinaryPublicId: uploadResponse.data.cloudinaryPublicId,
              description: lessonData.videoData.description,
              transcript: lessonData.videoData.transcript
            };
          }
        } catch (uploadError) {
          console.error('Video upload error:', uploadError);
          setError(`Failed to upload video: ${uploadError.message}`);
          setLoading(false);
          return;
        }
      }

      const lessonPayload = {
        title: lessonData.title,
        subject: lessonData.subject,
        module: lessonData.module,
        type: lessonData.type,
        duration: lessonData.duration,
        contentCards: lessonData.type === 'Lesson' ? JSON.stringify(uploadedCards) : JSON.stringify([]),
        quizQuestions: lessonData.type === 'Quiz' ? JSON.stringify(lessonData.quizQuestions) : JSON.stringify([]),
        videoContent: lessonData.type === 'Video' ? JSON.stringify(processedVideoData) : JSON.stringify({}),
        status: 'Published'
      };

      await updateLesson(lessonId, lessonPayload);
      setSuccess('Lesson updated successfully!');
      await fetchLessons();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error updating lesson:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update lesson';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    try {
      setLoading(true);
      await deleteLesson(lessonId);
      setSuccess('Lesson deleted successfully!');
      await fetchLessons();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error deleting lesson:', error);
      setError(error.response?.data?.message || 'Failed to delete lesson');
    } finally {
      setLoading(false);
    }
  };

  return {
    allLessons,
    loading,
    error,
    success,
    setError,
    setSuccess,
    fetchLessons,
    handleCreateLesson,
    handleUpdateLesson,
    handleDeleteLesson
  };
};

export default useInstructorLessons;