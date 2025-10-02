import { View, Text } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useFocusEffect } from 'expo-router'
import { createFlashCardsString, parseQuestionsToJson } from '@/util/createFlashCards'
import { getDb } from '@/db/db'
import * as SQLite from "expo-sqlite";
import { deleteFlashCardTableData, getFlashCard, postToFlashCard } from '@/db/flashCardFunctions'
import { SafeAreaView } from 'react-native-safe-area-context'
import EvilIcons from '@expo/vector-icons/EvilIcons';
import { Ionicons } from "@expo/vector-icons";
import { Sparkles, ScrollText } from 'lucide-react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getCurrentFileFromAsyncStorage } from '@/util/getTheCurrentFileFromAsyncStorage'

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectGroup,
    SelectLabel
} from "@/components/ui/select"

export type FlashCard = {
    question: string;
    answer: string;
};

export type FlashCards = FlashCard[];

const FlashCards = () => {

    const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
    const [flashCards, setFlashCards] = useState<FlashCards | null>(null);
    const [fileName, setFileName] = useState<string>('Your lecture');

    const getFileName = async () => {
        const currentFile = await getCurrentFileFromAsyncStorage();
        setFileName(currentFile.name);
    }

    const generateFlashcards = async () => {
        if (!db) return
        const rawQuestions = await createFlashCardsString(db);
        //console.log("Raw Questions: ",rawQuestions);

        await deleteFlashCardTableData(db);
        await postToFlashCard(db, rawQuestions);

        const parsedQuestions = await parseQuestionsToJson(rawQuestions);
        //console.log("Parsed Questions: ",parsedQuestions);
        setFlashCards(parsedQuestions);
    }

    useEffect(() => {
        (async () => {
            const database = await getDb();
            setDb(database);
        })();
    }, []);

    useFocusEffect(useCallback(() => {
        getFileName()
    }, []));


    return (
        <SafeAreaView className="flex-1 justify-start items-start bg-background px-4 pb-4 pt-0 gap-2" edges={["left", "right", "bottom"]}>

            {!flashCards ? (
                <View className="w-full h-full items-center justify-center">
                    <View className="bg-background w-80 min-h-[96px] py-4 px-4 border rounded-xl border-gray-200 dark:border-gray-700 flex-col">
                        {/* HEADER */}
                        <View className="w-full items-center justify-center mb-4 flex-row gap-2">
                            <Text className="text-blue-500 font-bold text-xl">Generate Flash Cards</Text>
                            <Sparkles size={20} color={"#3B82F6"} />
                        </View>

                        <View className="w-full flex-col gap-2 mb-2">
                            <Text className="text-foreground/80 font-normal text-base">Lesson</Text>
                            <View className="w-full p-4 border rounded-lg border-gray-300 bg-gray-50 flex-row items-center justify-between">
                                <ScrollText size={24} color={"#3B82F6"} />
                                <Text
                                    className="ml-2 text-gray-800 flex-1"
                                    numberOfLines={1}
                                    ellipsizeMode="middle"
                                >
                                    {fileName}
                                </Text>
                            </View>
                        </View>

                        <View className="w-full flex-col gap-2">
                            <Text className="text-foreground/80 font-normal text-base">Number of Cards</Text>
                            <Select>
                                <SelectTrigger className='w-full'>
                                    <SelectValue placeholder='Amount of cards generated' />
                                </SelectTrigger>
                                <SelectContent className='w-full'>
                                    <SelectGroup>
                                        <SelectLabel>Fruits</SelectLabel>
                                        <SelectItem label='5 Cards' value={'5'}>
                                            5 Cards
                                        </SelectItem>
                                        <SelectItem label='10 Cards' value={'10'}>
                                            10 Cards
                                        </SelectItem>
                                        <SelectItem label='15 Cards' value={'15'}>
                                            15 Cards
                                        </SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </View>
                    </View>
                </View>
            ) : (
                <Text>Display Cards here</Text>
            )}

        </SafeAreaView>
    )
}

export default FlashCards