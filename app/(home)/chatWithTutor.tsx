import { View, Text, ScrollView, TextInput, Platform, KeyboardAvoidingView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Content, getAIResponse } from '@/util/conversationalAI';
import * as SQLite from "expo-sqlite";
import { getDb } from '@/db/db';
import { getAllConversation } from '@/db/conversationFunctions';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '@/components/ui/input';

const ChatWithTutor = () => {

  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [conversation, setConversation] = useState<Content[]>([]);

  const fetchRecentConversations = async () => {
    if (!db) return;

    const allRows = await getAllConversation(db);
    console.log("All conversation rows:", allRows);

    const mapped: Content[] = allRows.map((r) => ({
      role: r.role === "model" ? "model" : "user",
      parts: [{ text: r.message }],
    }));

    console.log("MAPPED Conversation:", mapped);
    setConversation(mapped);
  };

  const askAi = async (query: string) => {
    if (!db) return;
    const reply = await getAIResponse(conversation, query, db);
  }

  useEffect(() => {
    (async () => {
      const database = await getDb();
      setDb(database);
    })();
    fetchRecentConversations();
  }, [db]);


  return (
    <SafeAreaView className="flex-1 justify-start items-start bg-background px-6 py-4 gap-2" edges={["left", "right", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView className="min-w-full flex-1" contentContainerStyle={{ flexGrow: 1 }}>
          {conversation.length === 0 && (
            <View className="flex-1 justify-center items-center">
              {/* Your empty state content */}
            </View>

          )}
        </ScrollView>
      </KeyboardAvoidingView>
      <Input className='w-full border-gray-400' />
    </SafeAreaView>
  )
}

export default ChatWithTutor