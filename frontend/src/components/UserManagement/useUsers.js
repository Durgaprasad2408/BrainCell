import { useState, useEffect } from 'react';
import axios from 'axios';

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/auth/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const addUser = async (userData, type) => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const endpoint = type === 'student' ? '/auth/register' : '/auth/faculty';
      
      const response = await axios.post(
        `${API_URL}${endpoint}`,
        userData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        await fetchUsers(); // Refresh the users list
        return { success: true };
      }
    } catch (err) {
      console.error(`Error adding ${type}:`, err);
      return { 
        success: false, 
        message: err.response?.data?.message || `Failed to add ${type}` 
      };
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userId, userData) => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/auth/users/${userId}`,
        userData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        await fetchUsers(); // Refresh the users list
        return { success: true };
      }
    } catch (err) {
      console.error('Error updating user:', err);
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to update user' 
      };
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${API_URL}/auth/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        await fetchUsers(); // Refresh the users list
        return { success: true };
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to delete user' 
      };
    } finally {
      setLoading(false);
    }
  };

  const addUsersBulk = async (file, type) => {
    setLoading(true);
    setError('');
    
    return new Promise((resolve) => {
      const token = localStorage.getItem('token');
      let successCount = 0;
      let failCount = 0;
      const errors = [];

      import('papaparse').then(({ default: Papa }) => {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: async (results) => {
            const usersData = results.data;
            
            if (usersData.length === 0) {
              setError("CSV is empty or invalid.");
              setLoading(false);
              resolve({ success: false, message: "CSV is empty or invalid." });
              return;
            }

            for (const [index, userData] of usersData.entries()) {
              if (type === 'student') {
                if (!userData.name || !userData.email || !userData.password) {
                  errors.push(`Row ${index + 1}: missing required fields.`);
                  failCount++;
                  continue;
                }
              } else {
                if (!userData.name || !userData.email || !userData.password || !userData.subjects) {
                  errors.push(`Row ${index + 1}: missing required fields.`);
                  failCount++;
                  continue;
                }
              }

              try {
                const endpoint = type === 'student' ? '/auth/register' : '/auth/faculty';
                const requestData = type === 'student' 
                  ? { name: userData.name, email: userData.email, password: userData.password }
                  : { 
                      name: userData.name, 
                      email: userData.email, 
                      password: userData.password, 
                      subjects: userData.subjects.split(',').map(s => s.trim()).filter(Boolean)
                    };
                
                await axios.post(
                  `${API_URL}${endpoint}`,
                  requestData,
                  { headers: { Authorization: `Bearer ${token}` } }
                );
                successCount++;
              } catch (error) {
                console.error(`Error adding ${userData.email}:`, error);
                errors.push(`Row ${index + 1} (${userData.email}): ${error.response?.data?.message || 'Failed'}`);
                failCount++;
              }
            }

            setLoading(false);
            await fetchUsers(); // Refresh the users list
            
            resolve({ 
              success: true, 
              message: `Bulk add complete. Added: ${successCount}. Failed: ${failCount}.`,
              successCount,
              failCount,
              errors
            });
          },
          error: (error) => {
            console.error('Error parsing CSV file:', error);
            setError(`Failed to parse CSV file: ${error.message}`);
            setLoading(false);
            resolve({ success: false, message: `Failed to parse CSV file: ${error.message}` });
          }
        });
      });
    });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    fetchUsers,
    addUser,
    updateUser,
    deleteUser,
    addUsersBulk
  };
};

export const useSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const fetchSubjects = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/subjects`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.data.success) {
        setSubjects(response.data.data.map(subject => subject.name));
      }
    } catch (err) {
      console.error('Error fetching subjects:', err);
      setError('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  return {
    subjects,
    loading,
    error,
    fetchSubjects
  };
};