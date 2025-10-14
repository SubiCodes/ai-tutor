import { View, Text, ScrollView } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { getQuizResults } from '@/db/quizzesFunctions'
import * as SQLite from 'expo-sqlite';
import { useFocusEffect, useRouter } from 'expo-router';
import { getDb } from '@/db/db';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AlertCreateMultipleChoiceQuiz from '@/components/AlertCreateMultipleChoiceQuiz';
import { getCurrentFileFromAsyncStorage } from '@/util/getTheCurrentFileFromAsyncStorage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import { Sparkles, ScrollText } from 'lucide-react-native'

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
    const router = useRouter();

    const [quizResults, setQuizResults] = useState<QuizData[] | []>([]);
    const [fetchingQuizzes, setFetchingQuizzes] = useState<boolean>(false);

    const [fileName, setFileName] = useState<string>('File name');
    const [showCreateQuizModal, setShowCreateQuizModal] = useState<boolean>(false);

    const fetchQuizzes = async () => {
        if (!db) return;
        setFetchingQuizzes(true);
        try {
            const currentFile = await getCurrentFileFromAsyncStorage();
            setFileName(currentFile.name);
            const quizzes = await getQuizResults(db);
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
        <SafeAreaView className="flex-1 justify-start items-start bg-background px-6 pt-4 py-4" edges={["left", "right", "bottom"]}>
            {db && (
                <AlertCreateMultipleChoiceQuiz open={showCreateQuizModal} onClose={() => setShowCreateQuizModal(false)} onOpenChange={() => setShowCreateQuizModal(false)} fileName={fileName} type='multiple choice' db={db} router={router} />
            )}
            <ScrollView className="w-full flex-1" showsVerticalScrollIndicator={false}>
                {quizResults && quizResults.length > 0 ? (
                    // ✅ Render quiz list here
                    quizResults.map((quiz, index) => (
                        <View key={index} className="bg-card p-4 mb-3 rounded-2xl shadow-sm w-full">
                            
                        </View>
                    ))
                ) : (
                    // ❌ Empty state when no quiz results
                    <View className="flex-1 w-full items-center justify-center mt-24 px-4">
                        <View className="items-center">
                            <Sparkles size={64} color="#3B82F6" />
                            <Text className="text-xl font-bold text-foreground mt-4">
                                No quizzes yet
                            </Text>
                            <Text className="text-center text-muted-foreground mt-2">
                                You haven’t created any quizzes yet. Tap below to generate your first one!
                            </Text>
                        </View>
                    </View>
                )}
            </ScrollView>
            <View className='w-full'>
                <Button className='w-full bg-blue-500 active:bg-blue-600 items-center justify-center flex-row' onPress={() => setShowCreateQuizModal(true)}>
                    <Text className='text-white font-bold'>Generate new quiz</Text>
                    <Sparkles size={16} color={"white"} />
                </Button>
            </View>
        </SafeAreaView>
    )
}

export default Main