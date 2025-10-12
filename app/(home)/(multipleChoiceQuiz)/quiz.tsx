import React, { useCallback, useEffect, useState } from "react";
import { View, Text, BackHandler } from "react-native";
import { useLocalSearchParams, useFocusEffect, useNavigation, useRouter } from "expo-router";
import AlertDelete from "@/components/AlertDelete";
import { parseQuizToJson } from "@/util/createQuizzes";
import Toast, { Toast as ToastFunc } from 'toastify-react-native'
import LoadingIndicator from "@/components/LoadingIndicator";


export type QuizMultipleChoice = {
  question: string,
  answer: string,
  choices?: string | undefined,
}

const Quiz = () => {
  const { quizString } = useLocalSearchParams();
  const navigation = useNavigation();
  const router = useRouter();

  const [quiz, setQuiz] = useState<QuizMultipleChoice[] | null>(null);
  const [convertingQuiz, setConvertingQuiz] = useState<boolean>(false);

  const convertQuizStringToJSON = async () => {
    setConvertingQuiz(true);
    try {
      ToastFunc.show({
        type: 'info',
        text1: 'Preparing your Quiz!',
        text2: 'Goodluck with the upcoming task!',
        position: 'bottom',
      });
      const JSONQuiz = await parseQuizToJson(quizString.toLocaleString());
      setQuiz(JSONQuiz);
    } catch (error) {
      console.log("Error turning quiz to JSON: ", error);
      router.back()
      ToastFunc.show({
        type: 'error',
        text1: 'Unable to prepare quiz!',
        text2: 'Please try again',
        position: 'bottom',
      });
    } finally {
      setConvertingQuiz(false);
    }
  }

  useFocusEffect(useCallback(() => {
    convertQuizStringToJSON()
  }, []))

  //#region Modal State & Handlers for exiting page
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const openConfirmModal = (action: () => void) => {
    if (showConfirmModal) return;
    setPendingAction(() => action);
    setShowConfirmModal(true);
  };

  const handleConfirmExit = () => {
    setShowConfirmModal(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    } else {
      router.back();
    }
  };

  const handleCancelExit = () => {
    setShowConfirmModal(false);
    setPendingAction(null);
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => true;
      const backSubscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
      const beforeRemoveListener = navigation.addListener("beforeRemove", (e) => {
        e.preventDefault();
        openConfirmModal(() => navigation.dispatch(e.data.action));
      });

      return () => {
        backSubscription.remove();
        beforeRemoveListener();
      };
    }, [navigation, showConfirmModal])
  );
  //#endregion

  if (convertingQuiz) {
    return (
      <LoadingIndicator/>
    )
  }

  return (
    <View className="flex-1 items-center justify-center bg-background px-6">
      <Text className="text-xl font-bold mb-2">Quiz</Text>
      <Text className="text-foreground text-center">
        {quizString || "No quiz data received."}
      </Text>

      <AlertDelete
        open={showConfirmModal}
        onOpenChange={setShowConfirmModal}
        onClose={handleCancelExit}
        onDelete={handleConfirmExit}
        title="Leave quiz?"
        description="Are you sure you want to leave this quiz? Your progress will be lost."
        continueButtonText="Leave"
      />
      <Toast />
    </View>
  );
};

export default Quiz;