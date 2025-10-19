import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import {
  useAudioRecorder,
  useAudioRecorderState,
  AudioModule,
  setAudioModeAsync,
  RecordingPresets,
} from 'expo-audio';

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

  // --- Permissions and audio mode setup ---
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

  // --- Core Functions ---
  const startRecording = async (): Promise<string> => {
    await recorder.prepareToRecordAsync();
    recorder.record();

    hasSpoken.current = false;
    setRecordingPhase('Waiting for you to speak...');

    // 👇 The Promise will resolve ONLY when silence stops the recording
    return new Promise((resolve) => {
      stopPromiseRef.current = resolve;
    });
  };

  const stopRecording = async (): Promise<string> => {
    await recorder.stop();
    setRecordingPhase('');
    return recorder.uri;
  };

  // --- Silence Detection Logic ---
  useEffect(() => {
    if (!recorderState.isRecording || typeof recorderState.metering !== 'number') {
      silenceStartTime.current = null;
      return;
    }

    const SILENCE_THRESHOLD = -20; // lower = more sensitive
    const SILENCE_DURATION = 1500; // 1.5s continuous silence
    const now = Date.now();

    const isSpeaking = recorderState.metering > SILENCE_THRESHOLD;

    // ✅ Detect first speech
    if (!hasSpoken.current && isSpeaking) {
      hasSpoken.current = true;
      setRecordingPhase('Listening...');
    }

    // 💤 Before speaking, don’t start silence timer
    if (!hasSpoken.current) return;

    // 🤫 After speech, track silence
    if (!isSpeaking) {
      if (!silenceStartTime.current) {
        silenceStartTime.current = now;
      } else if (now - silenceStartTime.current >= SILENCE_DURATION) {
        setRecordingPhase('Thinking...');
        (async () => {
          const uri = await stopRecording();
          // ✅ Resolve the Promise from startRecording() here
          if (stopPromiseRef.current) {
            stopPromiseRef.current(uri);
            stopPromiseRef.current = null;
          }
          silenceStartTime.current = null;
        })();
      }
    } else {
      silenceStartTime.current = null; // reset timer when speaking resumes
    }
  }, [recorderState.metering, recorderState.isRecording]);

  return { startRecording, stopRecording, recorderState, recordingPhase };
}
