import { View, Text } from 'react-native'
import React from 'react'
import { Button } from '@/components/ui/button'
import { getAIResponse } from '@/util/conversationalAI'
import { embedUserQuery } from '@/util/embedUserQuery'

const ChatWithTutor = () => {

  const test = async (query: string) => {
    const embeddedQuery = await embedUserQuery(query);
    console.log(embeddedQuery);
    const reply = await getAIResponse([], query);
    console.log(reply);
  }

  return (
    <View>
      <Button onPress={() => test("Hello")}><Text>TEST</Text></Button>
    </View>
  )
}

export default ChatWithTutor