import axios from 'axios';

export const embedUserQuery = async (userQuery: string): Promise<number[]> => {
  const modelName = 'gemini-embedding-001'; 
  const apiKey = process.env.EXPO_PUBLIC_API_GEMINI; 
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:embedContent?key=${apiKey}`;

  const requestBody = {
    content: {
      parts: [
        {
          text: userQuery,
        },
      ],
    },
    taskType: 'RETRIEVAL_QUERY', 
  };

  try {
    const response = await axios.post(url, requestBody);
    const embedding = response.data.embedding?.values;

    if (!embedding || !Array.isArray(embedding)) {
      console.warn('Response did not contain embedding values:', response.data);
      throw new Error('API failed to return a valid embedding vector.');
    }

    return embedding;
  } catch (error: any) {
    console.error('Error generating embedding:', error.response?.data || error.message || error);
    throw new Error('Failed to generate embedding from Gemini API.');
  }
};