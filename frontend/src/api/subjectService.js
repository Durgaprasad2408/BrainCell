import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getAllSubjects = async () => {
  try {
    const response = await axios.get(`${API_URL}/subjects`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching subjects:', error);
    throw error;
  }
};

export const getSubjectById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/subjects/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching subject:', error);
    throw error;
  }
};

export const createSubject = async (subjectData) => {
  try {
    const headers = { ...getAuthHeader() };
    if (subjectData instanceof FormData) {
      headers['Content-Type'] = 'multipart/form-data';
    }
    const response = await axios.post(`${API_URL}/subjects`, subjectData, {
      headers
    });
    return response.data;
  } catch (error) {
    console.error('Error creating subject:', error);
    throw error;
  }
};

export const updateSubject = async (id, subjectData) => {
  try {
    const headers = { ...getAuthHeader() };
    if (subjectData instanceof FormData) {
      headers['Content-Type'] = 'multipart/form-data';
    }
    const response = await axios.put(`${API_URL}/subjects/${id}`, subjectData, {
      headers
    });
    return response.data;
  } catch (error) {
    console.error('Error updating subject:', error);
    throw error;
  }
};

export const deleteSubject = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/subjects/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting subject:', error);
    throw error;
  }
};

export const enrollSubject = async (subjectId) => {
  try {
    const response = await axios.post(`${API_URL}/subjects/enroll`,
      { subjectId },
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error('Error enrolling in subject:', error);
    throw error;
  }
};

export const getEnrolledSubjects = async () => {
  try {
    const response = await axios.get(`${API_URL}/subjects/enrolled/my-subjects`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching enrolled subjects:', error);
    throw error;
  }
};

export const checkEnrollment = async (subjectId) => {
  try {
    const response = await axios.get(`${API_URL}/subjects/check-enrollment/${subjectId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error checking enrollment:', error);
    throw error;
  }
};
