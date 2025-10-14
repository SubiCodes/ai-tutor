import React, { useEffect } from "react";
import { View, TouchableWithoutFeedback, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  useDerivedValue,
  runOnJS,SharedValue
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

  // Animate sheet position
  const progress = useDerivedValue(() =>
    withTiming(isOpen.value ? 0 : 1, { duration })
  );

  // Sheet slide animation
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: progress.value * height.value }],
  }));

  // Backdrop fade animation
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isOpen.value ? 1 : 0, { duration }),
    zIndex: isOpen.value ? 1000 : -1,
  }));

  // ✅ Prevent backdrop clicks when closed
  const pointerEvents = isOpen.value ? "auto" : "none";

  return (
    <>
      {/* ✅ Fullscreen backdrop */}
      <Animated.View
        pointerEvents={pointerEvents}
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
      >
        {/* ✅ TouchableWithoutFeedback ensures clicks go through */}
        <TouchableWithoutFeedback
          onPress={() => {
            runOnJS(toggleSheet)(); // safely toggle from UI thread
          }}
        >
          <View style={{ flex: 1 }} />
        </TouchableWithoutFeedback>
      </Animated.View>

      {/* ✅ Bottom sheet */}
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
            zIndex: 1001,
            elevation: 1001,
          },
        ]}
        className="rounded-t-2xl bg-white dark:bg-neutral-900 p-5 shadow-2xl"
      >
        <View className="w-full">{children}</View>
      </Animated.View>
    </>
  );
}
