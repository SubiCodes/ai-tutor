import React from "react";
import { View, Text, Pressable } from "react-native";
import Animated, { SharedValue } from "react-native-reanimated";
import BottomSheet from "./BottomSheet";
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

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
      <Animated.Text className="text-gray-800 dark:text-gray-200 text-2xl mb-3 font-extrabold">
        Filter Options
      </Animated.Text>

      {/* Main Content */}
      <View className="flex-1 p-2 flex-col gap-4">

        {/* Sort by type */}
        <View className="flex-col gap-2">
          <Text className="text-lg font-semibold">
            Quiz Type
          </Text>
          <View className="w-full flex-row flex-wrap">
            <RadioGroup value="20" onValueChange={() => console.log("CHANGED")} className="flex-row">
              <View className="flex-row items-center justify-center">
                <RadioGroupItem value="default" id="r1" className="border-gray-600"/>
                <Text className="text-base ml-2">All</Text>
              </View>
              <View className="flex-row items-center justify-center">
                <RadioGroupItem value="default" id="r1" className="border-gray-600"/>
                <Text className="text-base ml-2">Multiple Choice</Text>
              </View>
              <View className="flex-row items-center justify-center">
                <RadioGroupItem value="default" id="r1" className="border-gray-600"/>
                <Text className="text-base ml-2">True or False</Text>
              </View>
            </RadioGroup>
          </View>
        </View>

        {/* Sort by type */}
        <View className="flex-col gap-2">
          <Text className="text-lg font-semibold">
            Grade
          </Text>
          <View className="w-full flex-row flex-wrap">
            <RadioGroup value="20" onValueChange={() => console.log("CHANGED")} className="flex-row">
              <View className="flex-row items-center justify-center">
                <RadioGroupItem value="default" id="r1" className="border-gray-600"/>
                <Text className="text-base ml-2">A</Text>
              </View>
              <View className="flex-row items-center justify-center">
                <RadioGroupItem value="default" id="r1" className="border-gray-600"/>
                <Text className="text-base ml-2">B</Text>
              </View>
              <View className="flex-row items-center justify-center">
                <RadioGroupItem value="default" id="r1" className="border-gray-600"/>
                <Text className="text-base ml-2">C</Text>
              </View>
              <View className="flex-row items-center justify-center">
                <RadioGroupItem value="default" id="r1" className="border-gray-600"/>
                <Text className="text-base ml-2">D</Text>
              </View>
              <View className="flex-row items-center justify-center">
                <RadioGroupItem value="default" id="r1" className="border-gray-600"/>
                <Text className="text-base ml-2">F</Text>
              </View>
            </RadioGroup>
          </View>
        </View>

        {/* Sort by Date */}
        <View className="flex-col gap-2">
          <Text className="text-lg font-semibold">
            Sort by Date
          </Text>
          <View className="w-full flex-row flex-wrap">
            <RadioGroup value="20" onValueChange={() => console.log("CHANGED")} className="flex-row">
              <View className="flex-row items-center justify-center">
                <RadioGroupItem value="default" id="r1" className="border-gray-600"/>
                <Text className="text-base ml-2">Latest first</Text>
              </View>
              <View className="flex-row items-center justify-center">
                <RadioGroupItem value="default" id="r1" className="border-gray-600"/>
                <Text className="text-base ml-2">Oldest first</Text>
              </View>
            </RadioGroup>
          </View>

        </View>

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
