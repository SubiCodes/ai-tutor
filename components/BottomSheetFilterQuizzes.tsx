import React from "react";
import { View, Text, Pressable } from "react-native";
import Animated, { SharedValue } from "react-native-reanimated";
import BottomSheet from "./BottomSheet";

type FilterBottomSheetProps = {
  isOpen: SharedValue<boolean>;
  toggleSheet: () => void;
};

export default function BottomSheetFilterQuizzes({
  isOpen,
  toggleSheet,
}: FilterBottomSheetProps) {
  return (
    <BottomSheet isOpen={isOpen} toggleSheet={toggleSheet}>
      <Animated.Text className="text-gray-800 dark:text-gray-200 text-base mb-3">
        Filter Options
      </Animated.Text>

      <View className="space-y-3">
        <Pressable className="bg-neutral-100 dark:bg-neutral-800 p-3 rounded-xl">
          <Text className="text-black dark:text-white">Newest</Text>
        </Pressable>

        <Pressable className="bg-neutral-100 dark:bg-neutral-800 p-3 rounded-xl">
          <Text className="text-black dark:text-white">Most Popular</Text>
        </Pressable>

        <Pressable className="bg-neutral-100 dark:bg-neutral-800 p-3 rounded-xl">
          <Text className="text-black dark:text-white">By Category</Text>
        </Pressable>
      </View>

      <Pressable
        onPress={toggleSheet}
        className="bg-blue-500 p-3 rounded-xl mt-5"
      >
        <Text className="text-white text-center font-medium">Apply Filters</Text>
      </Pressable>
    </BottomSheet>
  );
}
