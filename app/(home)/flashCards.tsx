import { View, Text } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useFocusEffect } from 'expo-router'
import { createFlashCardsString, parseQuestionsToJson } from '@/util/createFlashCards'
import { getDb } from '@/db/db'
import * as SQLite from "expo-sqlite";

const FlashCards = () => {

    const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);

    const generateFlashcards = async () => {
        if(!db) return
        const rawQuestions = await createFlashCardsString(db);
        //console.log("Raw Questions: ",rawQuestions);
        const parsedQuestions = await parseQuestionsToJson(rawQuestions);
        //console.log("Parsed Questions: ",parsedQuestions);
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