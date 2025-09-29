import axios from 'axios';

type Content = {
    role: 'user' | 'model';
    parts: { text: string }[];
};

export const getAIResponse = async ( conversationHistory: Content[], newPrompt: string ): Promise<string> => {
    const apiKey = process.env.EXPO_PUBLIC_API_GEMINI;
    const modelName = 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const latestUserTurn: Content = {
        role: 'user',
        parts: [{ text: newPrompt }],
    };

    const fullContents = [...conversationHistory, latestUserTurn];

    const requestBody = {
        contents: fullContents,
        generationConfig: {
            thinkingConfig: {
                thinkingBudget: 0,
            },
        },
    };

    try {
        const response = await axios.post(url, requestBody);
        const generatedText = response.data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!generatedText) {
            console.warn('Response did not contain generated text:', response.data);
            return 'Error: Model did not return a text response.';
        }

        return generatedText;
    } catch (error: any) {
        console.error('Error generating content:', error.response?.data || error.message || error);
        throw new Error('Failed to generate content from Gemini API.');
    }
};