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
import { Progress } from '@/components/ui/progress';
import { View } from 'react-native';

interface AlertOverlayProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentState: string | null;
    activity: string;
    progress: number
}

const AlertLoadingWithState = ({ open, onOpenChange, currentState, activity, progress }: AlertOverlayProps) => {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className='w-[90%] min-w-[90%]'>
                <AlertDialogHeader>
                    <AlertDialogTitle>{activity}</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogDescription >
                    <View className="my-4 flex flex-col items-center gap-3 w-full">
                        <Text className="text-center">
                            {currentState || "Processing..."}
                        </Text>
                        <Progress value={progress} className="w-full h-2" />
                        <Text className="text-sm text-muted-foreground">
                            {progress}% complete
                        </Text>
                    </View>
                </AlertDialogDescription>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default AlertLoadingWithState