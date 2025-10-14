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
    onClose: () => void;
    currentState: string | null;
    activity: string;
    progress: number
}

const AlertQuizResult = ({ open, onClose }: AlertOverlayProps) => {
    return (
        <AlertDialog open={open} onOpenChange={() => {  }} >
            <AlertDialogContent className='w-[90%] min-w-[90%]'>
                <AlertDialogDescription >
                    <View className="my-4 flex flex-col items-center gap-3 w-full">
                    
                    </View>
                </AlertDialogDescription>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default AlertQuizResult