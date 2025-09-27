import * as FileSystem from "expo-file-system";
import { extractTextFromPdf } from "@/util/extractTextFromPdf";
import { Alert } from "react-native";

type PickedFile = {
    uri: string;
    name: string;
    mimeType?: string;
};

type ExtractedTextResult = {
    text?: string;
    success: boolean;
    error?: string;
}

export async function extractTextFromFile(file: PickedFile): Promise<ExtractedTextResult> {
    const { uri, mimeType, name } = file;

    try {
        // ---- TXT ----
        if (mimeType === "text/plain" || name.endsWith(".txt")) {
            const text = await FileSystem.readAsStringAsync(uri, {
                encoding: "utf8",
            });
            return { text: text, success: true };
        }

        // ---- PDF ----
        if (mimeType === "application/pdf" || name.toLowerCase().endsWith(".pdf")) {
           const res = await extractTextFromPdf(file);
           return res;
        }

        // ---- DOC / DOCX ----
        if (
            mimeType === "application/msword" ||
            mimeType ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
            name.toLowerCase().endsWith(".doc") ||
            name.toLowerCase().endsWith(".docx")
        ) {
            Alert.alert(
                "Unsupported File Type",
                "DOC and DOCX files are not supported yet. Please convert your document to PDF or TXT format and try again.",
                [{ text: "OK" }]
            );
            return { success: false, error: "DOC/DOCX files are not supported yet." };
        }

        // ---- Unsupported ----
        return { success: false, error: "Unsupported file type. Please upload a .txt file." };
    } catch (error) {
        console.error("❌ Error extracting text:", error);
        return { success: false, error: "Unable to parse uploaded file" };;
    }
}