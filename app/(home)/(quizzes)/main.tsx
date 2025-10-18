import { View, Text, ScrollView, TouchableOpacity, Pressable } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { deleteQuizzesData, getQuizResults } from '@/db/quizzesFunctions'
import * as SQLite from 'expo-sqlite';
import { useFocusEffect, useRouter } from 'expo-router';
import { getDb } from '@/db/db';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AlertCreateMultipleChoiceQuiz from '@/components/AlertCreateMultipleChoiceQuiz';
import { getCurrentFileFromAsyncStorage } from '@/util/getTheCurrentFileFromAsyncStorage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import { Sparkles, ScrollText } from 'lucide-react-native'
import CardQuizResult from '@/components/CardQuizResult';
import { Input } from '@/components/ui/input';
import { SlidersHorizontal } from 'lucide-react-native';
import BottomSheet from '@/components/BottomSheet';
import Animated, { useSharedValue } from 'react-native-reanimated';
import BottomSheetFilterQuizzes from '@/components/BottomSheetFilterQuizzes';

export type QuizQuestion = {
    question: string;
    answer: string;
    choices: string;
    userAnswer: string;
};

export type QuizData = {
    id: number;
    quiz: QuizQuestion[];
    score: number;
    total: number;
    type: string;
    date: string;
}

const getGrade = (percentage: number): string => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
};

const Main = () => {
    const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
    const router = useRouter();

    const [quizResults, setQuizResults] = useState<QuizData[] | []>([]);
    const [fetchingQuizzes, setFetchingQuizzes] = useState<boolean>(false);

    //#region Filtering States and Functions
    const isFilterOpen = useSharedValue(false);
    const toggleSheet = () => {
        isFilterOpen.value = !isFilterOpen.value;
    };
    const [filters, setFilters] = useState<{ type: 'All' | 'Multiple Choice' | 'True or False'; sortBy: 'Latest First' | 'Oldest First'; grade: 'All' | 'A' | 'B' | 'C' | 'D' | 'F'; }>({ type: 'All', sortBy: 'Latest First', grade: 'All', });
    const [filteredQuizResults, setFiteredQuizResults] = useState<QuizData[] | []>([]);

    useEffect(() => {
        if (!quizResults || quizResults.length === 0) {
            setFiteredQuizResults([]);
            return;
        };
        let filtered = [...quizResults];
        //filter by quiz type
        if (filters.type !== 'All') {
            filtered = filtered.filter(q => q.type === filters.type);
        };
        //filter by grade
        if (filters.grade !== 'All') {
            filtered = filtered.filter(q => {
                const percentage = (q.score / q.total) * 100;
                const grade = getGrade(percentage);
                return grade === filters.grade;
            });
        };
        //sort by date
        filtered.sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return filters.sortBy === 'Latest First' ? dateB - dateA : dateA - dateB;
        });
        //update the state
        setFiteredQuizResults(filtered);
    }, [quizResults, filters]);
    //#endregion

    const [fileName, setFileName] = useState<string>('File name');
    const [showCreateQuizModal, setShowCreateQuizModal] = useState<boolean>(false);

    const fetchQuizzes = async () => {
        if (!db) return;
        setFetchingQuizzes(true);
        try {
            const currentFile = await getCurrentFileFromAsyncStorage();
            setFileName(currentFile.name);
            const quizzes = await getQuizResults(db);
            const parsedQuizzes = quizzes.map((quiz: any) => ({
                ...quiz,
                quiz: typeof quiz.quiz === "string" ? JSON.parse(quiz.quiz) : quiz.quiz,
            }));

            setQuizResults(parsedQuizzes);

            console.log(parsedQuizzes);
        } catch (error) {
            console.log("Unable to get the results for quizzes.")
        } finally {
            setFetchingQuizzes(false);
        }
    };

    const deleteAllQuizzes = async () => {
        if (!db) return;
        await deleteQuizzesData(db)
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
        <SafeAreaView className="flex-1 justify-start items-start bg-background px-4 pt-4 py-4" edges={["left", "right", "bottom"]}>
            {db && (
                <AlertCreateMultipleChoiceQuiz open={showCreateQuizModal} onClose={() => setShowCreateQuizModal(false)} onOpenChange={() => setShowCreateQuizModal(false)} fileName={fileName} db={db} router={router} />
            )}
            <ScrollView className="w-full flex-1" showsVerticalScrollIndicator={false}>
                <View className="flex-row items-center bg-white rounded-md border border-gray-300 px-3 py-2 mb-2">
                    <Text className="text-2xl font-bold text-blue-400 flex-1">Quiz Results</Text>
                    <TouchableOpacity className="items-center justify-center" onPress={toggleSheet}>
                        <SlidersHorizontal size={20} color={"#4B5563"} />
                    </TouchableOpacity>
                </View>
                {filteredQuizResults && filteredQuizResults.length > 0 ? (
                    <>
                        <View className="w-full flex-col gap-1">
                            {filteredQuizResults.map((quiz, index) => (
                                <View key={index} className="bg-card mb-2 rounded-2xl shadow-sm w-full">
                                    <CardQuizResult data={quiz} />
                                </View>
                            ))}
                        </View>
                    </>
                ) : (
                    <View className="flex-1 w-full items-center justify-center mt-24 px-4">
                        <View className="items-center">
                            <Sparkles size={64} color="#3B82F6" />
                            <Text className="text-xl font-bold text-foreground mt-4">
                                No quizzes found
                            </Text>
                            <Text className="text-center text-muted-foreground mt-2">
                                Try adjusting your filters or create your first quiz!
                            </Text>
                        </View>
                    </View>
                )}
            </ScrollView>
            {/* <Button className='w-full bg-blue-500 active:bg-blue-600 items-center justify-center flex-row' onPress={() => deleteAllQuizzes()}>
                <Text className='text-white font-bold'>Delete</Text>
                <Sparkles size={16} color={"white"} />
            </Button> */}
            <View className='w-full'>
                <Button className='w-full bg-blue-500 active:bg-blue-600 items-center justify-center flex-row' onPress={() => setShowCreateQuizModal(true)}>
                    <Text className='text-white font-bold'>Generate new quiz</Text>
                    <Sparkles size={16} color={"white"} />
                </Button>
            </View>
            <BottomSheetFilterQuizzes
                isOpen={isFilterOpen}
                toggleSheet={toggleSheet}
                filters={filters}
                setFilters={setFilters}
            />
        </SafeAreaView >
    )
}

export default Main