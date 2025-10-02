import AsyncStorage from "@react-native-async-storage/async-storage";

export const getCurrentFileFromAsyncStorage = async () => {
    const stored = await AsyncStorage.getItem("tutorKnowledge");
    if (stored) {
        return JSON.parse(stored)
    }
};