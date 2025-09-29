import { View, Text } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { getAIResponse } from '@/util/conversationalAI';
import * as SQLite from "expo-sqlite";
import { getDb } from '@/db/db';

const ChatWithTutor = () => {

  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);

  const test = async (query: string) => {
    if (!db) return;
    const reply = await getAIResponse([], query, db);
    console.log(reply);
  }

  useEffect(() => {
    (async () => {
      const database = await getDb();
      setDb(database);
    })();
  }, []);

  return (
    <View>
      <Button onPress={() => test("What is it that you do?")}><Text>TEST</Text></Button>
    </View>
  )
}

export default ChatWithTutor