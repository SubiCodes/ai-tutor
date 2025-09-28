import axios from 'axios';

export const getEmbedding = async (text: string) => {
  const apiKey = 'AIzaSyB8t6XppQu9OIf3jsVyFy89tGsrjeTPekg';
  const modelName = 'gemini-embedding-001'; 
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:embedContent?key=${apiKey}`;

  try {
    const response = await axios.post(url, {
      content: { parts: [{ text }] },
    });

    return response.data.embedding.values;
  } catch (error: any) {
    console.error('Error getting embedding:', error.response?.data || error);
    throw error;
  }
};