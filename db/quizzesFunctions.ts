import * as SQLite from "expo-sqlite";

export const postToQuizzes = async (db: SQLite.SQLiteDatabase, quiz: string, score: number, total: number, type: string) => {
    const result = await db.runAsync(
        "INSERT INTO quizzes (quiz, score, total, type) VALUES (?, ?, ?, ?)",
        [quiz, score, total, type]
    );
};

export const getQuizResult = async (db: SQLite.SQLiteDatabase, id: number) => {
    const quiz = await db.getAllAsync("SELECT * FROM quizzes WHERE id = ?", [id]);
    return quiz as {
        id: number;
        quiz: string;
        score: number;
        total: number;
        type: string;
        date: string;
    }[];
};

export const getQuizResults = async (db: SQLite.SQLiteDatabase) => {
    const allQuizzes = await db.getAllAsync("SELECT * FROM quizzes");
    return allQuizzes as {
        id: number;
        quiz: string;
        score: number;
        total: number;
        type: string;
        date: string;
    }[];
};

export const deleteQuizzesData = async (db: SQLite.SQLiteDatabase) => {
    await db.execAsync("DELETE FROM quizzes;");
};

export const deleteQuizData = async (db: SQLite.SQLiteDatabase, id: number) => {
    await db.runAsync("DELETE FROM quizzes WHERE id = ?", [id]);
};