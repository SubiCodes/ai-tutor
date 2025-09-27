import { View, Text, Keyboard } from 'react-native'
import React, { useCallback, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useFocusEffect } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import LoadingIndicator from '@/components/LoadingIndicator'
import Toast, { Toast as ToastFunc } from 'toastify-react-native'

const ChangeName = () => {

  const [fetchingName, setFetchingName] = useState<boolean>(true);
  const [userName, setUserName] = useState<string>('');
  const [savingChanges, setSavingChanges] = useState<boolean>(false);

  const handleSaveChanges = async () => {
    Keyboard.dismiss();
    setSavingChanges(true);
    await AsyncStorage.setItem('name', userName);
    setSavingChanges(false);
    ToastFunc.show({
      type: 'success',
      text1: 'Successfully updated name!',
      text2: 'Your AI tutor will now call you by this name.',
      position: 'bottom',
      visibilityTime: 4000,
      autoHide: true,
    })
  };

  const getCurrentUserName = async () => {
    const userNameFromStorage = await AsyncStorage.getItem('name');
    setUserName(userNameFromStorage || '');
    setFetchingName(false);
  };

  useFocusEffect(
    useCallback(() => {
      getCurrentUserName();
    }, [])
  );

  if (fetchingName) {
    return <LoadingIndicator />
  };

  return (
    <SafeAreaView className='flex-1 justify-start items-start bg-background px-6'>
      {/* Header */}
      <View className='w-full flex flex-col gap-2'>
        <Text className='text-lg text-foreground font-bold'>Change Username</Text>
        <Text className='text-md text-gray-500'>Your AI tutor will call you by the name you have provided.</Text>
      </View>

      {/* Seperator */}
      <View className='min-h-8' />

      {/* Actions */}
      <View className='w-full flex flex-col gap-4'>
        <Input placeholder='Enter your name...' value={userName} onChangeText={(e) => setUserName(e)} onEndEditing={handleSaveChanges} />
        <Button className='w-full justify-center items-center bg-blue-500' onPress={handleSaveChanges} disabled={savingChanges || userName.trim().length === 0}>
          <Text className='text-white font-bold'>Save Changes</Text>
        </Button>
      </View>
      <Toast />
    </SafeAreaView>
  )
}

export default ChangeName