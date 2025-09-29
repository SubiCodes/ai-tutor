import { View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Content, getAIResponse } from '@/util/conversationalAI';
import * as SQLite from "expo-sqlite";
import { getDb } from '@/db/db';
import { deleteConversationTableData, getAllConversation, postToConversation } from '@/db/conversationFunctions';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Input } from '@/components/ui/input';
import { MessageCircle, BookOpen, HelpCircle, Lightbulb, CheckCircle, TrashIcon } from 'lucide-react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFocusEffect, useNavigation } from 'expo-router';
import Markdown from 'react-native-markdown-display';
import AlertDelete from '@/components/AlertDelete';
import AlertLoadingWithState from '@/components/AlertLoadingWithState';

const suggestions = [
  { icon: BookOpen, text: "Explain a concept from my lecture", color: "text-blue-500" },
  { icon: HelpCircle, text: "Quiz me on this material", color: "text-purple-500" },
  { icon: Lightbulb, text: "Help me understand a difficult topic", color: "text-amber-500" },
  { icon: CheckCircle, text: "Summarize key points", color: "text-emerald-500" }
];


const ChatWithTutor = () => {
  const navigation = useNavigation();
  const scrollViewRef = useRef<ScrollView>(null);

  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [conversation, setConversation] = useState<Content[]>([]);
  const [prompt, setPrompt] = useState<string>('');
  const conversationRef = useRef<Content[]>(conversation);
  const [isTutorThinking, setIsTutorThinking] = useState<boolean>(false);

  const [showDeleteConversationModal, setShowDeleteConversationModal] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteProgress, setDeleteProgress] = useState<{ percentage: number, message: string }>({ percentage: 0, message: "" });

  const fetchRecentConversations = async () => {
    if (!db) return;

    const allRows = await getAllConversation(db);
    // console.log("All conversation rows:", allRows);

    const mapped: Content[] = allRows.map((r) => ({
      role: r.role === "model" ? "model" : "user",
      parts: [{ text: r.message }],
    }));

    // console.log("MAPPED Conversation:", mapped);
    conversationRef.current = mapped;
    setConversation(conversationRef.current);
  };

  const deleteConversation = async () => {
    setShowDeleteConversationModal(false);
    setIsDeleting(true);
    setDeleteProgress({ percentage: 40, message: "Preparing.." })
    try {
      if (!db) return;
      setDeleteProgress({ percentage: 80, message: "Deleting.." });
      await deleteConversationTableData(db);
      setDeleteProgress({ percentage: 100, message: "Complete.." });
      conversationRef.current = [];
      setConversation(conversationRef.current);
    } catch (error) {
      console.error(error)
    } finally {
      setIsDeleting(false);
      setDeleteProgress({ percentage: 0, message: "" });
    }

  }

  const askAi = async (query: string) => {
    setIsTutorThinking(true);
    try {
      if (!db) return;
      if (!query.trim()) return;
      setPrompt('');
      const userMessage: Content = { role: "user", parts: [{ text: query }] };
      conversationRef.current = [...conversationRef.current, userMessage];
      setConversation([...conversationRef.current]);

      // --- Save user query to DB
      await postToConversation(db, { role: 'user', message: query });

      // --- 2Get AI response
      const responseText = await getAIResponse(conversationRef.current, query, db);
      const aiMessage: Content = { role: "model", parts: [{ text: responseText }] };

      // --- Update conversation immediately with AI response
      conversationRef.current = [...conversationRef.current, aiMessage];
      setConversation([...conversationRef.current]);

      // --- Save AI response to DB
      await postToConversation(db, { role: 'model', message: responseText });
    } catch (error) {

    } finally {
      setIsTutorThinking(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 300); // Increase delay

    return () => clearTimeout(timer);
  }, [conversation, isTutorThinking]); // Watch entire conversation array, not just length

  useEffect(() => {
    (async () => {
      const database = await getDb();
      setDb(database);
    })();
  }, []);

  useFocusEffect(useCallback(() => {
    fetchRecentConversations();
  }, [db]));


  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button className='bg-transparent items-center justify-center active:bg-transparent' onPress={() => setShowDeleteConversationModal(true)}>
          <TrashIcon size={20} color={'red'} />
        </Button>
      ),
    });
  }, [navigation]);

  return (
    <SafeAreaView className="flex-1 justify-start items-start bg-background px-4 pb-4 pt-0 gap-2" edges={["left", "right", "bottom"]}>
      <AlertDelete open={showDeleteConversationModal} onOpenChange={() => { }} onClose={() => setShowDeleteConversationModal(false)} onDelete={() => deleteConversation()} title='Are you sure?' description={`This with delete all of your current messages and AI tutor's responses.`} continueButtonText='Delete' />
      <AlertLoadingWithState open={isDeleting} onOpenChange={() => { }} currentState={deleteProgress.message} activity="Processing File" progress={deleteProgress.percentage} />
      <KeyboardAvoidingView
        behavior="padding"
        style={{ flex: 1, width: '100%' }}
        keyboardVerticalOffset={100} // Adjust this value based on your header/navigation height
      >
        <ScrollView
          className="min-w-full flex-1"
          ref={scrollViewRef}
        >
          {conversation.length === 0 ? (
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
                      onPress={() => askAi(suggestion.text)}
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
          ) : (
            <>
              {conversationRef.current.map((message, index) => (
                <View
                  key={index}
                  className={`mb-4 flex-row ${message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                >
                  <View
                    className={`max-w-[80%] px-4 py-3 rounded-2xl ${message.role === 'user'
                      ? 'bg-blue-500 rounded-br-sm'
                      : 'bg-gray-100 rounded-bl-sm'
                      }`}
                  >
                    {message.role === 'user' ? (
                      <Text
                        className={`text-base ${message.role === 'user' ? 'text-white' : 'text-gray-900'
                          }`}
                      >
                        {message.parts[0]?.text}
                      </Text>
                    ) : (
                      <Markdown>{message.parts[0]?.text}</Markdown>
                    )}
                  </View>
                </View>
              ))}
              {isTutorThinking && (
                <View className="mb-4 flex-row justify-start">
                  <View className="max-w-[80%] px-4 py-3 rounded-2xl bg-gray-100 rounded-bl-sm">
                    <Text className="text-base text-gray-500 italic">
                      Tutor is thinking…
                    </Text>
                  </View>
                </View>
              )}
            </>
          )}
        </ScrollView>
        <View className="w-full pb-2 gap-2 bg-transparent flex-row">
          <Input className='flex-1 border-gray-400' placeholder='Ask your tutor...' value={prompt} onChangeText={setPrompt} onSubmitEditing={() => askAi(prompt)} />
          <Button className={`bg-blue-500 w-auto items-center justify-center rounded-lg`} disabled={!prompt.trim()} onPress={() => askAi(prompt)}>
            <Text className='text-white'>
              <FontAwesome name="send-o" size={16} />
            </Text>
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default ChatWithTutor