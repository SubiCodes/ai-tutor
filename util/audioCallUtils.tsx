import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import {
  useAudioRecorder,
  useAudioRecorderState,
  AudioModule,
  setAudioModeAsync,
  RecordingPresets,
} from 'expo-audio';
import * as Speech from 'expo-speech';

type RecordingPhase = '' | 'Waiting for you to speak...' | 'Listening...' | 'Thinking...';

export function useAudioRecorderUtil() {
  const options = {
    ...RecordingPresets.HIGH_QUALITY,
    isMeteringEnabled: true,
  };

  const recorder = useAudioRecorder(options);
  const recorderState = useAudioRecorderState(recorder);

  const [recordingPhase, setRecordingPhase] = useState<RecordingPhase>('');
  const silenceStartTime = useRef<number | null>(null);
  const hasSpoken = useRef(false);
  const stopPromiseRef = useRef<((uri: string) => void) | null>(null);
  const isStoppingRef = useRef(false);

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

  const startRecording = async (): Promise<string> => {
    await recorder.prepareToRecordAsync();
    recorder.record();

    hasSpoken.current = false;
    isStoppingRef.current = false;
    setRecordingPhase('Waiting for you to speak...');

    return new Promise((resolve) => {
      stopPromiseRef.current = resolve;
    });
  };

  const stopRecording = async (): Promise<string> => {
    if (isStoppingRef.current) {
      return recorder.uri;
    }
    
    isStoppingRef.current = true;

    if (recorderState.isRecording) {
      await recorder.stop();
    }
    
    setRecordingPhase('');
    return recorder.uri;
  };

  const speakAsync = (text: string): Promise<void> => {
    return new Promise((resolve) => {
      Speech.speak(text, {
        onDone: () => {
          resolve();
        },
        onError: (error) => {
          console.error('Speech error:', error);
          resolve();
        }
      });
    });
  };

  useEffect(() => {
    if (!recorderState.isRecording || typeof recorderState.metering !== 'number' || isStoppingRef.current) {
      silenceStartTime.current = null;
      return;
    }

    const SILENCE_THRESHOLD = -20;
    const SILENCE_DURATION = 1500;
    const now = Date.now();

    const isSpeaking = recorderState.metering > SILENCE_THRESHOLD;
    if (!hasSpoken.current && isSpeaking) {
      hasSpoken.current = true;
      setRecordingPhase('Listening...');
    }
    if (!hasSpoken.current) return;
    if (!isSpeaking) {
      if (!silenceStartTime.current) {
        silenceStartTime.current = now;
      } else if (now - silenceStartTime.current >= SILENCE_DURATION) {
        setRecordingPhase('Thinking...');
        (async () => {
          const uri = await stopRecording();
          if (stopPromiseRef.current) {
            stopPromiseRef.current(uri);
            stopPromiseRef.current = null;
          }
          silenceStartTime.current = null;
        })();
      }
    } else {
      silenceStartTime.current = null;
    }
  }, [recorderState.metering, recorderState.isRecording]);

  return { startRecording, stopRecording, recorderState, recordingPhase, speakAsync };
}