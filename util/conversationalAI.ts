import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as SQLite from "expo-sqlite";
import { embedUserQuery } from "./embedUserQuery";
import { getAllEmbeddings } from "@/db/embeddedChunksFunctions";

export type Content = {
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

async function getTopContext(queryEmbedding: number[], limit = 3, db: SQLite.SQLiteDatabase): Promise<string> {
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


export const getAIResponse = async ( conversationHistory: Content[], newPrompt: string, db: SQLite.SQLiteDatabase ): Promise<string> => {
    const queryEmbedding = await embedUserQuery(newPrompt);
    const context = await getTopContext(queryEmbedding, 3, db);

    const allEmbeddings = await getAllEmbeddings(db);
    const fullLectureText = allEmbeddings.map((e) => e.text).join("\n\n");

    const token = process.env.EXPO_PUBLIC_API_OPENAI;
    const endpoint = "https://models.github.ai/inference";
    const model = "openai/gpt-4.1-mini";

    const latestUserTurn: Content = {
        role: "user",
        parts: [{ text: newPrompt }],
    };

    let lectureSection = "";
    if (
        !context || context.length < 200 || // context too short
        /quiz|test|cover (everything|all)/i.test(newPrompt) // user explicitly asks for "whole lecture"
    ) {
        lectureSection = `The lecture content is as follows:\n\n${fullLectureText || "No lecture found."}`;
    } else {
        lectureSection = "Use the retrieved context to answer. Do not rely on missing parts of the lecture.";
    }

    const fullContents: Content[] = [
        {
            role: "user",
            parts: [
                {
                    text: `
                    You are an AI Tutor tasked with teaching about the relevant topic posted by the user.

                    ${lectureSection}

                    Retrieved context:
                    ${context || "No context found."}

                    Answer the user's questions based on this material. 
                    If the question is not related, politely say you can only answer lecture-related queries.
                    `.trim(),
                },
            ],
        },
        ...conversationHistory,
        latestUserTurn,
    ];

    const messages = fullContents.map((c) => ({
        role: c.role,
        content: c.parts?.map((p) => p.text).join("\n\n") ?? "",
    }));

    const requestBody = {
        model,
        messages,
        temperature: 0.7, // slightly lower for more focused answers
        top_p: 1.0,
    };

    try {
        const response = await axios.post(`${endpoint}/chat/completions`, requestBody, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        let generatedText: any = response.data?.choices?.[0]?.message?.content;

        if (!generatedText && response.data?.choices?.[0]?.message?.content?.parts) {
            const parts = response.data.choices[0].message.content.parts;
            generatedText = Array.isArray(parts) ? parts.map((p: any) => p.text ?? p).join("") : String(parts);
        }

        if (typeof generatedText !== "string") {
            generatedText = generatedText ? JSON.stringify(generatedText) : "";
        }

        if (!generatedText) {
            console.warn("Response did not contain generated text:", response.data);
            return "Error: Model did not return a text response.";
        }

        return generatedText;
    } catch (error: any) {
        console.error("Error generating content (OpenAI endpoint):", error.response?.data || error.message || error);
        throw new Error("Failed to generate content from OpenAI endpoint.");
    }
};