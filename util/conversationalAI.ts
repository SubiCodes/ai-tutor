import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as SQLite from "expo-sqlite";
import { embedUserQuery } from "./embedUserQuery";
import { getDb } from "@/db/db";
import { getAllEmbeddings } from "@/db/embeddedChunksFunctions";

type Content = {
    role: "user" | "model";
    parts: { text: string }[];
};

function uint8ToFloat32(uint8Arr: Uint8Array): Float32Array {
    return new Float32Array(uint8Arr.buffer);
}

function cosineSimilarity(a: Float32Array, b: Float32Array): number {
    let dot = 0,
        normA = 0,
        normB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function getTopContext(queryEmbedding: number[], limit = 3): Promise<string> {
    const db = await getDb();
    const rows = await getAllEmbeddings(db);

    const queryVec = new Float32Array(queryEmbedding);

    const scored = rows.map(row => {
        const chunkEmbedding = uint8ToFloat32(row.embedding);
        const score = cosineSimilarity(queryVec, chunkEmbedding);
        return { text: row.text, score };
    });
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit).map(r => r.text).join("\n\n");
}

export const getAIResponse = async (
    conversationHistory: Content[],
    newPrompt: string
): Promise<string> => {
    const queryEmbedding = await embedUserQuery(newPrompt);
    const context = await getTopContext(queryEmbedding);
    const lecturePosted = await AsyncStorage.getItem("tutorKnowledge");

    const apiKey = process.env.EXPO_PUBLIC_API_GEMINI;
    const modelName = "gemini-2.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const latestUserTurn: Content = {
        role: "user",
        parts: [{ text: newPrompt }],
    };

    const fullContents: Content[] = [
        {
            role: "user",
            parts: [
                {
                    text: `
                        You are an AI Tutor tasked with teaching about the relevant topic posted by the user.  
                        The lecture posted by the user is as follows:  

                        ${lecturePosted || "No lecture found."}

                        Answer the user's questions based on this lecture **and the retrieved context**.  
                        If the question is not related, politely say you can only answer lecture-related queries.
          `,
                },
                { text: `Retrieved context:\n${context}` },
            ],
        },
        ...conversationHistory,
        latestUserTurn,
    ];

    const requestBody = {
        contents: fullContents,
        generationConfig: {
            thinkingConfig: { thinkingBudget: 0 },
        },
    };

    try {
        const response = await axios.post(url, requestBody);
        const generatedText = response.data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!generatedText) {
            console.warn("Response did not contain generated text:", response.data);
            return "Error: Model did not return a text response.";
        }

        return generatedText;
    } catch (error: any) {
        console.error("Error generating content:", error.response?.data || error.message || error);
        throw new Error("Failed to generate content from Gemini API.");
    }
};
