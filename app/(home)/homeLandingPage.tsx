import { View, Text, Alert, TouchableOpacity, ScrollView } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { LinearGradient } from "expo-linear-gradient";
import * as DocumentPicker from "expo-document-picker";
import * as SQLite from 'expo-sqlite';

import EvilIcons from '@expo/vector-icons/EvilIcons';
import { Ionicons } from "@expo/vector-icons";

import { SafeAreaView } from 'react-native-safe-area-context';
import AlertLoadingWithState from '@/components/AlertLoadingWithState';
import { Button } from '@/components/ui/button';
import { extractTextFromFile } from '@/util/textExtractionFromFiles';
import { getBatchEmbeddings } from '@/util/embedUploadedText';
import { chunkText } from '@/util/chunkText';
import { postEmbeddedChunks, deleteEmbeddingsTableData, embeddingToUint8Array, getAllEmbeddings } from '@/db/storingEmbeddingChunksFunctions';
import { getDb } from '@/db/db';

const HomeLandingPage = () => {

    const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);

    const [file, setFile] = useState<any>(null);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [uploadProgress, setUploadProgress] = useState<{ percentage: number, message: string }>({ percentage: 0, message: "" });

    const getCurrentFile = async () => {
        const stored = await AsyncStorage.getItem("tutorKnowledge");
        if (stored) {
            setFile(JSON.parse(stored));
        }
    };

    const pickFile = async () => {
        if (!db) {
            console.warn("Database not ready yet!");
            return;
        }
        setIsUploading(true);
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: [
                    "text/plain",
                    "application/pdf",
                    "application/msword",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ],
                copyToCacheDirectory: true,
            });

            if (result.canceled) return;

            setUploadProgress((prev) => ({ percentage: 24, message: "Uploading..." }));

            const fileData = result.assets[0];

            const storedFile = {
                uri: fileData.uri,
                name: fileData.name,
                mimeType: fileData.mimeType,
            };

            setUploadProgress((prev) => ({ percentage: 44, message: "Extracting data..." }));

            const res = await extractTextFromFile(storedFile);

            if (!res.success || !res.text) { return }; //TODO: Create a better alert component

            setUploadProgress((prev) => ({ percentage: 60, message: "Embedding data..." }));
            const chunks = chunkText(res.text, 500);
            console.log("CHUNKS: ", chunks);
            const allEmbeddings = await getBatchEmbeddings(chunks);
            console.log("All EMBEDDINGS: ", chunks);
            await deleteEmbeddingsTableData(db);
            for (let i = 0; i < chunks.length; i++) {
                const embeddingArr = allEmbeddings[i];
                await postEmbeddedChunks(db, {
                    text: chunks[i],
                    embedding: embeddingToUint8Array(embeddingArr),
                });
            }

            setUploadProgress((prev) => ({ percentage: 70, message: "Storing data..." }));

        } catch (error) {
            console.error("Error picking or processing file:", error);
        } finally {
            setIsUploading(false);
            setUploadProgress((prev) => ({ percentage: 0, message: "" }));
        }
    };

    const test = async () => {
        getAllEmbeddings(db!);
    }

    const clearFile = async () => {
        try {
            await AsyncStorage.removeItem("tutorKnowledge");
            setFile(null);
        } catch (err) {
            console.error("Error removing file:", err);
        }
    };

    const removeFile = () => {
        Alert.alert("Remove File", "Delete this file?", [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: clearFile },
        ]);
    };

    useEffect(() => {
        (async () => {
            const database = await getDb();
            setDb(database);
        })();
    }, []);

    useFocusEffect(
        useCallback(() => {
            getCurrentFile();
        }, [])
    );


    return (
        <SafeAreaView className="flex-1 justify-start items-start bg-background px-6 pt-4" edges={["left", "right", "bottom"]}>
            <AlertLoadingWithState open={isUploading} onOpenChange={() => { }} currentState={uploadProgress.message} activity="Processing File" progress={uploadProgress.percentage} />

            <ScrollView className="w-full" showsVerticalScrollIndicator={false}>
                <Button onPress={() => test()}><Text>TEST</Text></Button>
                {/* UPLOAD FILE */}
                <View className="flex flex-col w-full gap-4 mb-6">
                    <Text className="text-xl font-bold text-foreground">
                        Uploaded File
                    </Text>

                    {file ? (
                        <View className="w-full flex-col gap-2">
                            <View className="w-full p-4 border rounded-lg border-gray-300 bg-gray-50 flex-col items-center justify-between">
                                <View className="flex-row items-center justify-between flex-1">
                                    {/* Left side: icon + truncated filename */}
                                    <View className="flex-row items-center flex-1 mr-2">
                                        <Ionicons name="document-text-outline" size={28} color="#3B82F6" />
                                        <Text
                                            className="ml-2 text-gray-800 flex-1"
                                            numberOfLines={1}
                                            ellipsizeMode="middle"
                                        >
                                            {file.name}
                                        </Text>
                                    </View>

                                    {/* Trash button */}
                                    <TouchableOpacity onPress={() => { removeFile() }}>
                                        <EvilIcons name="trash" size={28} color="red" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <Button onPress={pickFile} className="bg-blue-500 w-full justify-center gap-2">
                                <Text className="text-base font bold text-white">Upload new file</Text>
                            </Button>
                        </View>
                    ) : (
                        <TouchableOpacity
                            onPress={pickFile}
                            activeOpacity={0.7}
                            className="w-full h-40 border-2 border-dashed border-gray-400 rounded-lg justify-center items-center"
                        >
                            <Ionicons name="add" size={32} color="#6B7280" />
                            <Text className="mt-2 text-gray-500">Tap to upload</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View className="flex flex-col w-full gap-4 mb-6">
                    <Text className="text-xl font-bold text-foreground">
                        Create notes from file
                    </Text>
                    <View className="w-full flex-row gap-2 items-center justify-center">
                        <TouchableOpacity className="flex-1 max-h-24 items-center justify-center rounded-lg overflow-hidden" onPress={() => Alert.alert("Feature coming soon!")}>
                            <LinearGradient
                                colors={["#3B82F6", "#06B6D4"]} // blue → cyan
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                className="w-full h-full items-center justify-center"
                            >
                                <Text className="text-white text-xl font-bold">Cheat Sheet</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                        <TouchableOpacity className="flex-1 max-h-24 items-center justify-center rounded-lg overflow-hidden" onPress={() => Alert.alert("Feature coming soon!")}>
                            <LinearGradient
                                colors={["#3B82F6", "#06B6D4"]} // blue → cyan
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                className="w-full h-full items-center justify-center"
                            >
                                <Text className="text-white text-xl font-bold">Flash Cards</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>

                <View className="flex flex-col w-full gap-4 mb-6">
                    <Text className="text-xl font-bold text-foreground">
                        Start a quiz
                    </Text>
                    <View className="w-full flex-row gap-2 items-center justify-center">
                        <TouchableOpacity className="flex-1 max-h-24 items-center justify-center rounded-lg overflow-hidden" onPress={() => Alert.alert("Feature coming soon!")}>
                            <LinearGradient
                                colors={["#EC4899", "#F97316"]} // pink → orange
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                className="w-full h-full items-center justify-center"
                            >
                                <Text className="text-white text-xl font-bold">Multiple Choice</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                        <TouchableOpacity className="flex-1 max-h-24 items-center justify-center rounded-lg overflow-hidden" onPress={() => Alert.alert("Feature coming soon!")}>
                            <LinearGradient
                                colors={["#EC4899", "#F97316"]} // pink → orange
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                className="w-full h-full items-center justify-center"
                            >
                                <Text className="text-white text-xl font-bold">True or False</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>

                <View className="flex flex-col w-full gap-4 mb-6">
                    <Text className="text-xl font-bold text-foreground">
                        Talk to your tutor
                    </Text>
                    <View className="w-full flex-row gap-2 items-center justify-center">
                        <TouchableOpacity className="flex-1 max-h-24 items-center justify-center rounded-lg overflow-hidden" onPress={() => Alert.alert("Feature coming soon!")}>
                            <LinearGradient
                                colors={["#8B5CF6", "#EC4899"]} // violet-500 → pink-500
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                className="w-full h-full items-center justify-center"
                            >
                                <Text className="text-white text-xl font-bold">Start a chat</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>

                <View className="flex flex-col w-full gap-4 mb-6">
                    <Text className="text-xl font-bold text-foreground">
                        Call to your tutor
                    </Text>
                    <View className="w-full flex-row gap-2 items-center justify-center">
                        <TouchableOpacity className="flex-1 max-h-24 items-center justify-center rounded-lg overflow-hidden" onPress={() => Alert.alert("Feature coming soon!")}>
                            <LinearGradient
                                colors={["#8B5CF6", "#6366F1"]} // violet-500 → indigo-500
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                className="w-full h-full items-center justify-center"
                            >
                                <Text className="text-white text-xl font-bold">Start a Call</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    )
}

export default HomeLandingPage