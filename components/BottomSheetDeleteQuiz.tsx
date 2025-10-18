import React, { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import Animated, { SharedValue } from "react-native-reanimated";
import BottomSheet from "./BottomSheet";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "./ui/button";
import { Trash } from "lucide-react-native";
import { deleteQuizData } from "@/db/quizzesFunctions";
import * as SQLite from 'expo-sqlite';
import Toast, { Toast as ToastFunc } from 'toastify-react-native'

type FilterBottomSheetProps = {
    isOpen: SharedValue<boolean>;
    toggleSheet: () => void;
    onDelete: () => void
};

export default function BottomSheetDeleteQuiz({ isOpen, toggleSheet, onDelete }: FilterBottomSheetProps) {


    return (
        <BottomSheet isOpen={isOpen} toggleSheet={toggleSheet}>
            {/* Header */}
            <View className="items-center mb-6">
                <Animated.Text className="text-gray-900 dark:text-gray-100 text-2xl font-extrabold">
                    Delete Quiz Result
                </Animated.Text>
                <Text className="text-gray-500 dark:text-gray-400 text-sm mt-1 text-center">
                    This action cannot be undone. Are you sure you want to delete this result?
                </Text>
            </View>

            {/* Action Buttons */}
            <View className="flex-col gap-3">
                {/* Delete button */}
                <Button
                    className="bg-red-500 active:bg-red-600 flex-row items-center justify-center rounded-xl shadow-sm"
                    onPress={() => {
                        onDelete()
                        toggleSheet();
                    }}
                >
                    <Trash size={22} color="#fff" />
                    <Text className="text-white text-lg font-semibold">
                        Delete Quiz
                    </Text>
                </Button>

                {/* Cancel button */}
                <Button
                    className="bg-gray-100 dark:bg-gray-800 flex-row items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700"
                    onPress={toggleSheet}
                >
                    <Text className="text-gray-700 dark:text-gray-300 text-lg font-semibold">
                        Cancel
                    </Text>
                </Button>
            </View>
            <Toast />
        </BottomSheet>
    );
}
