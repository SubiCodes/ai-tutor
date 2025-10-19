import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
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
import Toast, { Toast as ToastFunc } from 'toastify-react-native'

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
        ToastFunc.show({
            type: 'info',
            text1: 'Generating CheatSheet',
            text2: `This might take a while.`,
            position: 'bottom',
            visibilityTime: 4000,
            autoHide: true,
        })
        try {
            if (!db) return;
            await deleteCheatSheetTableData(db)
            const lecture = await createStudyNotesChunked(db);
            setLecture(lecture);
            await postToCheatSheet(db, lecture);
            ToastFunc.show({
                type: 'success',
                text1: 'CheatSheet successfully generated',
                text2: `Goodluck with your studies!!!`,
                position: 'bottom',
                visibilityTime: 4000,
                autoHide: true,
            })
        } catch (error) {
            ToastFunc.show({
                type: 'error',
                text1: 'Unable to generate CheatSheet',
                text2: `Please try again.`,
                position: 'bottom',
                visibilityTime: 4000,
                autoHide: true,
            })
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
        <SafeAreaView className="flex-1 bg-background px-4 pb-4 pt-0" edges={["left", "right", "bottom"]}>
            {!lecture ? (
                <View className='flex-1 w-full items-center justify-center gap-4'>
                    <Text className='text-2xl text-blue-500 font-bold'>No CheatSheet Yet</Text>
                    <TouchableOpacity
                        className="flex-row items-center justify-center p-4 bg-gray-50 rounded-2xl border border-gray-100 w-[80%]"
                        onPress={() => generateCheatSheet()}
                        disabled={generatingLecture}
                    >
                        <View className="w-10 h-10 rounded-full bg-white items-center justify-center mr-3 shadow-sm">
                            <Sparkles color={'#3B82F6'} size={24} />
                        </View>
                        <Text className="text-base text-gray-700">Generate Lecture</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View className="flex-1 w-full">
                    <ScrollView
                        className="flex-1 w-full"
                        contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 16 }}
                    >
                        <Markdown>{lecture}</Markdown>
                    </ScrollView>

                    <View className='absolute bottom-4 left-4 right-4'>
                        <TouchableOpacity
                            onPress={() => generateCheatSheet()}
                            className='bg-blue-500 rounded-xl p-4 items-center justify-center flex-row gap-4 '
                            activeOpacity={.7}
                            disabled={generatingLecture}
                        >
                            {generatingLecture && (
                                <ActivityIndicator size="small" color="#fff" />
                            )}
                            <Text className='text-white font-medium'>Generate New Lecture</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
            <Toast/>
        </SafeAreaView>
    )
}

export default CheatSheet