import { View, Text } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useFocusEffect } from 'expo-router'
import { createFlashCardsString, parseQuestionsToJson } from '@/util/createFlashCards'
import { getDb } from '@/db/db'
import * as SQLite from "expo-sqlite";
import { deleteFlashCardTableData, getFlashCard, postToFlashCard } from '@/db/flashCardFunctions'

export type FlashCard = {
  question: string;
  answer: string;
};

export type FlashCards = FlashCard[];

const FlashCards = () => {

    const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
    const [flashCards, setFlashCards] = useState<FlashCards>();

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


    return (
        <View>
            <Button onPress={() => generateFlashcards()}>
                <Text>Create flash cards</Text>
            </Button>
        </View>
    )
}

export default FlashCards