import { View, Text } from 'react-native';
import React from 'react';
import { Button } from '@/components/ui/button';
import { getAIResponse } from '@/util/conversationalAI';

const ChatWithTutor = () => {

  const test = async (query: string) => {
    const reply = await getAIResponse([], query);
    console.log(reply);
  }

  return (
    <View>
      <Button onPress={() => test("What is it that you do?")}><Text>TEST</Text></Button>
    </View>
  )
}

export default ChatWithTutor