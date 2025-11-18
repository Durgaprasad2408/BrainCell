import { useState, useEffect } from 'react';
import axios from 'axios';

const useInstructorSubjects = (user) => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const fetchSubjects = async () => {
    try {
      setLoading(true);
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
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setError('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, [user]);

  return {
    subjects,
    loading,
    error,
    setError,
    refetch: fetchSubjects
  };
};

export default useInstructorSubjects;