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
import { View } from 'react-native';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Sparkles, ScrollText } from 'lucide-react-native'
import * as SQLite from 'expo-sqlite';
import { useState } from 'react';
import { createQuizzesString } from '@/util/createQuizzes';

interface AlertOverlayProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onClose: () => void;
    fileName: string;
    type: string;
    db: SQLite.SQLiteDatabase
}

const AlertCreateMultipleChoiceQuiz = ({ open, onOpenChange, onClose, fileName, type, db }: AlertOverlayProps) => {
    const [amount, setAmount] = useState<string>('5 questions');

    const onSubmit = async () => {
        let total = 0;
        if (amount  === '5 questions') { total = 5 }; 
        if (amount  === '10 questions') { total = 10 }; 
        if (amount  === '15 questions') { total = 15 }; 
        const quizString = await createQuizzesString(db, total, type);
        console.log("QuizString result:", quizString || "<empty>");
    }

    function onLabelPress(amount: string) {
        return () => {
            setAmount(amount);
        };
    }

    function onValueChange(amount: string) {
        setAmount(amount);
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
                                <RadioGroup value={amount} onValueChange={onValueChange} className='flex-row flex-wrap'>
                                    <View className="flex flex-row items-center gap-3">
                                        <RadioGroupItem value="5 questions" id="r1" />
                                        <Label htmlFor="r1" onPress={onLabelPress('5 questions')} className='font-normal'>
                                            5 items
                                        </Label>
                                    </View>
                                    <View className="flex flex-row items-center gap-3">
                                        <RadioGroupItem value="10 questions" id="r2" />
                                        <Label htmlFor="r2" onPress={onLabelPress('10 questions')} className='font-normal'>
                                            10 items
                                        </Label>
                                    </View>
                                    <View className="flex flex-row items-center gap-3">
                                        <RadioGroupItem value="15 questions" id="r3" />
                                        <Label htmlFor="r3" onPress={onLabelPress('15 questions')} className='font-normal'>
                                            15 items
                                        </Label>
                                    </View>
                                </RadioGroup>
                            </View>

                        </View>
                    </View>
                </AlertDialogDescription>
                <AlertDialogFooter>
                    <View className="flex-row w-full items-end justify-end gap-2 mt-2">
                        <AlertDialogCancel onPress={() => onClose()} className=''>
                            <Text>Cancel</Text>
                        </AlertDialogCancel>
                        <AlertDialogAction onPress={() => onSubmit()} className='bg-blue-500 active:bg-blue-600 '>
                            <Text className='bg-transparent'>Start Quiz</Text>
                        </AlertDialogAction>
                    </View>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default AlertCreateMultipleChoiceQuiz