import React, { useCallback, useEffect, useState } from "react";
import { View, Text, BackHandler } from "react-native";
import { useLocalSearchParams, useFocusEffect, useNavigation, useRouter } from "expo-router";
import AlertDelete from "@/components/AlertDelete";
import { parseQuizToJson } from "@/util/createQuizzes";
import Toast, { Toast as ToastFunc } from 'toastify-react-native'
import LoadingIndicator from "@/components/LoadingIndicator";
import { SafeAreaView } from "react-native-safe-area-context";
import Carousel from "pinar";

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
      <LoadingIndicator />
    )
  }

  return (
    <SafeAreaView className="flex-1 justify-start items-start bg-background px-0 pb-4 pt-0 gap-2" edges={["left", "right", "bottom"]}>

      <View className='flex-1 w-full items-center justify-center'>
        <Carousel showsControls={false}>
          {quiz?.map((item, index) => {
            const choiceArray =
              typeof item.choices === "string"
                ? item.choices.split("\n").filter((line) => line.trim() !== "")
                : [];

            return (
              <View
                key={index}
                className="w-full p-6 items-start justify-center bg-card rounded-2xl shadow-sm"
              >
                <Text className="text-lg font-bold mb-4">
                  {index + 1}. {item.question}
                </Text>

                {choiceArray.length > 0 ? (
                  <View className="w-full gap-2">
                    {choiceArray.map((choice, i) => (
                      <Text key={i} className="text-base text-foreground">
                        {choice}
                      </Text>
                    ))}
                  </View>
                ) : (
                  <Text className="italic text-muted">No choices provided</Text>
                )}
              </View>
            );
          })}
        </Carousel>
      </View>

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
    </SafeAreaView>
  );
};

export default Quiz;