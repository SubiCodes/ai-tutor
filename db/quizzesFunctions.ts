import * as SQLite from "expo-sqlite";

export const postToQuizzes = async (db: SQLite.SQLiteDatabase, quiz: string, score: number, total: number, type: string) => {
    const result = await db.runAsync(
        "INSERT INTO quizzes (quiz, score, total, type) VALUES (?, ?, ?, ?)",
        [quiz, score, total, type]
    );
};

export const getQuizResult = async (db: SQLite.SQLiteDatabase, id: number) => {
    const allRows = await db.getAllAsync("SELECT * FROM quizzes WHERE id = ?", [id]);
    return allRows as {
        id: number;
        quiz: string;
        score: number;
        total: number;
        type: string;
        date: string;
    }[];
};

export const deleteFlashCardTableData = async (db: SQLite.SQLiteDatabase) => {
    await db.execAsync("DELETE FROM flashCards;");
};