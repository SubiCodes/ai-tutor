import React, { useRef, useState } from 'react';
import { View, Text, Image } from 'react-native';
import { useAudioRecorderUtil } from '@/util/audioCallUtils';
import LiveAudioWaveform from '@/components/LiveAudioWaveForm';
import { Button } from '@/components/ui/button';
import { PhoneCall } from 'lucide-react-native';

export default function AudioCall() {
    const { startRecording, recorderState, recordingPhase, stopRecording } = useAudioRecorderUtil();
    const isInCallRef = useRef(false);
    const [isInCall, setIsInCall] = useState(false);

    const handleStartCall = async () => {
        isInCallRef.current = true;
        setIsInCall(true);
        try {
            while (isInCallRef.current) {
                const uri = await startRecording();
                if (!isInCallRef.current) break;

                // const text = await sendToSTT(uri);
                // const aiResponse = await sendToAI(text);
                // await playTTS(aiResponse);
            }
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
    };

    return (
        <View className='flex-1 items-center justify-center pb-24'>
            {/* Icon and State Holder */}
            <View className='w-full flex-col items-center justify-center mb-4'>
                <View className="w-44 h-44 border-2 border-blue-400 items-center justify-center rounded-full overflow-hidden mb-4">
                    <Image
                        source={require('@/assets/images/ai-icon/ai-icon.png')}
                        className="w-full h-full"
                        resizeMode="cover"
                    />
                </View>

                {/* Waveform */}
                <View className='w-44 max-w-44 items-center justify-center'>
                    {isInCall ? <LiveAudioWaveform metering={recorderState?.metering} /> : null}
                </View>

                {/* Recording phase text */}
                <View className='w-full items-center justify-center mt-2'>
                    <Text className='text-md text-muted-foreground italic'>
                        {isInCall ? recordingPhase : 'Start a call with your tutor'}
                    </Text>
                </View>
            </View>

            {/* Call button - positioned absolutely */}
            {!isInCall ? (
                <View className='absolute bottom-48'>
                    <Button
                        className='w-16 h-16 rounded-full bg-green-400 active:bg-green-400 flex items-center justify-center'
                        onPress={handleStartCall}
                    >
                        <PhoneCall color='white' size={20} />
                    </Button>
                </View>
            ) : (
                <View className='absolute bottom-48'>
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
