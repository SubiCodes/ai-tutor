import { View, Text } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useFocusEffect } from 'expo-router'
import { createFlashCardsString, parseQuestionsToJson } from '@/util/createFlashCards'
import { getDb } from '@/db/db'
import * as SQLite from "expo-sqlite";
import { deleteFlashCardTableData, getFlashCard, postToFlashCard } from '@/db/flashCardFunctions'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Sparkles, ScrollText } from 'lucide-react-native'
import { getCurrentFileFromAsyncStorage } from '@/util/getTheCurrentFileFromAsyncStorage'
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export type FlashCard = {
    question: string;
    answer: string;
};

export type FlashCards = FlashCard[];

const FlashCards = () => {

    const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
    const [flashCards, setFlashCards] = useState<FlashCards | null>(null);
    const [fileName, setFileName] = useState<string>('Your lecture');
    const [amount, setAmount] = useState<string>('5 Cards');

    const getFileName = async () => {
        const currentFile = await getCurrentFileFromAsyncStorage();
        setFileName(currentFile.name);
    };

    const generateFlashcards = async () => {
        if (!db) return
        const rawQuestions = await createFlashCardsString(db);
        //console.log("Raw Questions: ",rawQuestions);

        await deleteFlashCardTableData(db);
        await postToFlashCard(db, rawQuestions);

        const parsedQuestions = await parseQuestionsToJson(rawQuestions);
        //console.log("Parsed Questions: ",parsedQuestions);
        setFlashCards(parsedQuestions);
    };

    function onLabelPress(amount: string) {
        return () => {
            setAmount(amount);
        };
    }

    function onValueChange(amount: string) {
        setAmount(amount);
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

                        <View className="w-full flex-col gap-2 mb-4">
                            <Text className="text-foreground/80 font-semibold text-base">Lesson</Text>
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

                        <View className="w-full flex-col gap-4">
                            <Text className="text-foreground/80 font-semibold text-base">Number of Cards</Text>
                            <RadioGroup value={amount} onValueChange={onValueChange} className='flex-row flex-wrap'>
                                <View className="flex flex-row items-center gap-3">
                                    <RadioGroupItem value="5 Cards" id="r1" />
                                    <Label htmlFor="r1" onPress={onLabelPress('5 Cards')} className='font-normal'>
                                        5 Cards
                                    </Label>
                                </View>
                                <View className="flex flex-row items-center gap-3">
                                    <RadioGroupItem value="10 Cards" id="r2" />
                                    <Label htmlFor="r2" onPress={onLabelPress('10 Cards')} className='font-normal'>
                                        10 Cards
                                    </Label>
                                </View>
                                <View className="flex flex-row items-center gap-3">
                                    <RadioGroupItem value="15 Cards" id="r3" />
                                    <Label htmlFor="r3" onPress={onLabelPress('15 Cards')} className='font-normal'>
                                        15 Cards
                                    </Label>
                                </View>
                            </RadioGroup>
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