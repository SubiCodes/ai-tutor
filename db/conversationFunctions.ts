import * as SQLite from "expo-sqlite";

export const postToConversation = async (
    db: SQLite.SQLiteDatabase, param: { role: 'user' | 'model'; message: string }
    ) => {
    const result = await db.runAsync(
        "INSERT INTO conversation (role, message) VALUES (?, ?)",
        [param.role, param.message]
    );
};

export const getAllConversation = async (db: SQLite.SQLiteDatabase) => {
    const allRows = await db.getAllAsync('SELECT * FROM conversation');
    return allRows as { id: number; role: string; message: string }[];
}

export const deleteConversationTableData = async (db: SQLite.SQLiteDatabase) => {
    await db.execAsync("DELETE FROM conversation;");
};
