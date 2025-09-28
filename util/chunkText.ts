export function chunkText(text: string, maxLength = 500) {
  const words = text.split(/\s+/);
  let chunks = [];
  let currentChunk = [];

  for (let word of words) {
    if ((currentChunk.join(" ") + " " + word).length > maxLength) {
      chunks.push(currentChunk.join(" "));
      currentChunk = [];
    }
    currentChunk.push(word);
  }
  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(" "));
  }
  return chunks;
}