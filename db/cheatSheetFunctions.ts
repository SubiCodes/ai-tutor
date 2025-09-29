import * as SQLite from "expo-sqlite";

export const postToCheatSheet = async (
    db: SQLite.SQLiteDatabase, lecture: string
    ) => {
    const result = await db.runAsync(
        "INSERT INTO cheatSheet (lecture) VALUES (?)",
        [lecture]
    );
};

export const getCheatSheet= async (db: SQLite.SQLiteDatabase) => {
    const allRows = await db.getAllAsync('SELECT * FROM cheatSheet');
    return allRows as { id: number; lecture: string }[];
}

export const deleteCheatSheetTableData = async (db: SQLite.SQLiteDatabase) => {
    await db.execAsync("DELETE FROM cheatSheet;");
};