import * as SQLite from "expo-sqlite";
import axios from "axios";
import { getAllEmbeddings } from "@/db/embeddedChunksFunctions";

export const createStudyNotes = async (db: SQLite.SQLiteDatabase): Promise<string> => {
  const allRows = await getAllEmbeddings(db);
  const fullLecture = allRows.map(r => r.text).join("\n\n");

  const apiKey = process.env.EXPO_PUBLIC_API_GEMINI;
  const modelName = "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `
            You are an AI Tutor. 
            The following is a lecture transcript divided into chunks:

            ${fullLecture}

            Your task: Create concise, well-structured study notes from this lecture (Cheat Sheet format to be concise). 
            Highlight key points, definitions, and examples in a way that's easy for a student to review.
            DO NOT EXCEED THE TOKEN LIMIT FOR FREE TIER
            `
          }
        ],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    },
  };

  try {
    const response = await axios.post(url, requestBody);
    const generatedText = response.data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      console.warn("No notes returned:", response.data);
      return "Error: AI did not return study notes.";
    }

    return generatedText;
  } catch (error: any) {
    console.error("Error creating study notes:", error.response?.data || error.message || error);
    throw new Error("Failed to generate study notes from Gemini API.");
  }
};