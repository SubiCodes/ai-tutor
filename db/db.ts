import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase | null = null;

export const getDb = async (): Promise<SQLite.SQLiteDatabase> => {
  if (!db) {
    db = await SQLite.openDatabaseAsync("aiTutor");
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS embeddings (
        id INTEGER PRIMARY KEY NOT NULL,
        text TEXT NOT NULL,
        embedding BLOB NOT NULL
      );
    `);
  }
  return db;
};
