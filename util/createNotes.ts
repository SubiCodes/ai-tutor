import * as SQLite from "expo-sqlite";
import { getAllEmbeddings } from "@/db/embeddedChunksFunctions";
import axios from "axios";

function cleanCheatSheet(output: string): string {
  return (output || "")
    .replace(/^Here.*?:\s*/i, "")
    .replace(/^Sure.*?:\s*/i, "")
    .replace(/^Okay.*?:\s*/i, "");
}

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
          Do NOT say "Here’s a summary" or "Cheat sheet:" — start directly with notes.
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
          - Do NOT add phrases like "Here’s" or "Summary".
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

    const textResponse = response.data?.choices?.[0]?.message?.content;
    if (!textResponse) {
      console.warn("No summary content from chunk:", JSON.stringify(response.data, null, 2));
      return "";
    }

    return cleanCheatSheet(textResponse);
  } catch (err: any) {
    console.error("Error summarizing chunk:", err.response?.data || err.message || err);
    return "";
  }
}


export const createStudyNotesChunked = async (db: SQLite.SQLiteDatabase): Promise<string> => {
  try {
    const allRows = await getAllEmbeddings(db);
    const fullLecture = allRows.map(r => r.text).join("\n\n");

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
      return "Error: No chunk summaries were generated.";
    }

    const mergedPrompt = `
      Here are partial study notes from different chunks of a lecture:

      ${chunkSummaries.join("\n\n")}

      Now, combine these into one concise, well-structured cheat sheet:
      - Remove redundancy
      - Organize logically (headings, bullet points, etc.)
      - Keep it short and easy to scan
      - Do NOT add phrases like "Here’s a cheat sheet" or "Summary:" — output only the notes
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
          You are an AI Tutor that creates cheat sheets.
          Only output the notes. Do NOT add introductions, disclaimers, or phrases like "Here’s".
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

    const finalCheatSheet = response.data?.choices?.[0]?.message?.content;

    if (!finalCheatSheet) {
      console.warn("No final cheat sheet returned:", JSON.stringify(response.data, null, 2));
      return "Error: AI did not return final study notes.";
    }

    return cleanCheatSheet(finalCheatSheet);
  } catch (err: any) {
    console.error("Error creating study notes:", err.response?.data || err.message || err);
    return "Error: Failed to create study notes.";
  }
};
