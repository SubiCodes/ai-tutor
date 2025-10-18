import React, { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import Animated, { SharedValue } from "react-native-reanimated";
import BottomSheet from "./BottomSheet";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "./ui/button";
import { Trash } from "lucide-react-native";

type FilterBottomSheetProps = {
    isOpen: SharedValue<boolean>;
    toggleSheet: () => void;
    id: number
};

export default function BottomSheetDeleteQuiz({ isOpen, toggleSheet, id }: FilterBottomSheetProps) {

    return (
        <BottomSheet isOpen={isOpen} toggleSheet={toggleSheet}>
            <Animated.Text className="text-gray-800 dark:text-gray-200 text-2xl mb-3 font-extrabold">
                Delete Quiz Result
            </Animated.Text>

            <View className="flex-1 p-2 flex-col gap-6">
                <Button className="bg-transparent active:bg-transparent">
                    <Trash size={24}/>
                    <Text className="text-xl text-red-400">Delete Quiz</Text>
                </Button>
            </View>
        </BottomSheet>
    );
}
