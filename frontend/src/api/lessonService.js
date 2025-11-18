import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const createLesson = async (lessonData) => {
  try {
    const response = await axios.post(
      `${API_URL}/lessons`,
      lessonData,
      {
        headers: getAuthHeader()
      }
    );
    return response.data;
  } catch (error) {
    console.error('Create lesson error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to create lesson');
  }
};

export const getAllLessons = async (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.subject) params.append('subject', filters.subject);
  if (filters.module) params.append('module', filters.module);
  if (filters.type) params.append('type', filters.type);
  if (filters.search) params.append('search', filters.search);

  const response = await axios.get(`${API_URL}/lessons?${params.toString()}`, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const getLessonById = async (id) => {
  const response = await axios.get(`${API_URL}/lessons/${id}`, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const updateLesson = async (id, lessonData) => {
  try {
    const response = await axios.put(
      `${API_URL}/lessons/${id}`,
      lessonData,
      {
        headers: getAuthHeader()
      }
    );
    return response.data;
  } catch (error) {
    console.error('Update lesson error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to update lesson');
  }
};

export const deleteLesson = async (id) => {
  const response = await axios.delete(
    `${API_URL}/lessons/${id}`,
    {
      headers: getAuthHeader()
    }
  );
  return response.data;
};

export const uploadCardImages = async (images) => {
  try {
    const formData = new FormData();

    images.forEach((image) => {
      formData.append('images', image);
    });

    const response = await axios.post(
      `${API_URL}/lessons/upload-images`,
      formData,
      {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Upload images error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to upload images');
  }
};

export const uploadVideo = async (videoFile) => {
  try {
    const formData = new FormData();
    formData.append('video', videoFile);

    const response = await axios.post(
      `${API_URL}/lessons/upload-video`,
      formData,
      {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Upload video error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to upload video');
  }
};

export const updateLessonOrder = async (lessonId, newOrder) => {
  const response = await axios.put(
    `${API_URL}/lessons/reorder`,
    { lessonId, newOrder },
    {
      headers: getAuthHeader()
    }
  );
  return response.data;
};

export const getInstructorStats = async (period = 'all') => {
  try {
    const params = new URLSearchParams();
    if (period !== 'all') params.append('period', period);

    const response = await axios.get(`${API_URL}/lessons/stats/instructor?${params.toString()}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching instructor stats:', error);
    throw error;
  }
};

export const markLessonComplete = async (lessonId) => {
  try {
    const response = await axios.post(
      `${API_URL}/lessons/complete`,
      { lessonId },
      {
        headers: getAuthHeader()
      }
    );
    return response.data;
  } catch (error) {
    console.error('Mark lesson complete error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to mark lesson complete');
  }
};

export const getLessonMetrics = async (lessonId) => {
  try {
    const response = await axios.get(`${API_URL}/lessons/metrics/${lessonId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching lesson metrics:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch lesson metrics');
  }
};
