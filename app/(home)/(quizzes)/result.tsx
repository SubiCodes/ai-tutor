import { View, Text, ScrollView } from 'react-native';
import React, { useCallback, useState } from 'react';
import { QuizData } from './main';
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from 'react-native-safe-area-context';
import CardQuizResult from '@/components/CardQuizResult';
import CardResultQuestion from '@/components/CardResultQuestion';

const ViewQuizResult = () => {

  const { data } = useLocalSearchParams();

  const [quizData, setQuizData] = useState<QuizData | undefined>();

  useFocusEffect(useCallback(() => {
    if (typeof data === "string") {
      try {
        let result = JSON.parse(data);
        setQuizData(result);
      } catch (error) {
        console.error("Invalid quiz data:", error);
      }
    }
  }, []))

  if (!quizData) {
    return (
      <View>
        <Text>Invalid or missing quiz data.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 justify-start items-start bg-background px-4 pt-4 py-4"
      edges={["left", "right", "bottom"]}
    >
      <ScrollView className="w-full flex-1" showsVerticalScrollIndicator={false}>
        {/* Quiz summary card */}
        <View className="bg-card mb-2 rounded-2xl shadow-sm w-full">
          <CardQuizResult data={quizData} disabled={true} />
        </View>

        {/* Individual question results */}
        {quizData.quiz.map((quiz, index) => (
          <CardResultQuestion key={index} data={quiz} type={quizData.type} index={index}/>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

export default ViewQuizResult