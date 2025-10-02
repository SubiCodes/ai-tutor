import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase | null = null;

export const getDb = async (): Promise<SQLite.SQLiteDatabase> => {
  if (!db) {
    db = await SQLite.openDatabaseAsync("aiTutor");

    await db.execAsync(`PRAGMA journal_mode = WAL;`);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS embeddings (
        id INTEGER PRIMARY KEY NOT NULL,
        text TEXT NOT NULL,
        embedding BLOB NOT NULL
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS conversation (
        id INTEGER PRIMARY KEY NOT NULL,
        role TEXT NOT NULL,
        message TEXT NOT NULL
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS cheatSheet (
        id INTEGER PRIMARY KEY NOT NULL,
        lecture TEXT NOT NULL
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS flashCards (
        id INTEGER PRIMARY KEY NOT NULL,
        questions TEXT NOT NULL
      );
    `);
  }
  return db;
};
