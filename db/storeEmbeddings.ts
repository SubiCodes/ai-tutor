import * as SQLite from 'expo-sqlite';

const db = await SQLite.openDatabaseAsync('embedding');
const TABLE_NAME = 'uploadedFileEmbedding';

const vectorToSQLiteBlob = (embedding: number[]): Uint8Array => {
    const float32Array = new Float32Array(embedding);
    return new Uint8Array(float32Array.buffer);
};

export const storeEmbeddings = async (fileName: string, embedding: number[]) => {
    try {
        await db.execAsync(`
            -- WARNING: Remove the DROP TABLE line in production to preserve data
            DROP TABLE IF EXISTS ${TABLE_NAME};
            
            CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
                id INTEGER PRIMARY KEY NOT NULL,
                file_name TEXT NOT NULL,
                embedding BLOB NOT NULL
            );
        `);

        const embeddingBlob = vectorToSQLiteBlob(embedding);

        await db.runAsync(
            `INSERT INTO ${TABLE_NAME} (file_name, embedding) VALUES (?, ?)`,
            fileName,
            embeddingBlob
        );
        
        console.log(`✅ Stored embedding for file: "${fileName.substring(0, 50)}..."`);
        
    } catch (error) {
        console.error('Error in storeEmbeddings (Initialization or Insertion):', error);
        throw error;
    }
};