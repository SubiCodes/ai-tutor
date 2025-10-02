import { View, Text } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useFocusEffect } from 'expo-router'
import { createFlashCardsJSON } from '@/util/createFlashCards'
import { getDb } from '@/db/db'
import * as SQLite from "expo-sqlite";

const FlashCards = () => {

    const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);

    useEffect(() => {
        (async () => {
            const database = await getDb();
            setDb(database);
        })();
    }, []);

    useFocusEffect(useCallback(() => {
        if(!db) return
        createFlashCardsJSON(db);
    }, []));

    return (
        <View>
            <Button>
                <Text>Create flash cards</Text>
            </Button>
        </View>
    )
}

export default FlashCards