import { View, Text } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { getQuizResults } from '@/db/quizzesFunctions'
import * as SQLite from 'expo-sqlite';
import { useFocusEffect } from 'expo-router';
import { getDb } from '@/db/db';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AlertCreateMultipleChoiceQuiz from '@/components/AlertCreateMultipleChoiceQuiz';
import { getCurrentFileFromAsyncStorage } from '@/util/getTheCurrentFileFromAsyncStorage';

export type QuizData = {
    id: number;
    quiz: string;
    score: number;
    total: number;
    type: string;
    date: string;
}

const Main = () => {
    const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
    const [quizResults, setQuizResults] = useState<QuizData[] | []>([]);
    const [fetchingQuizzes, setFetchingQuizzes] = useState<boolean>(false);

    const [fileName, setFileName] = useState<string>('File name');
    const [showCreateQuizModal, setShowCreateQuizModal] = useState<boolean>(true);

    const fetchQuizzes = async () => {
        if (!db) return;
        setFetchingQuizzes(true);
        try {
            const currentFile = await getCurrentFileFromAsyncStorage();
            setFileName(currentFile.name);
            const quizzes = await getQuizResults(db);
            console.log(quizzes)
            setQuizResults(quizzes);
        } catch (error) {
            console.log("Unable to get the results for quizzes.")
        } finally {
            setFetchingQuizzes(false);
        }
    }

    useEffect(() => {
        (async () => {
            const database = await getDb();
            setDb(database);
        })();
    }, []);

    useFocusEffect(useCallback(() => {
        fetchQuizzes();
    }, [db]))

    return (
        <View>
            {db && (
                <AlertCreateMultipleChoiceQuiz open={showCreateQuizModal} onClose={() => setShowCreateQuizModal(false)} onOpenChange={() => setShowCreateQuizModal(false)} fileName={fileName} type='multiple choice' db={db} />
            )}
            <Text>Main</Text>
        </View>
    )
}

export default Main