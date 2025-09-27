import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { View, Text } from 'react-native'
import React, { useCallback, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button } from '@/components/ui/button'
import Toast, { Toast as ToastFunc } from 'toastify-react-native'
import { useFocusEffect } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import LoadingIndicator from '@/components/LoadingIndicator';

const ChangeApproach = () => {

  const [fetchingApproach, setFetchingApproach] = useState<boolean>(true);
  const [approach, setApproach] = useState<string>('');
  const [savingChanges, setSavingChanges] = useState<boolean>(false);

  const handleSaveChanges = async () => {
    setSavingChanges(true);
    await AsyncStorage.setItem('approach', approach);
    setSavingChanges(false);
    ToastFunc.show({
      type: 'success',
      text1: 'Successfully updated Approach!',
      text2: 'Your AI tutor will approach you in this manner.',
      position: 'bottom',
      visibilityTime: 4000,
      autoHide: true,
    })
  }

  const onLabelPress = (value: string) => () => {
    setApproach(value);
  }

  const onValueChange = (value: string) => {
    setApproach(value);
  }

  const getCurrentApproach = async () => {
    const userNameFromStorage = await AsyncStorage.getItem('approach');
    setApproach(userNameFromStorage || '');
    setFetchingApproach(false);
  };

  useFocusEffect(
    useCallback(() => {
      getCurrentApproach();
    }, [])
  );

  if (fetchingApproach) {
    return <LoadingIndicator />
  };


  return (
    <SafeAreaView className='flex-1 justify-start items-start bg-background px-6'>
      {/* Header */}
      <View className='w-full flex flex-col gap-2'>
        <Text className='text-lg text-foreground font-bold'>Change Approach</Text>
        <Text className='text-md text-gray-500'>Your AI tutor will be teaching you in the manner you've chosen.</Text>
      </View>

      {/* Seperator */}
      <View className='min-h-8' />

      {/* Actions */}
      <View className='w-full flex flex-col gap-4'>
        <RadioGroup value={approach} onValueChange={onValueChange}>
          <View className="flex flex-row items-center gap-3">
            <RadioGroupItem value="friendly" id="r1" />
            <Label htmlFor="r1" onPress={onLabelPress('friendly')} className='text-base'>
              Friendly & Casual
            </Label>
          </View>
          <View className="flex flex-row items-center gap-3">
            <RadioGroupItem value="professional" id="r2" />
            <Label htmlFor="r2" onPress={onLabelPress('professional')} className='text-base'>
              Professional & Direct
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

export default ChangeApproach