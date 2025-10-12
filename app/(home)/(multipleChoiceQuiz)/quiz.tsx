import { View, Text } from 'react-native'
import React from 'react'
import { useLocalSearchParams } from 'expo-router';

const Quiz = () => {
  const { quizString } = useLocalSearchParams();
  return (
    <View>
      <Text>{quizString}</Text>
    </View>
  )
}

export default Quiz