import React, { useEffect } from "react";
import { View, Text, Alert, BackHandler } from "react-native";
import { useLocalSearchParams, useFocusEffect, useNavigation } from "expo-router";

const Quiz = () => {
  const { quizString } = useLocalSearchParams();
  const navigation = useNavigation();

  const confirmExit = (onConfirm: () => void) => {
    Alert.alert(
      "Leave quiz?",
      "Are you sure you want to leave this quiz? Your progress will be lost.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Leave", style: "destructive", onPress: onConfirm },
      ]
    );
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        confirmExit(() => navigation.goBack());
        return true;
      };
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );
      return () => subscription.remove();
    }, [navigation])
  );

  useEffect(() => {
    const beforeRemoveListener = navigation.addListener("beforeRemove", (e) => {
      e.preventDefault();
      confirmExit(() => navigation.dispatch(e.data.action));
    });

    return beforeRemoveListener;
  }, [navigation]);

  return (
    <View className="flex-1 bg-background px-6">
      <Text className="text-xl font-bold mb-2">Quiz</Text>
      <Text className="text-foreground">
        {quizString || "No quiz data received."}
      </Text>
    </View>
  );
};

export default Quiz;
