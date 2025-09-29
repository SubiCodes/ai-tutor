import { View, Text } from 'react-native'
import React from 'react'
import { Button } from '@/components/ui/button'
import { getAIResponse } from '@/util/conversationalAI'
import { embedUserQuery } from '@/util/embedUserQuery'

const ChatWithTutor = () => {

  const test = async () => {
    const embeddedQuery = await embedUserQuery("Hello, is this working?");
    console.log(embeddedQuery);
    const reply = await getAIResponse([], "Hello, is this working?");
    console.log(reply);
  }

  return (
    <View>
      <Button onPress={() => test()}><Text>TEST</Text></Button>
    </View>
  )
}

export default ChatWithTutor