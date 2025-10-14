import * as SQLite from "expo-sqlite";
import { getAllEmbeddings } from "@/db/embeddedChunksFunctions";
import axios from "axios";

async function summarizeChunk(text: string): Promise<string> {
    try {
        const apiKey = process.env.EXPO_PUBLIC_API_OPENAI;
        const endpoint = "https://models.github.ai/inference";
        const model = "openai/gpt-4.1-mini";

        const messages = [
            {
                role: "system",
                content: `
            You are an AI Tutor. 
            Output ONLY the study notes, no introductions or explanations.
            Do NOT say "Here’s a summary" — start directly with notes.
            `.trim(),
            },
            {
                role: "user",
                content: `
            Here is a chunk of a lecture:

            ${text}

            Summarize this into concise study notes (cheat sheet style).
            - Focus on key points, definitions, and examples.
            - Keep it short and structured.
        `.trim(),
            },
        ];

        const requestBody = {
            model,
            messages,
            temperature: 0.7,
            max_tokens: 512,
            top_p: 1.0,
        };

        const response = await axios.post(`${endpoint}/chat/completions`, requestBody, {
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
        });

        return response.data?.choices?.[0]?.message?.content?.trim() || "";
    } catch (err: any) {
        console.error("Error summarizing chunk:", err.response?.data || err.message || err);
        return "";
    }
}

export const createQuizzesString = async (db: SQLite.SQLiteDatabase, amount: number, type: string): Promise<string> => {
    try {
        const allRows = await getAllEmbeddings(db);
        const fullLecture = allRows.map((r) => r.text).join("\n\n");

        const quizTypePrompt = type === "multiple choice"
            ? `[ 
                { "question": "question here", "answer": "a, b, c or d", "choices": "a) choice ** b) choice ** c )choice ** d) choice " },
                { "question": "question here", "answer": "a, b, c or d", "choices": "choices here" }
                ]`
            : `[
                { "question": "question here", "answer": "true or false"},
                { "question": "question here", "answer": "true or false"}
            ]`;

        const CHUNK_SIZE = 10000;
        const chunks: string[] = [];
        for (let i = 0; i < fullLecture.length; i += CHUNK_SIZE) {
            chunks.push(fullLecture.slice(i, i + CHUNK_SIZE));
        }

        const chunkSummaries: string[] = [];
        for (const chunk of chunks) {
            const summary = await summarizeChunk(chunk);
            if (summary) chunkSummaries.push(summary);
        }

        if (chunkSummaries.length === 0) {
            return '';
        }

        const mergedPrompt = `
        Here are partial study notes from different chunks of a lecture:

        ${chunkSummaries.join("\n\n")}

        Now, create a quiz in pure JSON format ONLY:
        ${quizTypePrompt}
        - Keep questions clear and answers concise.
        - Return ONLY valid JSON. No explanations, no text outside the array.
        - Only make ${amount} amount of questions.
        - Do not add styling to the text.
    `.trim();

        const apiKey = process.env.EXPO_PUBLIC_API_OPENAI;
        const endpoint = "https://models.github.ai/inference";
        const model = "openai/gpt-4.1-mini";

        const requestBody = {
            model,
            messages: [
                {
                    role: "system",
                    content: `
            You are an AI Tutor that creates flashcards.
            Always return ONLY valid JSON in the format:
            ${quizTypePrompt}
          `.trim(),
                },
                { role: "user", content: mergedPrompt },
            ],
            temperature: 0.7,
            max_tokens: 1024,
            top_p: 1.0,
        };

        const response = await axios.post(`${endpoint}/chat/completions`, requestBody, {
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
        });

        const rawOutput = response.data?.choices?.[0]?.message?.content?.trim();
        if (!rawOutput) {
            console.warn("No quiz returned:", JSON.stringify(response.data, null, 2));
            return "";
        }

        return rawOutput;
    } catch (err: any) {
        console.error("Error creating quiz:", err.response?.data || err.message || err);
        return "";
    }
};

export const parseQuizToJson = (rawText: string) => {
  try {
    return JSON.parse(rawText) as Array<{ question: string; answer: string; choices?: string }>;
  } catch (parseErr) {
    console.error("Failed to parse flashcards JSON. Raw output:", rawText);
    return [];
  }
};
