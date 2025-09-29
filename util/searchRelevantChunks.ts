import { getDb } from "@/db/db";
import { getAllEmbeddings } from "@/db/embeddedChunksFunctions";

function cosineSim(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function retrieveRelevantChunks(queryEmbedding: number[], k = 3) {
  const db = await getDb();
  const rows = await getAllEmbeddings(db);

  const scored = rows.map(row => {
    const floatEmb = new Float32Array(row.embedding.buffer);
    const sim = cosineSim(queryEmbedding, Array.from(floatEmb));
    return { text: row.text, sim };
  });

  return scored
    .sort((a, b) => b.sim - a.sim)
    .slice(0, k)
    .map(r => r.text);
}