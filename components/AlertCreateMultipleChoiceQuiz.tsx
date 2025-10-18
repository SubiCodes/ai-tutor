import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { ActivityIndicator, View } from 'react-native';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Sparkles, ScrollText } from 'lucide-react-native'
import * as SQLite from 'expo-sqlite';
import { useState } from 'react';
import { createQuizzesString } from '@/util/createQuizzes';
import { Router } from 'expo-router';
import Toast, { Toast as ToastFunc } from 'toastify-react-native'

interface AlertOverlayProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onClose: () => void;
    fileName: string;
    db: SQLite.SQLiteDatabase
    router: Router
}

const AlertCreateMultipleChoiceQuiz = ({ open, onOpenChange, onClose, fileName, db, router }: AlertOverlayProps) => {
    const [amount, setAmount] = useState<string>('5 questions');
    const [type, setType] = useState<"Multiple Choice" | "True or False">('Multiple Choice')
    const [creatingQuiz, setCreatinguiz] = useState<boolean>(false);

    const onSubmit = async () => {
        setCreatinguiz(true);
        try {
            ToastFunc.show({
                type: 'info',
                text1: 'Generating Quiz!',
                text2: 'This may take a while.',
                position: 'bottom',
            })
            let total = 0;
            if (amount === '5 questions') { total = 5 };
            if (amount === '10 questions') { total = 10 };
            if (amount === '15 questions') { total = 15 };
            const quizString = await createQuizzesString(db, total, type);
            if (quizString.trim()) {
                router.push({
                    pathname: '/(home)/(multipleChoiceQuiz)/quiz',
                    params: { quizString, type },
                });
            };
        } catch (error) {
            console.log("Error Creating Quiz: ", error);
        } finally {
            setCreatinguiz(false)
        }
    }

    function onLabelPressAmount(amount: string) {
        return () => {
            setAmount(amount);
        };
    }

    function onValueChangeAmount(amount: string) {
        setAmount(amount);
    }

    function onLabelPressType(type: "Multiple Choice" | "True or False") {
        return () => {
            setType(type);
        };
    }

    function onValueChangeType(type: "Multiple Choice" | "True or False") {
        setType(type);
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className='items-center justify-center gap-2'>
                        <Text className="text-blue-500 font-bold text-xl mr-2">Generate Quiz</Text>
                        <Sparkles size={20} color={"#3B82F6"} />
                    </AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogDescription>
                    <View className="items-center justify-center">
                        <View className="bg-background w-80 min-h-[96px] py-4 px-4 border rounded-xl border-gray-200 dark:border-gray-700 flex-col">
                            <View className="w-full flex-col gap-2 mb-4">
                                <Text className="text-foreground/80 font-semibold text-base">Lesson</Text>
                                <View className="w-full p-4 border rounded-lg border-gray-300 bg-gray-50 flex-row items-center justify-between">
                                    <ScrollText size={24} color={"#3B82F6"} />
                                    <Text
                                        className="ml-2 text-gray-800 flex-1"
                                        numberOfLines={1}
                                        ellipsizeMode="middle"
                                    >
                                        {fileName}
                                    </Text>
                                </View>
                            </View>

                            <View className="w-full flex-col gap-4 mb-4">
                                <Text className="text-foreground/80 font-semibold text-base">Number of Questions</Text>
                                <RadioGroup value={amount} onValueChange={onValueChangeAmount} className='flex-row flex-wrap'>
                                    <View className="flex flex-row items-center gap-3">
                                        <RadioGroupItem value="5 questions" id="r1" />
                                        <Label htmlFor="r1" onPress={onLabelPressAmount('5 questions')} className='font-normal'>
                                            5 items
                                        </Label>
                                    </View>
                                    <View className="flex flex-row items-center gap-3">
                                        <RadioGroupItem value="10 questions" id="r2" />
                                        <Label htmlFor="r2" onPress={onLabelPressAmount('10 questions')} className='font-normal'>
                                            10 items
                                        </Label>
                                    </View>
                                    <View className="flex flex-row items-center gap-3">
                                        <RadioGroupItem value="15 questions" id="r3" />
                                        <Label htmlFor="r3" onPress={onLabelPressAmount('15 questions')} className='font-normal'>
                                            15 items
                                        </Label>
                                    </View>
                                </RadioGroup>
                            </View>

                            <View className="w-full flex-col gap-4 mb-4">
                                <Text className="text-foreground/80 font-semibold text-base">Type of Quiz</Text>
                                <RadioGroup value={type} onValueChange={onValueChangeType} className='flex-row flex-wrap'>
                                    <View className="flex flex-row items-center gap-3">
                                        <RadioGroupItem value="Multiple Choice" id="r1" />
                                        <Label htmlFor="r1" onPress={onLabelPressType('Multiple Choice')} className='font-normal'>
                                            Multiple Choice
                                        </Label>
                                    </View>
                                    <View className="flex flex-row items-center gap-3">
                                        <RadioGroupItem value="True or False" id="r2" />
                                        <Label htmlFor="r2" onPress={onLabelPressType('True or False')} className='font-normal'>
                                            True or False
                                        </Label>
                                    </View>
                                </RadioGroup>
                            </View>

                        </View>
                    </View>
                </AlertDialogDescription>
                <View className='w-full'>
                    <View className="flex-row w-full items-end justify-end gap-2 mt-2">
                        <Button onPress={() => onClose()} className='bg-muted' disabled={creatingQuiz}>
                            <Text className='text-black'>Cancel</Text>
                        </Button>
                        <Button onPress={() => onSubmit()} className='bg-blue-500 active:bg-blue-600 items-center justify-center' disabled={creatingQuiz}>
                            {creatingQuiz && (
                                <ActivityIndicator size={12} color={'white'} />
                            )}
                            <Text className='bg-transparent active:bg-transparent' onPress={() => onSubmit()}>Start Quiz</Text>
                        </Button>
                    </View>
                </View>
            </AlertDialogContent>
            <Toast />
        </AlertDialog>
    )
}

export default AlertCreateMultipleChoiceQuiz