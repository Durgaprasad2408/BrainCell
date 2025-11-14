// src/api/challengeService.js

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  // Return structure that axios expects directly for headers
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return { headers }; // Return { headers: { ... } }
};

export const createChallenge = async (challengeData) => {
  try {
    const response = await axios.post(
      `${API_URL}/challenges`,
      challengeData,
      getAuthHeaders() // Pass the header object directly
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getAllChallenges = async (params = {}) => {
  try {
    const config = {
      ...getAuthHeaders(), // Spread the headers object
      params // Pass query parameters
    };
    const response = await axios.get(`${API_URL}/challenges`, config);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getInstructorChallenges = async (params = {}) => {
  try {
    const config = {
      ...getAuthHeaders(), // Spread the headers object
      params // Pass query parameters
    };
    const response = await axios.get(`${API_URL}/challenges/instructor`, config);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getPublishedChallenges = async (params = {}) => {
  try {
    // Published challenges likely don't need auth, only query params
    const response = await axios.get(`${API_URL}/challenges/published`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// --- ✨ NEW FUNCTION ADDED HERE ✨ ---
export const getUpcomingChallenges = async (limit = null) => {
  try {
    const params = {
      status: 'upcoming', // Filter by status
    };
    if (limit) {
      params.limit = limit; // Add limit if provided
    }
    // Upcoming challenges likely don't need auth
    const response = await axios.get(`${API_URL}/challenges/published`, { params });
    // Assuming the backend filters published challenges for upcoming status
    // If you have a specific /challenges/upcoming endpoint, use that instead.
    return response.data;
  } catch (error) {
     throw error.response?.data || error;
  }
};
// --- END OF NEW FUNCTION ---

export const getChallengeById = async (id) => {
  try {
    // Getting a specific challenge likely doesn't need auth, depends on your API design
    const response = await axios.get(`${API_URL}/challenges/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateChallenge = async (id, challengeData) => {
  try {
    const response = await axios.put(
      `${API_URL}/challenges/${id}`,
      challengeData,
      getAuthHeaders() // Pass the header object directly
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteChallenge = async (id) => {
  try {
    const response = await axios.delete(
      `${API_URL}/challenges/${id}`,
      getAuthHeaders() // Pass the header object directly
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getChallengeStats = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/challenges/stats`,
      getAuthHeaders() // Pass the header object directly
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const submitChallenge = async (submissionData) => {
  try {
    const response = await axios.post(
      `${API_URL}/challenges/submit`,
      submissionData,
      getAuthHeaders() // Pass the header object directly
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getUserSubmission = async (challengeId) => {
  try {
    const response = await axios.get(
      `${API_URL}/challenges/${challengeId}/submission`,
      getAuthHeaders() // Pass the header object directly
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const checkUserSubmission = async (challengeId) => {
  try {
    const response = await axios.get(
      `${API_URL}/challenges/${challengeId}/check-submission`,
      getAuthHeaders() // Pass the header object directly
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getChallengeLeaderboard = async (challengeId) => {
  try {
    // Leaderboard is likely public
    const response = await axios.get(
      `${API_URL}/challenges/${challengeId}/leaderboard`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getInstructorChallengeStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/challenges/stats/instructor`, getAuthHeaders());
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getStudentStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/challenges/stats/student`, getAuthHeaders());
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getStudentRecentScores = async () => {
  try {
    const response = await axios.get(`${API_URL}/challenges/student/recent-scores`, getAuthHeaders());
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getStudentAchievements = async () => {
  try {
    const response = await axios.get(`${API_URL}/challenges/student/achievements`, getAuthHeaders());
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getChallengeMetrics = async (challengeId) => {
  try {
    const response = await axios.get(`${API_URL}/challenges/${challengeId}/metrics`, getAuthHeaders());
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};