import * as SQLite from "expo-sqlite";

export const postToConversation = async (
    db: SQLite.SQLiteDatabase, param: { role: 'user' | 'model'; message: string }
    ) => {
    const result = await db.runAsync(
        "INSERT INTO conversation (role, message) VALUES (?, ?)",
        [param.role, param.message]
    );

    console.log(`✅ Inserted rowId: ${result.lastInsertRowId}`);
};
