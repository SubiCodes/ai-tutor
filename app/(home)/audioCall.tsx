import React, { useEffect, useRef } from 'react';
import { View, Text, Button, StyleSheet, Alert, Image } from 'react-native';
import { useAudioRecorderUtil } from '@/util/audioCallUtils';
import LiveAudioWaveform from '@/components/LiveAudioWaveForm';

export default function AudioCall() {

    const { startRecording, stopRecording, recorderState } = useAudioRecorderUtil();

    return (
        <View className='flex-1 items-center justify-center pb-24'>
            {/* Icon and State Holder */}
            <View className='w-full flex-col items-center justify-center mb-4'>
                {/* AI Icon */}
                <View className="w-28 h-28 border-2 border-blue-400 items-center justify-center rounded-full overflow-hidden mb-2">
                    <Image
                        source={require('@/assets/images/ai-icon/ai-icon.png')}
                        className="w-full h-full"
                        resizeMode="cover"
                    />
                </View>
                <View className='w-44 max-w-44 items-center justify-center'>
                    {/* //Waveform Visualization Placeholder */}
                    <LiveAudioWaveform metering={recorderState?.metering} />
                </View>
            </View>
            <Button
                title={recorderState.isRecording ? 'Stop Recording' : 'Start Recording'}
                onPress={recorderState.isRecording ? stopRecording : startRecording}
            />
            <Text>
                {recorderState.isRecording
                    ? `Audio Level: ${recorderState.metering?.toFixed(2) ?? 'N/A'}`
                    : 'Not recording'}
            </Text>
        </View>
    );
}

