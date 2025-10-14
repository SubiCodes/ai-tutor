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
import { Text } from '@/components/ui/text';
import { TouchableOpacity, View } from 'react-native';
import { BookOpenText, BadgeCheck, BadgeAlert, Percent, X, ScrollText } from 'lucide-react-native';

interface AlertOverlayProps {
    open: boolean;
    onClose: () => void;
    fileName: string;
    totalItems: number;
    totalCorrectAnswers: number;
}

const AlertQuizResult = ({ open, onClose, fileName, totalItems, totalCorrectAnswers }: AlertOverlayProps) => {

    const percentage = (totalCorrectAnswers / totalItems) * 100;
    const isPassed = percentage >= 70; // example passing rule
    const bgColor = isPassed ? 'bg-green-200' : 'bg-red-200';
    const iconColor = isPassed ? '#15803d' : '#ef4444';
    const text = isPassed ? 'Passed' : 'Failed';
    const remark = 'Remarks';

    return (
        <AlertDialog open={open} onOpenChange={() => { }} >
            <AlertDialogContent className='w-[90%] min-w-[90%] pb-4'>
                <AlertDialogHeader>
                    <View className='w-full flex-row mb-2 items-center justify-center'>
                        <Text className='text-lg font-bold flex-1'>
                            Quiz Result
                        </Text>
                    </View>
                </AlertDialogHeader>
                <View className='w-full flex-row items-center justify-between'>

                    <View className='flex-col gap-2 items-center'>
                        <View className='w-14 h-14 bg-purple-300 rounded-md items-center justify-center'>
                            <BookOpenText size={24} color={"#a855f7"} />
                        </View>
                        <View className='flex-col items-center justify-center'>
                            <Text className='text-base font-bold'>{`${totalCorrectAnswers}/${totalItems}`}</Text>
                            <Text className='text-xs font-light'>Correct</Text>
                        </View>
                    </View>

                    <View className='flex-col gap-2 items-center'>
                        <View className={`w-14 h-14 ${bgColor} rounded-md items-center justify-center flex-row`}>
                            {/* Display one icon for pass/fail */}
                            {isPassed ? (
                                <BadgeCheck size={24} color={iconColor} />
                            ) : (
                                <BadgeAlert size={24} color={iconColor} />
                            )}
                        </View>
                        <View className='flex-col items-center justify-center'>
                            <Text className='text-base font-bold'>{text}</Text>
                            <Text className='text-xs font-light'>{remark}</Text>
                        </View>
                    </View>

                    <View className='flex-col gap-2 items-center'>
                        <View className='w-14 h-14 bg-orange-200 rounded-md items-center justify-center'>
                            <Percent size={24} color={"#f97316"} />
                        </View>
                        <View className='flex-col items-center justify-center'>
                            <Text className='text-base font-bold'>{percentage}</Text>
                            <Text className='text-xs font-light'>Grade</Text>
                        </View>
                    </View>

                </View>
                <View className="w-full p-4 border rounded-lg border-gray-200 bg-gray-10 flex-row items-center justify-between">
                    <ScrollText size={24} color={"#3B82F6"} />
                    <Text
                        className="ml-2 text-gray-800 flex-1"
                        numberOfLines={1}
                        ellipsizeMode="middle"
                    >
                        {fileName}
                    </Text>
                </View>
                <View className='min-w-full items-center justify-center'>
                    <TouchableOpacity className='border-t border-gray-200 px-12 pt-2 mt-4' onPress={() => onClose()}>
                        <Text className='text-md text-gray-400'>Close</Text>
                    </TouchableOpacity>
                </View>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default AlertQuizResult