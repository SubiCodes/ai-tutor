import { View, Text } from "react-native";
import React from "react";

export type QuizQuestion = {
  question: string;
  answer: string;
  choices: string;
  userAnswer: string;
};

interface Props {
  data: QuizQuestion;
  type: string; // e.g., "Multiple Choice" or "True or False"
  index: number; // Add index prop
}

const CardResultQuestion = ({ data, type, index }: Props) => {
  const { question, answer, choices, userAnswer } = data;

  // Split choices depending on quiz type
  const choiceArray =
    type.toLowerCase().includes("true")
      ? ["True", "False"]
      : choices
          .split("**") // in your sample data, choices are separated by '**'
          .map((c) => c.trim())
          .filter(Boolean);

  return (
    <View
      className="flex-col w-full bg-background p-4 rounded-lg border border-gray-100 mb-3"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 8,
      }}
    >
      {/* Question Number + Text */}
      <View className="flex-row items-start mb-6">
        <Text className="text-lg font-bold text-foreground mr-2">{index + 1}.</Text>
        <Text className="text-lg font-bold flex-shrink text-foreground">{question}</Text>
      </View>

      {/* Choices */}
      <View className="flex-col w-full gap-3">
        {choiceArray.map((choice, i) => {
          // Extract first letter for multiple choice (a,b,c,d)
          const letter = type.toLowerCase().includes("true")
            ? choice.toLowerCase().charAt(0) // "true" or "false" → "t"/"f"
            : choice.trim().charAt(0).toLowerCase();

          const isUserAnswer =
            userAnswer?.toLowerCase() === letter ||
            userAnswer?.toLowerCase() === choice.toLowerCase();

          const isCorrect =
            answer?.toLowerCase() === letter ||
            answer?.toLowerCase() === choice.toLowerCase();

          // Style logic
          let choiceClasses = "w-full p-3 rounded-xl border items-start ";
          let textClasses = "text-base ";

          if (isCorrect) {
            choiceClasses += "bg-green-200 border border-green-400";
            textClasses += "text-green-800 font-bold";
          } else if (isUserAnswer && !isCorrect) {
            choiceClasses += "bg-red-100 border border-red-400";
            textClasses += "text-red-600 font-semibold";
          } else {
            choiceClasses += "border border-border bg-background/80";
            textClasses += "text-foreground";
          }

          return (
            <View key={i} className={choiceClasses}>
              <Text className={textClasses}>{choice}</Text>
            </View>
          );
        })}
      </View>

      {/* Correct answer display */}
      <View className="mt-4">
        <Text className="text-xs text-gray-400 italic">
          Correct answer:{" "}
          {type.toLowerCase().includes("true")
            ? answer === "t"
              ? "True"
              : "False"
            : answer.toUpperCase()}
        </Text>
      </View>
    </View>
  );
};

export default CardResultQuestion;
