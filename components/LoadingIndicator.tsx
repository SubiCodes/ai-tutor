import { View, Text, ActivityIndicator } from 'react-native'
import React from 'react'

const LoadingIndicator = () => {
  return (
    <View className='w-full h-full justify-center items-center'>
      <ActivityIndicator size="large" color="#3B82F6" />
    </View>
  )
}

export default LoadingIndicator