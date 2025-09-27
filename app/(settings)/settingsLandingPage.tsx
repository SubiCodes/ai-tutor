import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { SafeAreaView } from "react-native-safe-area-context";
import React from 'react'
import { useRouter } from 'expo-router'

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useColorScheme } from 'nativewind';

const SettingsLandingPage = () => {

  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDarkColorScheme = colorScheme === "dark";

  return (
    <SafeAreaView className='flex-1 justify-start items-start bg-background px-6'>
      <ScrollView className='w-full'>

        <View className={`flex-col gap-4 mb-6 border-b ${isDarkColorScheme ? 'border-gray-600' : 'border-gray-200'}`}>
          <View className='flex flex-col'>
            <Text className='text-xl text-foreground font-bold'>Personalization</Text>
            <Text className='text-lg text-gray-500'>Personalize your experience</Text>
          </View>
          <View className='flex-col gap-2'>
            <TouchableOpacity className='flex flex-row gap-2 items-center' onPress={() => router.push('/(settings)/changeName')}>
              <Text className='text-foreground'><AntDesign name="idcard" size={20} /></Text>
              <Text className='text-lg text-foreground'>Change Username</Text>
            </TouchableOpacity>
            <TouchableOpacity className='flex flex-row gap-2 items-center' onPress={() => router.push('/(settings)/changeApproach')}>
              <Text className='text-foreground'><AntDesign name="message" size={20} /></Text>
              <Text className='text-lg text-foreground'>Change Tutor Approach</Text>
            </TouchableOpacity>
            <TouchableOpacity className='flex flex-row gap-2 items-center mb-4' onPress={() => router.push('/(settings)/changeAssist')}>
              <Text className='text-foreground'><MaterialCommunityIcons name="google-assistant" size={20} /></Text>
              <Text className='text-lg text-foreground'>Change Tutor Assist Mode</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className={`flex-col gap-4 mb-6 border-b ${isDarkColorScheme ? 'border-gray-600' : 'border-gray-200'}`}>
          <View className='flex flex-col'>
            <Text className='text-xl text-foreground font-bold'>Themes</Text>
            <Text className='text-lg text-gray-500'>Change theme for better experience</Text>
          </View>
          <View className='flex-col gap-2'>
            <TouchableOpacity className='flex flex-row gap-2 items-center mb-4' onPress={() => router.push('/(settings)/changeThemes')}>
              <Text className='text-foreground'><MaterialCommunityIcons name="theme-light-dark" size={20}/></Text>
              <Text className='text-lg text-foreground'>Switch Themes</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  )
}

export default SettingsLandingPage