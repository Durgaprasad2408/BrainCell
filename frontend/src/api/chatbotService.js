import axios from 'axios';

const CHATBOT_API_URL = 'https://your-render-deployment.onrender.com';

const api = axios.create({
  baseURL: CHATBOT_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const chatbotService = {
  sendMessage: async (message, conversationHistory = []) => {
    try {
      const response = await api.post('/chat', {
        message,
        history: conversationHistory,
      });
      return response.data;
    } catch (error) {
      console.error('Error sending message to chatbot:', error);
      throw error;
    }
  },

  getChatHistory: async (userId) => {
    try {
      const response = await api.get(`/chat/history/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching chat history:', error);
      throw error;
    }
  },
};

export default chatbotService;
