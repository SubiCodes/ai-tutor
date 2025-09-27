import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Text } from "@/components/ui/text";
import { Pressable, View } from "react-native";
import { Button } from "./ui/button";
import { Input } from "@/components/ui/input";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AlertOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFinish?: (data: PersonalizationData) => void; 
}

type PersonalizationData = {
  name: string;
  approach: "friendly" | "professional" | "";
  assist: "hints" | "explanations" | "";
};

const lessons = [
  {
    key: "name",
    title: "Who are you?",
    description: "What would you like your AI tutor to call you?",
  },
  {
    key: "approach",
    title: "What approach do you prefer?",
    description:
      "Would you like your AI tutor to be more formal or casual in its responses?",
  },
  {
    key: "assist",
    title: "How would you like the tutor assist you?",
    description:
      "Would you like your AI tutor to provide hints before answers or just explanations?",
  },
];

export default function AlertPersonalization({
  open,
  onOpenChange,
  onFinish,
}: AlertOverlayProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const [answers, setAnswers] = useState<PersonalizationData>({
    name: "",
    approach: "",
    assist: "",
  });

    const goToNext = async() => {
        if (currentIndex !== lessons.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        } else {
            try {
                await AsyncStorage.setItem('name', answers.name);
                await AsyncStorage.setItem('approach', answers.approach);
                await AsyncStorage.setItem('assist', answers.assist);
            } catch (error) {
                console.error("Failed to save personalization:", error);
            }
        onFinish?.(answers);
        onOpenChange(false);
        }
    };

  const goToPrevious = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  const currentLesson = lessons[currentIndex];

  //Check if current field is filled
  const isCurrentFilled =
    (currentLesson.key === "name" && answers.name.trim() !== "") ||
    (currentLesson.key === "approach" && answers.approach !== "") ||
    (currentLesson.key === "assist" && answers.assist !== "");

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange} className="min-w-xl">
      <AlertDialogContent className="max-w-[90%] min-w-[94%]">
        <AlertDialogHeader>
          <View className="flex-row items-center justify-between">
            <AlertDialogTitle className="flex-1">
              Personalize your AI Tutor
            </AlertDialogTitle>
          </View>
        </AlertDialogHeader>

        {/* Question */}
        <View className="flex-col gap-1 mt-4">
          <Text className="font-bold text-lg">{currentLesson.title}</Text>
          <AlertDialogDescription>
            {currentLesson.description}
          </AlertDialogDescription>
        </View>

        {/* Input / Options depending on step */}
        <View className="mt-4">
          {currentLesson.key === "name" && (
            <Input
              placeholder="Enter your name"
              value={answers.name}
              onChangeText={(text) =>
                setAnswers((prev) => ({ ...prev, name: text }))
              }
            />
          )}

          {currentLesson.key === "approach" && (
            <View className="flex-col gap-2">
              <Button
                variant={answers.approach === "friendly" ? "default" : "outline"}
                onPress={() =>
                  setAnswers((prev) => ({ ...prev, approach: "friendly" }))
                }
                className="w-full"
              >
                <Text>Friendly & Casual</Text>
              </Button>
              <Button
                variant={
                  answers.approach === "professional" ? "default" : "outline"
                }
                onPress={() =>
                  setAnswers((prev) => ({ ...prev, approach: "professional" }))
                }
                className="w-full"
              >
                <Text>Professional & Direct</Text>
              </Button>
            </View>
          )}

          {currentLesson.key === "assist" && (
            <View className="flex-col gap-2">
              <Button
                variant={answers.assist === "hints" ? "default" : "outline"}
                onPress={() =>
                  setAnswers((prev) => ({ ...prev, assist: "hints" }))
                }
                className="w-full"
              >
                <Text>Hints before answers</Text>
              </Button>
              <Button
                variant={
                  answers.assist === "explanations" ? "default" : "outline"
                }
                onPress={() =>
                  setAnswers((prev) => ({ ...prev, assist: "explanations" }))
                }
                className="w-full"
              >
                <Text>Just explanations</Text>
              </Button>
            </View>
          )}
        </View>

        {/* Progress */}
        <View className="flex-row items-center justify-center gap-2 mt-2">
          <Text className="text-sm text-gray-500">
            {currentIndex + 1} of {lessons.length}
          </Text>
        </View>

        {/* Navigation */}
        <AlertDialogFooter className="flex-row gap-2">
          {currentIndex > 0 && (
            <Pressable
              onPress={goToPrevious}
              className="flex-1 bg-gray-200 rounded-md py-3 items-center"
            >
              <Text className="text-gray-700 font-medium">Previous</Text>
            </Pressable>
          )}

          <Pressable
            onPress={goToNext}
            disabled={!isCurrentFilled}
            className={`flex-1 rounded-md py-3 items-center ${
              isCurrentFilled ? "bg-blue-500" : "bg-gray-400"
            }`}
          >
            <Text className="text-white font-medium">
              {currentIndex === lessons.length - 1 ? "Finish" : "Next"}
            </Text>
          </Pressable>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}