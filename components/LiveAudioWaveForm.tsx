// components/LiveAudioWaveform.tsx
import React, { useEffect, useRef } from 'react';
import { View, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface LiveAudioWaveformProps {
  metering?: number | null;
  height?: number;
  color?: string;
  barWidth?: number;
  barSpacing?: number;
}

const LiveAudioWaveform = ({
  metering = -60,
  height = 50,
  color = '#3B82F6',
  barWidth = 3,
  barSpacing = 4,
}: LiveAudioWaveformProps) => {
  const { width } = useWindowDimensions();

  // Calculate how many bars fit in the available width
  const barUnit = barWidth + barSpacing;
  const barCount = Math.floor(width / barUnit);

  // Normalize metering to 0-1 range
  const normalizedMetering = Math.min(Math.max((metering + 60) / 60, 0), 1);

  // Check if there's actual audio (metering above threshold)
  const isRecording = normalizedMetering > 0.05;

  // Don't render anything if metering is 0
  if (metering == null || metering === 0) {
    return null;
  }

  return (
    <View
      className="flex-row items-center justify-center"
      style={{ height, width: '100%', overflow: 'hidden' }}
    >
      {Array.from({ length: barCount }).map((_, index) => (
        <AnimatedBar
          key={index}
          index={index}
          totalBars={barCount}
          metering={normalizedMetering}
          height={height}
          barWidth={barWidth}
          barSpacing={barSpacing}
          color={color}
          isRecording={isRecording}
        />
      ))}
    </View>
  );
};

interface AnimatedBarProps {
  index: number;
  totalBars: number;
  metering: number;
  height: number;
  barWidth: number;
  barSpacing: number;
  color: string;
  isRecording: boolean;
}

const AnimatedBar = ({ index, totalBars, metering, height, barWidth, barSpacing, color, isRecording }: AnimatedBarProps) => {
  const barHeight = useSharedValue(0.08);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Each bar has its own personality
  const barPersonality = useRef({
    sensitivity: 0.7 + Math.random() * 0.6,
    speedFactor: 0.8 + Math.random() * 0.4,
    randomness: 0.3 + Math.random() * 0.3,
    phaseOffset: Math.random() * Math.PI * 2,
    minHeight: 0.05 + Math.random() * 0.10, // Can go lower (0.05-0.15)
  }).current;

  useEffect(() => {
    const updateBar = () => {
      // If not recording, stay at minimum height
      if (!isRecording) {
        barHeight.value = withTiming(0.08, {
          duration: 300,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
        });
        return;
      }

      // Create wave pattern across bars
      const position = index / totalBars;
      const wave = Math.sin(Date.now() / 400 + barPersonality.phaseOffset + position * Math.PI);

      // Combine audio metering with randomness
      const audioComponent = metering * barPersonality.sensitivity;
      const randomComponent = (Math.random() * 0.5 + 0.5) * barPersonality.randomness;
      const waveComponent = (wave * 0.5 + 0.5) * 0.25;

      // Mix all components
      let targetHeight = audioComponent * (1 - barPersonality.randomness) +
        randomComponent +
        waveComponent;

      // Allow bars to go lower for more bounce
      targetHeight = Math.max(targetHeight, barPersonality.minHeight);

      // Occasional dips to create more dynamic movement
      if (Math.random() < 0.05) {
        targetHeight = Math.max(targetHeight * 0.4, barPersonality.minHeight);
      }

      // Occasional spikes
      if (Math.random() < 0.04) {
        targetHeight = Math.min(targetHeight * (1.3 + Math.random() * 0.4), 1);
      }

      // Clamp to 0-1 range
      targetHeight = Math.min(Math.max(targetHeight, 0), 1);

      // Smooth animation
      const duration = (60 + Math.random() * 40) * barPersonality.speedFactor;

      barHeight.value = withTiming(targetHeight, {
        duration,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      });
    };

    // Update interval
    intervalRef.current = setInterval(updateBar, 60);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [metering, index, totalBars, isRecording]);

  const animatedStyle = useAnimatedStyle(() => {
    const minBarHeight = 4;
    // Each bar takes up half the total height (mirrored)
    const calculatedHeight = barHeight.value * (height / 2);
    return {
      height: Math.max(calculatedHeight, minBarHeight),
    };
  });

  return (
    <Animated.View
      style={[
        {
          width: barWidth,
          marginHorizontal: barSpacing / 2,
          backgroundColor: color,
          borderRadius: 1.5,
        },
        animatedStyle,
      ]}
    />
  );
};

export default LiveAudioWaveform;