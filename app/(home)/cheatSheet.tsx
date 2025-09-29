import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { createStudyNotes } from '@/util/createNotes'
import { getDb } from '@/db/db'
import * as SQLite from "expo-sqlite";
import Markdown from 'react-native-markdown-display'

const CheatSheet = () => {
    const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
    const [lecture, setLecture] = useState<string>('');

    const generateCheatSheet = async () => {
        if (!db) return;
        const lecture = await createStudyNotes(db);
        setLecture(lecture)
    }

    useEffect(() => {
        (async () => {
            const database = await getDb();
            setDb(database);
        })();
    }, []);
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