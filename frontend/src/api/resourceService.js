import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Resource API functions
export const createResource = async (formData) => {
  const response = await api.post('/resources', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getAllResources = async (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.type && filters.type !== 'all') {
    params.append('type', filters.type);
  }

  if (filters.search) {
    params.append('search', filters.search);
  }

  if (filters.subCategory) {
    params.append('subCategory', filters.subCategory);
  }

  const response = await api.get(`/resources/all?${params.toString()}`);
  return response.data;
};

export const getPublishedResources = async (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.subCategory) {
    params.append('subCategory', filters.subCategory);
  }

  if (filters.search) {
    params.append('search', filters.search);
  }

  const response = await api.get(`/resources/published?${params.toString()}`);
  return response.data;
};

export const updateResource = async (id, data) => {
  const response = await api.put(`/resources/${id}`, data);
  return response.data;
};

export const deleteResource = async (id) => {
  const response = await api.delete(`/resources/${id}`);
  return response.data;
};

export const getResourceStats = async () => {
  const response = await api.get('/resources/stats');
  return response.data;
};

export const incrementEngagement = async (id, type) => {
  const response = await api.post(`/resources/${id}/engagement`, { type });
  return response.data;
};

export const getDownloadUrl = async (id) => {
  const response = await api.get(`/resources/${id}/download`);
  return response.data;
};

export const downloadFile = async (url, filename) => {
  try {
    const response = await axios.get(url, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], {
      type: 'application/pdf'
    });

    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
};

export const getInstructorResourceStats = async (period = 'all') => {
  const response = await api.get(`/resources/instructor/stats?period=${period}`);
  return response.data;
};