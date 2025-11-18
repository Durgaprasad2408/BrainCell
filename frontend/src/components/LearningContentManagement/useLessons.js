import { useState, useEffect, useCallback } from 'react';
import { getAllLessons, createLesson, updateLesson, deleteLesson } from '../../api/lessonService';

const useLessons = (selectedSubject) => {
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
        setAllLessons(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch lessons:', error);
      setAllLessons([]);
      setError('Failed to load lessons');
    } finally {
      setLoading(false);
    }
  }, [selectedSubject]);

  const handleCreateLesson = async (lessonData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await createLesson(lessonData);
      if (response.success) {
        await fetchLessons();
        setSuccess('Lesson created successfully!');
        return { success: true };
      }
    } catch (error) {
      console.error('Error saving lesson:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save lesson';
      setError(errorMessage);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLesson = async (id, lessonData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await updateLesson(id, lessonData);
      if (response.success) {
        await fetchLessons();
        setSuccess('Lesson updated successfully!');
        return { success: true };
      }
    } catch (error) {
      console.error('Error updating lesson:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update lesson';
      setError(errorMessage);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Are you sure you want to delete this lesson?')) return;

    try {
      setLoading(true);
      const response = await deleteLesson(lessonId);
      if (response.success) {
        await fetchLessons();
        setSuccess('Lesson deleted successfully!');
        return { success: true };
      }
    } catch (error) {
      console.error('Error deleting lesson:', error);
      setError(error.response?.data?.message || 'Failed to delete lesson');
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  return {
    allLessons,
    lessons: allLessons,
    loading,
    error,
    success,
    fetchLessons,
    handleCreateLesson,
    handleUpdateLesson,
    handleDeleteLesson,
    setError,
    setSuccess
  };
};

export default useLessons;