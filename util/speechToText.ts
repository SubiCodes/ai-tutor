import axios from 'axios';
import { File } from 'expo-file-system';
import { Platform } from 'react-native';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_API_GEMINI;

function getMimeType(filename) {
  const extension = filename.split('.').pop()?.toLowerCase();
  
  const mimeTypes = {
    'm4a': 'audio/m4a',
    'caf': 'audio/x-caf',
    'wav': 'audio/wav',
    'mp3': 'audio/mpeg',
    'aac': 'audio/aac',
  };

  if (!extension || !mimeTypes[extension]) {
    return Platform.OS === 'ios' ? 'audio/m4a' : 'audio/m4a';
  }

  return mimeTypes[extension];
}

async function transcribeAudioWithGemini(audioUri) {
  try {
    const file = new File(audioUri);
    const base64Audio = await file.base64();
    const mimeType = getMimeType(file.name);

    const payload = {
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Audio,
              },
            },
            {
              text: 'Transcribe this audio file.',
            },
          ],
        },
      ],
    };

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const transcription = response.data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!transcription) {
      throw new Error('No transcription received from Gemini API');
    }

    return transcription;
  } catch (error) {
    console.error('Error transcribing audio:', error.response?.data || error.message);
    throw error;
  }
}

export default transcribeAudioWithGemini;