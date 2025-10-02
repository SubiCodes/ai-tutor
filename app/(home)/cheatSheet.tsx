import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { createStudyNotesChunked } from '@/util/createNotes'
import { getDb } from '@/db/db'
import * as SQLite from "expo-sqlite";
import Markdown from 'react-native-markdown-display'
import { useFocusEffect } from 'expo-router'
import { deleteCheatSheetTableData, getCheatSheet, postToCheatSheet } from '@/db/cheatSheetFunctions'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Sparkles } from 'lucide-react-native'
import { deleteEmbeddingsTableData } from '@/db/embeddedChunksFunctions'

const CheatSheet = () => {
    const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
    const [lecture, setLecture] = useState<string>('');
    const [generatingLecture, setGeneratingLecture] = useState<boolean>(false);

    const fetchCheatSheet = async () => {
        if (!db) return;

        const allRows = await getCheatSheet(db);

        if (allRows.length > 0) {
            setLecture(allRows[0].lecture);
        } else {
            setLecture('');
        }
    };


    const generateCheatSheet = async () => {
        setGeneratingLecture(true);
        try {
            if (!db) return;
            await deleteCheatSheetTableData(db)
            const lecture = await createStudyNotesChunked(db);
            setLecture(lecture);
            await postToCheatSheet(db, lecture)
        } catch (error) {

        } finally {
            setGeneratingLecture(false);
        }
    };

    const deleteLecture = async () => {
        if (!db) { return }
        await deleteCheatSheetTableData(db);
        setLecture('');
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
        <SafeAreaView className="flex-1 justify-start items-start bg-background px-4 pb-4 pt-0 gap-2" edges={["left", "right", "bottom"]}>
            {!lecture ? (
                <View className='w-full h-full items-center justify-center gap-4'>
                    <Text className='text-2xl text-blue-500 font-bold'>No CheatSheet Yet</Text>
                    <TouchableOpacity
                        className="flex-row items-center justify-center p-4 bg-gray-50 rounded-2xl border border-gray-100 w-[80%]"
                        onPress={() => generateCheatSheet()} disabled={generatingLecture}
                    >
                        <View className="w-10 h-10 rounded-full bg-white items-center justify-center mr-3 shadow-sm">
                            <Sparkles color={'#3B82F6'} size={24} />
                        </View>
                        <Text className="text-base text-gray-700">
                            Generate Lecture
                        </Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView
                    className="flex-1 w-full min-h-full"
                    contentContainerStyle={{ paddingBottom: 20, paddingTop: 20, paddingHorizontal: 16 }}
                >
                    <Markdown>{lecture}</Markdown>
                </ScrollView>
            )}


        </SafeAreaView>
    )
}

export default CheatSheet