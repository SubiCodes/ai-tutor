// utils/audioRecorderUtil.js
import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import {
  useAudioRecorder,
  useAudioRecorderState,
  AudioModule,
  setAudioModeAsync,
  RecordingPresets,
} from 'expo-audio';

export function useAudioRecorderUtil() {
  const options = {
    ...RecordingPresets.HIGH_QUALITY,
    isMeteringEnabled: true,
  };
  const recorder = useAudioRecorder(options);
  const recorderState = useAudioRecorderState(recorder);

  const silenceStartTime = useRef(null);

  // Permissions and audio mode
  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert('Permission to access microphone was denied');
        return;
      }
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
    })();
  }, []);

  const startRecording = async () => {
    await recorder.prepareToRecordAsync();
    recorder.record();
  };

  const stopRecording = async () => {
    await recorder.stop();
    return recorder.uri; // returns audio file path
  };

  // Silence detection
  useEffect(() => {
    if (recorderState.isRecording && typeof recorderState.metering === 'number') {
      const SILENCE_THRESHOLD = -20; // adjust as needed
      const SILENCE_DURATION = 1500; // 1.5 second
      const now = Date.now();

      if (recorderState.metering < SILENCE_THRESHOLD) {
        if (!silenceStartTime.current) {
          silenceStartTime.current = now;
        } else if (now - silenceStartTime.current >= SILENCE_DURATION) {
          (async () => {
            const uri = await stopRecording();
            Alert.alert('Recording stopped', `File saved at: ${uri}`);
          })();
          silenceStartTime.current = null;
        }
      } else {
        silenceStartTime.current = null; // reset when sound resumes
      }
    } else {
      silenceStartTime.current = null;
    }
  }, [recorderState.metering, recorderState.isRecording]);

  return { startRecording, stopRecording, recorderState };
}
