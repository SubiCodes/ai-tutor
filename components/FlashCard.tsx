import React, { ReactNode } from 'react';
import { Pressable, SafeAreaView, View, StyleSheet, Text, StyleProp, ViewStyle } from 'react-native';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

type ContentProps = {
  question?: string;
  answer?: string;
  number: number;
  total: number;
};

const RegularContent: React.FC<ContentProps> = ({ question, number, total }) => {
  return (
    <View className="flex-1 min-w-full min-h-full bg-violet-400 rounded-lg items-center justify-center flex-col p-2">
      <View className="self-start">
        <Text className="text-gray-300">Question</Text>
      </View>
      <View className="flex-1 items-center justify-center">
        <Text className="text-2xl font-bold text-white text-center">
          {question}
        </Text>
      </View>
      <View className="items-center justify-center">
        <Text className="text-gray-300">
          {number} of {total}
        </Text>
      </View>
    </View>
  );
};

const FlippedContent: React.FC<ContentProps> = ({ answer, number, total }) => {
  return (
    <View className="flex-1 min-w-full min-h-full bg-[#50C878] rounded-lg items-center justify-center flex-col p-2">
      <View className="self-start">
        <Text className="text-gray-300">Answer</Text>
      </View>
      <View className="flex-1 items-center justify-center">
        <Text className="text-2xl font-bold text-white text-center">
          {answer}
        </Text>
      </View>
      <View className="items-center justify-center">
        <Text className="text-gray-300">
          {number} of {total}
        </Text>
      </View>
    </View>
  );
};


type FlipCardProps = {
    isFlipped: { value: boolean } | import('react-native-reanimated').SharedValue<boolean>;
    cardStyle?: StyleProp<ViewStyle>;
    direction?: 'x' | 'y';
    duration?: number;
    RegularContent?: ReactNode;
    FlippedContent?: ReactNode;
    toggleFlip?: () => void;
    data: FlashCardProps
};

export type FlashCardProps = {
    question: string;
    answer: string;
    amountOfQuestions: number;
    number: number
}

type FlashCardComponentProps = {
  data: FlashCardProps;
};

const FlipCard: React.FC<FlipCardProps> = ({
    isFlipped,
    cardStyle,
    direction = 'y',
    duration = 500,
    RegularContent,
    FlippedContent,
    toggleFlip,
    data
}) => {
    const isDirectionX = direction === 'x';

    const regularCardAnimatedStyle = useAnimatedStyle(() => {
        // ensure we work with numeric values for interpolation
        const current = typeof (isFlipped as any)?.value === 'boolean' ? ((isFlipped as any).value ? 1 : 0) : Number((isFlipped as any).value);
        const spinValue = interpolate(current, [0, 1], [0, 180]);
        const rotateValue = withTiming(`${spinValue}deg`, { duration });

        return {
            transform: [
                isDirectionX ? { rotateX: rotateValue } : { rotateY: rotateValue },
            ],
        } as any;
    });

    const flippedCardAnimatedStyle = useAnimatedStyle(() => {
        const current = typeof (isFlipped as any)?.value === 'boolean' ? ((isFlipped as any).value ? 1 : 0) : Number((isFlipped as any).value);
        const spinValue = interpolate(current, [0, 1], [180, 360]);
        const rotateValue = withTiming(`${spinValue}deg`, { duration });

        return {
            transform: [
                isDirectionX ? { rotateX: rotateValue } : { rotateY: rotateValue },
            ],
        } as any;
    });

    return (
        <Pressable onPress={toggleFlip} className='w-full'>
            <View className=' w-full h-full items-center justify-center' >
                <Animated.View
                    className='max-w-[90%] max-h-[80%]'
                    style={[
                        flipCardStyles.regularCard,
                        cardStyle,
                        regularCardAnimatedStyle,
                    ]}
                >
                    {RegularContent}
                </Animated.View>
                <Animated.View
                    className='max-w-[90%] max-h-[80%]'
                    style={[
                        flipCardStyles.flippedCard,
                        flippedCardAnimatedStyle,
                    ]}
                >
                    {FlippedContent}
                </Animated.View>
            </View>
        </Pressable>
    );
};

const flipCardStyles = StyleSheet.create({
    regularCard: {
        position: 'absolute',
        zIndex: 1,
        backfaceVisibility: 'hidden',
    },
    flippedCard: {
        zIndex: 2,
        backfaceVisibility: 'hidden',
    },
});

export default function FlashCard({data} : FlashCardComponentProps) {
    const isFlipped = useSharedValue(false);

    const handlePress = () => {
        isFlipped.value = !isFlipped.value;
    };

    return (
        <SafeAreaView style={styles.container}>
            <FlipCard
                isFlipped={isFlipped}
                cardStyle={styles.flipCard}
                FlippedContent={<FlippedContent answer={data.answer} number={data.number} total={data.amountOfQuestions}/>}
                RegularContent={<RegularContent question={data.question} number={data.number} total={data.amountOfQuestions}/>}
                toggleFlip={handlePress}
                data={data}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        height: 300,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonContainer: {
        marginTop: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    toggleButton: {
        backgroundColor: '#b58df1',
        padding: 12,
        borderRadius: 48,
    },
    toggleButtonText: {
        color: '#fff',
        textAlign: 'center',
    },
    flipCard: {
        backfaceVisibility: 'hidden',
    },
});