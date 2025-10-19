import React, { useEffect, useRef } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import {
    useAudioRecorder,
    useAudioRecorderState,
    AudioModule,
    setAudioModeAsync,
    RecordingPresets
} from 'expo-audio';

export default function AudioCall() {
    const options = {
        ...RecordingPresets.HIGH_QUALITY,
        isMeteringEnabled: true,
    };
    const recorder = useAudioRecorder(options);
    const recorderState = useAudioRecorderState(recorder);

    // Silence detection state
    const silenceTimer = useRef(null);
    const silenceStartTime = useRef(null);

    // Request permissions and set audio mode
    useEffect(() => {
        (async () => {
            const status = await AudioModule.requestRecordingPermissionsAsync();
            if (!status.granted) {
                Alert.alert('Permission to access microphone was denied');
            }
            setAudioModeAsync({
                playsInSilentMode: true,
                allowsRecording: true,
            });
        })();
    },);

    const startRecording = async () => {
        await recorder.prepareToRecordAsync();
        recorder.record();
    };

    const stopRecording = async () => {
        await recorder.stop();
        Alert.alert('Recording stopped', `File saved at: ${recorder.uri}`);
    };

    useEffect(() => {
        if (recorderState.isRecording && typeof recorderState.metering === 'number') {
            const SILENCE_THRESHOLD = -20; // adjust if needed
            const SILENCE_DURATION = 1000; // 1 second

            const now = Date.now();

            if (recorderState.metering < SILENCE_THRESHOLD) {
                // Start tracking silence if not already
                if (!silenceStartTime.current) {
                    silenceStartTime.current = now;
                } else if (now - silenceStartTime.current >= SILENCE_DURATION) {
                    stopRecording();
                    silenceStartTime.current = null;
                }
            } else {
                // Reset when sound resumes
                silenceStartTime.current = null;
            }
        } else {
            // Reset when not recording
            silenceStartTime.current = null;
        }
    }, [recorderState.metering, recorderState.isRecording]);

    return (
        <View style={styles.container}>
            <Button
                title={recorderState.isRecording ? 'Stop Recording' : 'Start Recording'}
                onPress={recorderState.isRecording ? stopRecording : startRecording}
            />
            <Text style={styles.text}>
                {recorderState.isRecording
                    ? `Audio Level: ${recorderState.metering?.toFixed(2) ?? 'N/A'}`
                    : 'Not recording'}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#ecf0f1',
        padding: 10,
    },
    text: {
        marginTop: 20,
        fontSize: 18,
        textAlign: 'center',
    },
});
