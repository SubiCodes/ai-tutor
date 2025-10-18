import { View, Text } from 'react-native';
import React from 'react';
import { QuizData } from './main';
import { useLocalSearchParams } from "expo-router";

const ViewQuizResult = () => {

  const { data } = useLocalSearchParams();

  let quizData: QuizData | null = null;

  if (typeof data === "string") {
    try {
      quizData = JSON.parse(data);
    } catch (error) {
      console.error("Invalid quiz data:", error);
    }
  }

  if (!quizData) {
    return (
      <View>
        <Text>Invalid or missing quiz data.</Text>
      </View>
    );
  }
  
  return (
    <View>
      <Text>ViewQuizResult</Text>
    </View>
  )
}

export default ViewQuizResult