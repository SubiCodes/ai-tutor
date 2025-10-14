import React from "react";
import { View, TouchableOpacity, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  useDerivedValue,
  SharedValue,
} from "react-native-reanimated";

type BottomSheetProps = {
  isOpen: SharedValue<boolean>;
  toggleSheet: () => void;
  duration?: number;
  children: React.ReactNode;
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function BottomSheet({
  isOpen,
  toggleSheet,
  duration = 400,
  children,
}: BottomSheetProps) {
  const height = useSharedValue(0);

  // Animation progress (0 = open, 1 = closed)
  const progress = useDerivedValue(() =>
    withTiming(isOpen.value ? 0 : 1, { duration })
  );

  // Slide up animation
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: progress.value * height.value }],
  }));

  // Dimmed background animation
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isOpen.value ? 1 : 0, { duration }),
    zIndex: isOpen.value ? 999 : -1,
  }));

  return (
    <>
      {/* 🔹 Backdrop (press to close) */}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            width: SCREEN_WIDTH,
            height: SCREEN_HEIGHT,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "flex-end",
          },
          backdropStyle,
        ]}
        // ✅ ensures backdrop always intercepts touches when open
        pointerEvents={isOpen.value ? "auto" : "none"}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={{ flex: 1 }}
          onPress={toggleSheet}
        />
      </Animated.View>

      {/* 🔹 Bottom Sheet (full width) */}
      <Animated.View
        onLayout={(e) => {
          height.value = e.nativeEvent.layout.height;
        }}
        style={[
          sheetStyle,
          {
            position: "absolute",
            bottom: 0,
            left: 0,
            width: SCREEN_WIDTH,
            zIndex: 1000,
            elevation: 1000,
          },
        ]}
        className="rounded-t-2xl bg-white dark:bg-neutral-900 p-5 shadow-2xl"
      >
        <View className="w-full">{children}</View>
      </Animated.View>
    </>
  );
}
