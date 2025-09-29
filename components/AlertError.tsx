import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Text } from '@/components/ui/text';
import { AlertCircleIcon, CheckCircle2Icon, Terminal } from 'lucide-react-native';
import { View } from 'react-native';

interface AlertErrorProps {
    title: string;
    description: string;
    errorList?: string[];
    visible?: boolean;
}

const AlertError = ({ title, description, errorList, visible }: AlertErrorProps) => {
    if (!visible) return null;
    return (
        <Alert variant="destructive" icon={AlertCircleIcon}>
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription>{description}</AlertDescription>
            <View role="list" className="ml-0.5 pb-2 pl-6">
                {errorList?.map((error, index) => (
                    <Text role="listitem" className="text-sm">
                        <Text className="web:pr-2">•</Text> {error}
                    </Text>
                ))}
            </View>
        </Alert>
    )
}

export default AlertError