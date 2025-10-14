import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, BackHandler, TouchableOpacity, Pressable } from "react-native";
import { useLocalSearchParams, useFocusEffect, useNavigation, useRouter } from "expo-router";
import AlertDelete from "@/components/AlertDelete";
import { parseQuizToJson } from "@/util/createQuizzes";
import Toast, { Toast as ToastFunc } from 'toastify-react-native'
import LoadingIndicator from "@/components/LoadingIndicator";
import { SafeAreaView } from "react-native-safe-area-context";
import Carousel from "pinar";
import { Button } from "@/components/ui/button";
import AlertLoadingWithState from "@/components/AlertLoadingWithState";
import AlertQuizResult from "@/components/AlertQuizResult";
import { getCurrentFileFromAsyncStorage } from "@/util/getTheCurrentFileFromAsyncStorage";

export type QuizMultipleChoice = {
  question: string,
  answer: string,
  choices?: string | undefined,
}

export type QuizMultipleChoiceWithAnswers = {
  question: string,
  answer: string,
  choices?: string | undefined,
  userAnswer?: string
}

const Quiz = () => {
  const { quizString } = useLocalSearchParams();
  const navigation = useNavigation();
  const router = useRouter();
  const [fileName, setFileName] = useState<string>('File name');

  //#region Converting Quiz String into JSON
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
      setQuizWithAnswer(JSONQuiz);
      const currentFile = await getCurrentFileFromAsyncStorage();
      setFileName(currentFile.name);
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
  }, []));

  //#endregion

  //#region Functions for Answering Quiz
  const [quizWithAnswer, setQuizWithAnswer] = useState<QuizMultipleChoiceWithAnswers[] | null>(null);
  const [checkedArray, setCheckArray] = useState<boolean[]>(Array(quiz?.length).fill(true));
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [checkingState, setCheckingState] = useState<{ state: string, percent: number }>({ state: '', percent: 0 });
  const [showResults, setShowResults] = useState<boolean>(false);

  //Passing of answer
  const handleUserAnswer = (index: number, answer: string) => {
    setQuizWithAnswer((prev) => {
      if (!prev) return prev;
      const updated = [...prev];
      updated[index] = { ...updated[index], userAnswer: answer };
      return updated;
    });
  };

  //Checking of quiz
  const onSubmit = async () => {
    setIsChecking(true);
    try {
      setCheckingState({ state: "Checking if all are answered", percent: 20 });
      const hasUnanswered = quizWithAnswer?.some((q) => !q.userAnswer?.trim());
      if (hasUnanswered) {
        ToastFunc.show({
          type: 'error',
          text1: 'Questions missing answers',
          text2: 'Please answer each question!',
          position: 'top',
        });
        return;
      }

      setCheckingState({ state: "Checking answers", percent: 60 });
      quizWithAnswer?.forEach((question, index) => {
        if (question.userAnswer !== question.answer) {
          setCheckArray(prev => {
            const updatedArray = [...prev];
            updatedArray[index] = false;
            return updatedArray;
          });
        }
      });

      setIsChecked(true);
      setShowResults(true);
    } catch (error) {

    } finally {
      setIsChecking(false);
    }
  };

  //Prepare score container
  useEffect(() => {
    if (quiz?.length) {
      setCheckArray(Array(quiz.length).fill(true));
    }
  }, [quiz]);

  //#endregion



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
        <Carousel
          showsControls={false}
        >
          {quiz?.map((item, index) => {
            const choiceArray =
              typeof item.choices === "string"
                ? item.choices.split("**").map((choice) => choice.trim()).filter((choice) => choice !== "")
                : [];

            return (
              <View
                key={index}
                className={`w-full h-full p-6 items-start justify-center bg-card rounded-2xl shadow-sm`}
              >
                <View
                  className={`flex-col w-full bg-background p-4 rounded-lg ${isChecked && !checkedArray[index] ? "border border-red-500" : "border border-gray-100"} ${isChecked && checkedArray[index] ? "border border-green-500" : "border border-gray-100"}`}
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.12,
                    shadowRadius: 12,
                    elevation: 8,
                  }}
                >
                  <Text className="text-lg font-bold mb-6 text-center text-foreground">{item.question}</Text>

                  {choiceArray.length > 0 ? (
                    <View className="flex-col w-full gap-3">
                      {choiceArray.map((choice, i) => {
                        const letter = choice.trim().charAt(0).toLowerCase();
                        const userAnswer = quizWithAnswer?.[index]?.userAnswer;
                        const isSelected = userAnswer === letter;
                        const isCorrect = letter === item.answer;

                        // Conditional classes
                        let choiceClasses = "w-full p-3 rounded-xl border items-start ";
                        let textClasses = "text-base ";

                        if (isChecked) {
                          if (isSelected && !isCorrect) {
                            // User selected wrong answer
                            choiceClasses += "border-2 border-red-500 bg-background/80";
                            textClasses += "text-red-500 font-bold";
                          } else if (isCorrect) {
                            // Correct answer
                            choiceClasses += "bg-green-200 border border-green-400";
                            textClasses += "text-green-800 font-bold";
                          } else {
                            // Neutral unselected choices
                            choiceClasses += "border border-border bg-background/80";
                            textClasses += "text-foreground";
                          }
                        } else {
                          // Quiz not yet checked
                          choiceClasses += isSelected ? "border border-blue-400 bg-background/80" : "border border-border bg-background/80";
                          textClasses += isSelected ? "text-blue-400 font-bold" : "text-foreground";
                        }

                        return (
                          <Pressable
                            key={i}
                            className={choiceClasses}
                            onPress={() => handleUserAnswer(index, letter)}
                            disabled={isChecked}
                          >
                            <Text className={textClasses}>
                              {choice}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  ) : (
                    <Text className="italic text-muted">No choices provided</Text>
                  )}

                  <View className="w-full items-center justify-center mt-4">
                    <Text className="text-muted-foreground">{`Question ${index + 1} of ${quiz.length}`}</Text>
                  </View>
                </View>

                <View className="w-full flex-col">
                  <View className="flex-1 min-h-full"></View>
                  {!isChecked && quiz.length === index + 1 && (
                    <Button className="bg-blue-400 active:bg-blue-500" onPress={onSubmit}>
                      <Text className="bg-transparent active:bg-transparent text-white font-bold" onPress={onSubmit}>
                        Submit Answers
                      </Text>
                    </Button>
                  )}
                  {isChecked && (
                    <View className="flex-row gap-2">
                      <Button className="bg-muted active:bg-muted/80 w-[48%]" onPress={() => setShowResults(true)}>
                        <Text className="bg-transparent text-muted-foreground active:bg-transparent font-bold" onPress={() => setShowResults(true)}>
                          Show Results
                        </Text>
                      </Button>
                      <Button className="bg-blue-400 active:bg-blue-500 w-[48%]" onPress={() => router.back()}>
                        <Text className="bg-transparent active:bg-transparent text-white font-bold" onPress={() => router.back()}>
                          Continue
                        </Text>
                      </Button>
                    </View>

                  )}
                </View>
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
        description={isChecked ? "Are you done reviewing your quiz results?" : "Are you sure you want to leave this quiz? Your progress will be lost."}
        continueButtonText="Leave"
      />
      <AlertLoadingWithState
        open={isChecking}
        currentState={checkingState.state}
        activity="Checking Quiz"
        progress={checkingState.percent}
      />
      <AlertQuizResult
        open={showResults}
        onClose={() => { setShowResults(false) }}
        fileName={fileName}
        totalItems={checkedArray.length}
        totalCorrectAnswers={checkedArray.filter(Boolean).length}
      />
      <Toast />
    </SafeAreaView>
  );
};

export default Quiz;