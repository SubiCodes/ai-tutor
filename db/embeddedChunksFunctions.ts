import * as SQLite from 'expo-sqlite';

export function embeddingToUint8Array(embedding: number[]): Uint8Array {
    const buffer = new ArrayBuffer(embedding.length * 4);
    const view = new DataView(buffer);

    embedding.forEach((value, i) => {
        view.setFloat32(i * 4, value, true);
    });

    return new Uint8Array(buffer);
}

export const deleteEmbeddingsTableData = async (db: SQLite.SQLiteDatabase) => {
    await db.execAsync("DELETE FROM embeddings;");
};

export const postEmbeddedChunks = async (
    db: SQLite.SQLiteDatabase,
    chunk: { text: string; embedding: Uint8Array }
    ) => {
    const result = await db.runAsync(
        "INSERT INTO embeddings (text, embedding) VALUES (?, ?)",
        [chunk.text, chunk.embedding]
    );

    console.log(`✅ Inserted rowId: ${result.lastInsertRowId}`);
};

export const getAllEmbeddings = async (db: SQLite.SQLiteDatabase) => {
    const allRows = await db.getAllAsync('SELECT * FROM embeddings');
    for (const row of allRows) {
        console.log(row);
    }
}