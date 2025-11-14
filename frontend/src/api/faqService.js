import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const submitQuery = async (lessonId, question) => {
  try {
    const response = await axios.post(
      `${API_URL}/faqs/query`,
      { lessonId, question },
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to submit query' };
  }
};

export const getLessonFAQs = async (lessonId) => {
  try {
    const response = await axios.get(`${API_URL}/faqs/lesson/${lessonId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch FAQs' };
  }
};

export const getQueriesForInstructor = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/faqs/queries`,
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch queries' };
  }
};

export const answerQuery = async (queryId, answer) => {
  try {
    const response = await axios.put(
      `${API_URL}/faqs/answer/${queryId}`,
      { answer },
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to answer query' };
  }
};

export const deleteQuery = async (queryId) => {
  try {
    const response = await axios.delete(
      `${API_URL}/faqs/${queryId}`,
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete query' };
  }
};

export const togglePublishStatus = async (queryId) => {
  try {
    const response = await axios.patch(
      `${API_URL}/faqs/publish/${queryId}`,
      {},
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update FAQ status' };
  }
};
