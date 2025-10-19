import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image } from 'react-native';
import { useAudioRecorderUtil } from '@/util/audioCallUtils';
import LiveAudioWaveform from '@/components/LiveAudioWaveForm';
import { Button } from '@/components/ui/button';
import { PhoneCall } from 'lucide-react-native';
import transcribeAudioWithGemini from '@/util/speechToText';

import * as SQLite from 'expo-sqlite';
import { getAIResponse } from '@/util/conversationalAI';
import { getDb } from '@/db/db';

interface Content {
    role: 'user' | 'model';
    parts: { text: string }[];
}

export default function AudioCall() {
    const { startRecording, recorderState, recordingPhase, stopRecording } = useAudioRecorderUtil();

    const [callState, setCallState] = useState<string>(recordingPhase);
    const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);

    const isInCallRef = useRef(false);
    const [isInCall, setIsInCall] = useState(false);

    const [conversationHistory, setConversationHistory] = useState<Content[]>([]);

    useEffect(() => {
        if (isInCall) {
            setCallState(recordingPhase);
        }
    }, [recordingPhase, isInCall]);

    const handleStartCall = async () => {
        isInCallRef.current = true;
        setIsInCall(true);
        setCallState(recordingPhase);
        try {
            while (isInCallRef.current) {
                setCallState(recordingPhase);
                const uri = await startRecording();
                if (!isInCallRef.current) break;

                const text = await transcribeAudioWithGemini(uri);
                console.log('User said:', text);

                setCallState('Thinking...');
                const aiResponse = await getAIResponse(conversationHistory, text, db);
                console.log('AI responded:', aiResponse);

                setConversationHistory(prev => [
                    ...prev,
                    { role: 'user', parts: [{ text }] },
                    { role: 'model', parts: [{ text: aiResponse }] },
                ]);

                setCallState('playing response...');
            }
        } catch (error) {
            console.error('Error in call:', error);
        } finally {
            await stopRecording();
            setIsInCall(false);
            isInCallRef.current = false;
        }
    };

    const handleEndCall = async () => {
        isInCallRef.current = false;
        await stopRecording();
        setIsInCall(false);
        setConversationHistory([]);
    };

    useEffect(() => {
        (async () => {
            const database = await getDb();
            setDb(database);
        })();
    }, []);

    return (
        <View className='flex-1 items-center justify-center pb-24'>
            <View className='w-full flex-col items-center justify-center mb-4'>
                <View className="w-44 h-44 border-2 border-blue-400 items-center justify-center rounded-full overflow-hidden mb-4">
                    <Image
                        source={require('@/assets/images/ai-icon/ai-icon.png')}
                        className="w-full h-full"
                        resizeMode="cover"
                    />
                </View>
                <View className='w-44 max-w-44 items-center justify-center'>
                    {isInCall ? <LiveAudioWaveform metering={recorderState?.metering} /> : null}
                </View>
                <View className='w-full items-center justify-center mt-2'>
                    <Text className='text-md text-muted-foreground italic'>
                        {isInCall ? callState : 'Start a call with your tutor'}
                    </Text>
                </View>
            </View>
            {!isInCall ? (
                <View className='absolute bottom-44'>
                    <Button
                        className='w-16 h-16 rounded-full bg-green-400 active:bg-green-400 flex items-center justify-center'
                        onPress={handleStartCall}
                    >
                        <PhoneCall color='white' size={20} />
                    </Button>
                </View>
            ) : (
                <View className='absolute bottom-44'>
                    <Button
                        className='w-16 h-16 rounded-full bg-red-400 active:bg-red-400 flex items-center justify-center'
                        onPress={handleEndCall}
                    >
                        <PhoneCall color='white' size={20} />
                    </Button>
                </View>
            )}
        </View>
    );
}