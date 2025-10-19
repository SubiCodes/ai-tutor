import React, { useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import {
    useAudioRecorder,
    useAudioRecorderState,
    AudioModule,
    setAudioModeAsync,
    RecordingPresets
} from 'expo-audio';

export default function audioCall() {
    // Enable metering in the options
    const options = {
        ...RecordingPresets.HIGH_QUALITY,
        isMeteringEnabled: true,
    };
    const recorder = useAudioRecorder(options);
    const recorderState = useAudioRecorderState(recorder);

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

    // Start recording
    const startRecording = async () => {
        await recorder.prepareToRecordAsync();
        recorder.record();
    };

    // Stop recording
    const stopRecording = async () => {
        await recorder.stop();
        Alert.alert('Recording stopped', `File saved at: ${recorder.uri}`);
    };

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
