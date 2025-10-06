import * as SQLite from "expo-sqlite";

export const postToQuizzes = async ( db: SQLite.SQLiteDatabase, quiz: string, score: number, total: number, type: string ) => {
    const result = await db.runAsync(
        "INSERT INTO quizzes (quiz, score, total, type) VALUES (?, ?, ?, ?)",
        [quiz, score, total, type]
    );
};

export const getFlashCard = async (db: SQLite.SQLiteDatabase) => {
    const allRows = await db.getAllAsync('SELECT * FROM flashCards');
    return allRows as { id: number; questions: string }[];
}

export const deleteFlashCardTableData = async (db: SQLite.SQLiteDatabase) => {
    await db.execAsync("DELETE FROM flashCards;");
};