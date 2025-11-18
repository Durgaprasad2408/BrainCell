import { useState, useEffect } from 'react';
import axios from 'axios';
import { getAllSubjects, createSubject, updateSubject, deleteSubject } from '../../api/subjectService';

const useSubjects = (options = {}) => {
  const { filterByUser = false, user = null } = options;
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      setError(null);

      if (filterByUser && user) {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/subjects`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success && user?.subjects) {
          const userSubjects = response.data.data.filter(subject =>
            user.subjects.some(userSubject =>
              userSubject.toLowerCase() === subject.name.toLowerCase()
            )
          );
          setSubjects(userSubjects);
        }
      } else {
        const response = await getAllSubjects();
        if (response.success) {
          setSubjects(response.data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
      setError('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubject = async (formData) => {
    try {
      setLoading(true);
      const response = await createSubject(formData);
      if (response.success) {
        await fetchSubjects();
        return { success: true };
      }
    } catch (error) {
      console.error('Failed to create subject:', error);
      setError(error.response?.data?.message || 'Failed to create subject');
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubject = async (id, formData) => {
    try {
      setLoading(true);
      const response = await updateSubject(id, formData);
      if (response.success) {
        await fetchSubjects();
        return { success: true };
      }
    } catch (error) {
      console.error('Failed to update subject:', error);
      setError(error.response?.data?.message || 'Failed to update subject');
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubject = async (id) => {
    try {
      setLoading(true);
      const response = await deleteSubject(id);
      if (response.success) {
        await fetchSubjects();
        return { success: true };
      }
    } catch (error) {
      console.error('Failed to delete subject:', error);
      setError(error.response?.data?.message || 'Failed to delete subject');
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, [filterByUser, user]);

  return {
    subjects,
    loading,
    error,
    fetchSubjects,
    handleCreateSubject,
    handleUpdateSubject,
    handleDeleteSubject,
    setError
  };
};

export default useSubjects;