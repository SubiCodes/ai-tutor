import axios from 'axios';

export const getEmbedding = async (text: string) => {
  const apiKey = 'AIzaSyB8t6XppQu9OIf3jsVyFy89tGsrjeTPekg';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKey}`;

  try {
    const response = await axios.post(url, {
      model: 'models/gemini-embedding-001',
      content: { parts: [{ text }] },
    });
    return response.data.embedding.values;
  } catch (error) {
    console.error('Error getting embedding:', error);
    throw error;
  }
};