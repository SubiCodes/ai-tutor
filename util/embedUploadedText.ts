import axios from 'axios';

export const getBatchEmbeddings = async (texts: string[]) => {
  const apiKey = process.env.EXPO_PUBLIC_API_GEMINI;
  const modelName = 'gemini-embedding-001';
  const modelResource = `models/${modelName}`;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:batchEmbedContents?key=${apiKey}`;

  const requests = texts.map(text => ({
    model: modelResource,
    content: { parts: [{ text }] },
  }));

  try {
    const response = await axios.post(url, {
      requests: requests
    });

    return response.data.embeddings.map((e: { values: number[] }) => e.values);
  } catch (error: any) {
    console.error('Error getting batch embeddings:', error.response?.data || error);
    throw error;
  }
};