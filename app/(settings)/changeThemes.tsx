import { View, Text } from 'react-native'
import React, { useCallback, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast, { Toast as ToastFunc } from 'toastify-react-native'
import { useFocusEffect } from 'expo-router';
import LoadingIndicator from '@/components/LoadingIndicator';
import { useColorScheme } from 'nativewind';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const ChangeThemes = () => {

    const { setColorScheme, colorScheme } = useColorScheme();

    const [fetchingTheme, setFetchingTheme] = useState<boolean>(true);
    const [theme, setTheme] = useState<string>(colorScheme || 'system');
    const [savingChanges, setSavingChanges] = useState<boolean>(false);

    const handleSaveChanges = async () => {
        setSavingChanges(true);
        await AsyncStorage.setItem('theme', theme);
        setColorScheme(theme as "light" | "dark" | "system");
        setSavingChanges(false);
        ToastFunc.show({
            type: 'success',
            text1: 'Successfully updated theme!',
            text2: `Enjoy your use of Offline AI Tutor.`,
            position: 'bottom',
            visibilityTime: 4000,
            autoHide: true,
        })
    }

    const onLabelPress = (value: string) => () => {
        setTheme(value);
    }

    const onValueChange = (value: string) => {
        setTheme(value);
    }

    const getCurrentTheme = async () => {
        const userNameFromStorage = await AsyncStorage.getItem('theme');
        setTheme(userNameFromStorage || 'system');
        setFetchingTheme(false);
    };

    useFocusEffect(
        useCallback(() => {
            getCurrentTheme();
        }, [])
    );

    if (fetchingTheme) {
        return <LoadingIndicator />
    };
    return (
        <SafeAreaView className='flex-1 justify-start items-start bg-background px-6'>
            {/* Header */}
            <View className='w-full flex flex-col gap-2'>
                <Text className='text-lg text-foreground font-bold'>Change Assist Mode</Text>
                <Text className='text-md text-gray-500'>Your AI tutor will be giving you either explanations or hints.</Text>
            </View>

            {/* Seperator */}
            <View className='min-h-8' />

            {/* Actions */}
            <View className='w-full flex flex-col gap-4'>
                <RadioGroup value={theme} onValueChange={onValueChange}>
                    <View className="flex flex-row items-center gap-3">
                        <RadioGroupItem value="light" id="r1" />
                        <Label htmlFor="r1" onPress={onLabelPress('light')} className='text-base'>
                            Light
                        </Label>
                    </View>
                    <View className="flex flex-row items-center gap-3">
                        <RadioGroupItem value="dark" id="r2" />
                        <Label htmlFor="r2" onPress={onLabelPress('dark')} className='text-base'>
                            Dark
                        </Label>
                    </View>
                    <View className="flex flex-row items-center gap-3">
                        <RadioGroupItem value="system" id="r3" />
                        <Label htmlFor="r2" onPress={onLabelPress('system')} className='text-base'>
                            System
                        </Label>
                    </View>
                </RadioGroup>
                <Button className='w-full justify-center items-center bg-blue-500' onPress={handleSaveChanges} disabled={savingChanges}>
                    <Text className='text-white font-bold'>Save Changes</Text>
                </Button>
            </View>

            <Toast />
        </SafeAreaView>
    )
}

export default ChangeThemes