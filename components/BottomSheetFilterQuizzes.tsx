import React, { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import Animated, { SharedValue } from "react-native-reanimated";
import BottomSheet from "./BottomSheet";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type FilterType = {
  type: "All" | "Multiple Choice" | "True or False";
  sortBy: "Latest First" | "Oldest First";
  grade: "All" | "A" | "B" | "C" | "D" | "F";
};

type FilterBottomSheetProps = {
  isOpen: SharedValue<boolean>;
  toggleSheet: () => void;
  filters: FilterType;
  setFilters: React.Dispatch<React.SetStateAction<FilterType>>;
};

export default function BottomSheetFilterQuizzes({
  isOpen,
  toggleSheet,
  filters,
  setFilters,
}: FilterBottomSheetProps) {
  const [tempFilters, setTempFilters] = useState<FilterType>(filters);

  // Sync tempFilters with parent filters when sheet opens
  useEffect(() => {
    setTempFilters(filters);
  }, [filters, isOpen.value]);

  return (
    <BottomSheet isOpen={isOpen} toggleSheet={toggleSheet}>
      <Animated.Text className="text-gray-800 dark:text-gray-200 text-2xl mb-3 font-extrabold">
        Filter Options
      </Animated.Text>

      <View className="flex-1 p-2 flex-col gap-6">
        {/* Quiz Type */}
        <View className="flex-col gap-2">
          <Text className="text-lg font-semibold">Quiz Type</Text>
          <RadioGroup
            value={tempFilters.type}
            onValueChange={(value) =>
              setTempFilters((prev) => ({ ...prev, type: value as FilterType["type"] }))
            }
            className="flex-row flex-wrap gap-3"
          >
            {["All", "Multiple Choice", "True or False"].map((option) => (
              <View
                key={option}
                className="flex-row items-center justify-center mr-3"
              >
                <RadioGroupItem value={option} id={`type-${option}`} className="border-gray-600" />
                <Text className="text-base ml-2">{option}</Text>
              </View>
            ))}
          </RadioGroup>
        </View>

        {/* Grade */}
        <View className="flex-col gap-2">
          <Text className="text-lg font-semibold">Grade</Text>
          <RadioGroup
            value={tempFilters.grade}
            onValueChange={(value) =>
              setTempFilters((prev) => ({ ...prev, grade: value as FilterType["grade"] }))
            }
            className="flex-row flex-wrap gap-3"
          >
            {["All", "A", "B", "C", "D", "F"].map((grade) => (
              <View
                key={grade}
                className="flex-row items-center justify-center mr-3"
              >
                <RadioGroupItem value={grade} id={`grade-${grade}`} className="border-gray-600" />
                <Text className="text-base ml-2">{grade}</Text>
              </View>
            ))}
          </RadioGroup>
        </View>

        {/* Sort By */}
        <View className="flex-col gap-2">
          <Text className="text-lg font-semibold">Sort by Date</Text>
          <RadioGroup
            value={tempFilters.sortBy}
            onValueChange={(value) =>
              setTempFilters((prev) => ({ ...prev, sortBy: value as FilterType["sortBy"] }))
            }
            className="flex-row flex-wrap gap-3"
          >
            {["Latest First", "Oldest First"].map((sort) => (
              <View
                key={sort}
                className="flex-row items-center justify-center mr-3"
              >
                <RadioGroupItem value={sort} id={`sort-${sort}`} className="border-gray-600" />
                <Text className="text-base ml-2">{sort}</Text>
              </View>
            ))}
          </RadioGroup>
        </View>

        {/* Apply Button */}
        <Pressable
          onPress={() => {
            setFilters(tempFilters);
            toggleSheet();
          }}
          className="bg-blue-500 p-3 rounded-xl mt-5"
        >
          <Text className="text-white text-center font-medium">Apply Filters</Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}
