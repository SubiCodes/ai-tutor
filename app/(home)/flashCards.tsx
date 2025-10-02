import { View, Text, ActivityIndicator, StyleSheet } from 'react-native'
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
import Toast, { Toast as ToastFunc } from 'toastify-react-native'
import AlertDelete from '@/components/AlertDelete'
import Swiper from 'react-native-swiper'

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
    const [isGeneratingFlashCards, setIsGeneratingFlashCards] = useState<boolean>(false);
    const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);

    const getFileName = async () => {
        const currentFile = await getCurrentFileFromAsyncStorage();
        setFileName(currentFile.name);
    };

    const getCurrentFlashCards = async () => {
        if (!db) {
            console.log("NO DB");
            return;
        };

        const rawFlashCards = await getFlashCard(db);
        if (rawFlashCards && rawFlashCards.length > 0) {
            const lectureText = rawFlashCards[0].questions;

            try {
                const parsed: FlashCards = parseQuestionsToJson(lectureText);
                setFlashCards(parsed);
            } catch (err) {
                console.error("Failed to parse flashcards:", err);
                setFlashCards(null);
            }
        } else {
            setFlashCards(null);
        }
    };

    const generateFlashcards = async () => {
        if (!db) return
        setIsGeneratingFlashCards(true);
        try {
            const amountOfCards = amount === '5 Cards' ? 5 : amount === '10 Cards' ? 10 : 15;
            const rawQuestions = await createFlashCardsString(db, amountOfCards);
            await deleteFlashCardTableData(db);
            await postToFlashCard(db, rawQuestions);
            const parsedQuestions = await parseQuestionsToJson(rawQuestions);
            setFlashCards(parsedQuestions);
        } catch (error) {
            ToastFunc.show({
                type: 'error',
                text1: 'Something went wrong',
                text2: 'No flash card was generated. Please try again.',
                position: 'bottom',
                visibilityTime: 4000,
                autoHide: true,
            });
        } finally {
            setIsGeneratingFlashCards(false);
        }
    };

    const deleteCurrentFlashCards = async () => {
        if (!db) return
        setOpenDeleteModal(true)
        try {
            await deleteFlashCardTableData(db);
            setFlashCards(null);
        } catch (error) {
            ToastFunc.show({
                type: 'error',
                text1: 'Something went wrong',
                text2: 'Unable to delete flash cards. Please try again.',
                position: 'bottom',
                visibilityTime: 4000,
                autoHide: true,
            });
        } finally {
            setOpenDeleteModal(false)
        }
    }

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
        getFileName();
        getCurrentFlashCards();
    }, [db]));


    return (
        <SafeAreaView className="flex-1 justify-start items-start bg-background px-4 pb-4 pt-0 gap-2" edges={["left", "right", "bottom"]}>
            <AlertDelete open={openDeleteModal} onOpenChange={() => setOpenDeleteModal(false)} onClose={() => setOpenDeleteModal(false)} onDelete={deleteCurrentFlashCards} title='Create new flash cards' description='Note that the generation of new flash cards deletes the current flash cards displayed.' continueButtonText='Continue' />
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

                        <View className="w-full flex-col gap-4 mb-6">
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

                        <View className='w-full'>
                            <Button className='w-full bg-blue-500 active:bg-blue-600' disabled={isGeneratingFlashCards} onPress={() => generateFlashcards()}>
                                {isGeneratingFlashCards ? (
                                    <ActivityIndicator color={'white'} size={20} />
                                ) : (
                                    <Text className='text-white font-bold'>Confirm</Text>
                                )}
                            </Button>
                        </View>
                    </View>
                </View>
            ) : (
                <View className='flex-1 w-full items-center justify-center'>
                    {/* CARDS CONTAINER */}
                    <View className='flex-1'>
                        <Swiper style={styles.wrapper} showsButtons={true}>
                            <View style={styles.slide1}>
                                <Text style={styles.text}>Hello Swiper</Text>
                            </View>
                            <View style={styles.slide2}>
                                <Text style={styles.text}>Beautiful</Text>
                            </View>
                            <View style={styles.slide3}>
                                <Text style={styles.text}>And simple</Text>
                            </View>
                        </Swiper>
                    </View>
                    <Button className='w-full bg-blue-500 active:bg-blue-600 items-center justify-center flex-row' disabled={isGeneratingFlashCards} onPress={() => setOpenDeleteModal(true)}>
                        <Text className='text-white font-bold'>Generate New Cards</Text>
                        <Sparkles size={16} color={"white"} />
                    </Button>

                </View>
            )}

        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    wrapper: {},
    slide1: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#9DD6EB'
    },
    slide2: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#97CAE5'
    },
    slide3: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#92BBD9'
    },
    text: {
        color: '#fff',
        fontSize: 30,
        fontWeight: 'bold'
    }
})

export default FlashCards