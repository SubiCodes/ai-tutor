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

interface AlertOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  onDelete: () => void;
  title: string;
  description: string;
  continueButtonText: string
}

const AlertDelete = ({ open, onOpenChange, onClose, onDelete, title, description, continueButtonText }: AlertOverlayProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <View className="flex-row w-full items-end justify-end gap-2 mt-2">
            <AlertDialogCancel onPress={() => onClose()} className=''>
              <Text>Cancel</Text>
            </AlertDialogCancel>
            <AlertDialogAction onPress={() => onDelete()} className='bg-red-400 active:bg-red-500 '>
              <Text className='bg-transparent' onPress={() => onDelete()}>{continueButtonText}</Text>
            </AlertDialogAction>
          </View>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default AlertDelete