import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Text } from '@/components/ui/text';
import { AlertCircleIcon, CheckCircle2Icon, Terminal } from 'lucide-react-native';
import { Modal, Pressable, View } from 'react-native';

interface AlertErrorProps {
    title: string;
    description: string;
    errorList?: string[];
    visible?: boolean;
    onClose?: () => void;
}

const AlertError = ({ title, description, errorList, visible, onClose }: AlertErrorProps) => {
    if (!visible) return null;
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable className="flex-1 bg-black/60 justify-center items-center" onPress={onClose}>

                <Alert variant="destructive" icon={AlertCircleIcon} className='max-w-[90%] bg-background/95'>
                    <AlertTitle className='bg-transparent'>{title}</AlertTitle>
                    <AlertDescription className='bg-transparent'>{description}</AlertDescription>
                    <View role="list" className="ml-0.5 pb-2 pl-6 bg-transparent">
                        {errorList?.map((error, index) => (
                            <Text role="listitem" className="text-sm bg-transparent" key={index}>
                                <Text className="web:pr-2">•</Text> {error}
                            </Text>
                        ))}
                    </View>
                </Alert>

            </Pressable>
        </Modal>
    )
}

export default AlertError