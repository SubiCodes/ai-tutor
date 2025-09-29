import { View, Text } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { createStudyNotes } from '@/util/createNotes'
import { getDb } from '@/db/db'
import * as SQLite from "expo-sqlite";
import Markdown from 'react-native-markdown-display'
import { useFocusEffect } from 'expo-router'
import { deleteCheatSheetTableData, getCheatSheet, postToCheatSheet } from '@/db/cheatSheetFunctions'

const CheatSheet = () => {
    const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
    const [lecture, setLecture] = useState<string>('');

    const fetchCheatSheet = async () => {
        if (!db) return;

        const allRows = await getCheatSheet(db);
        console.log("Cheat Sheet:", allRows);

        if (allRows.length > 0) {
            setLecture(allRows[0].lecture);
        } else {
            setLecture('');
        }
    };


    const generateCheatSheet = async () => {
        if (!db) return;
        await deleteCheatSheetTableData(db)
        const lecture = await createStudyNotes(db);
        setLecture(lecture);
        await postToCheatSheet(db, lecture)
    }

    useEffect(() => {
        (async () => {
            const database = await getDb();
            setDb(database);
        })();
    }, []);

    useFocusEffect(
        useCallback(() => {
            if (db) {
                fetchCheatSheet();
            }
        }, [db])
    );

    return (
        <View>
            <Button onPress={() => generateCheatSheet()}>
                <Text>CheatSheet</Text>
            </Button>
            <Markdown>{lecture}</Markdown>
        </View>
    )
}

export default CheatSheet