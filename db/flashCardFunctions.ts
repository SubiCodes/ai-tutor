import * as SQLite from "expo-sqlite";

export const postToFlashCard = async (
    db: SQLite.SQLiteDatabase, questions: string
    ) => {
    const result = await db.runAsync(
        "INSERT INTO flashCards (questions) VALUES (?)",
        [questions]
    );
};

export const getFlashCard = async (db: SQLite.SQLiteDatabase) => {
    const allRows = await db.getAllAsync('SELECT * FROM flashCards');
    return allRows as { id: number; questions: string }[];
}

export const deleteFlashCardTableData = async (db: SQLite.SQLiteDatabase) => {
    await db.execAsync("DELETE FROM flashCards;");
};