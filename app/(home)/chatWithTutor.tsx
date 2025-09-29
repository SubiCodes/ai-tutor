import { View, Text, ScrollView, TextInput, Platform, KeyboardAvoidingView, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Content, getAIResponse } from '@/util/conversationalAI';
import * as SQLite from "expo-sqlite";
import { getDb } from '@/db/db';
import { getAllConversation } from '@/db/conversationFunctions';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '@/components/ui/input';
import { MessageCircle, BookOpen, HelpCircle, Lightbulb, CheckCircle} from 'lucide-react-native';

const suggestions = [
  { icon: BookOpen, text: "Explain a concept from my lecture", color: "text-blue-500" },
  { icon: HelpCircle, text: "Quiz me on this material", color: "text-purple-500" },
  { icon: Lightbulb, text: "Help me understand a difficult topic", color: "text-amber-500" },
  { icon: CheckCircle, text: "Summarize key points", color: "text-emerald-500" }
];


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
            <>
              <View className="items-center mb-8">
                <View className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 items-center justify-center mb-4">
                  <MessageCircle color="white" size={40} strokeWidth={2} />
                </View>

                <Text className="text-3xl font-bold text-gray-900 mb-2 text-center">
                  Start a Conversation
                </Text>

                <Text className="text-base text-gray-500 text-center max-w-sm">
                  Ask me anything or choose a suggestion below to get started
                </Text>
              </View>

              <View className="w-full max-w-md space-y-3">
                {suggestions.map((suggestion, index) => {
                  const Icon = suggestion.icon;
                  return (
                    <TouchableOpacity
                      key={index}
                      className="flex-row items-center p-4 bg-gray-50 rounded-2xl border border-gray-100"
                    >
                      <View className="w-10 h-10 rounded-full bg-white items-center justify-center mr-3 shadow-sm">
                        <Icon className={suggestion.color} size={20} strokeWidth={2} />
                      </View>
                      <Text className="text-base text-gray-700 flex-1">
                        {suggestion.text}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
      <Input className='w-full border-gray-400' placeholder='Ask your tutor...'/>
    </SafeAreaView>
  )
}

export default ChatWithTutor