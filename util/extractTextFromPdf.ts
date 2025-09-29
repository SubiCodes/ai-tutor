import axios from 'axios';

type ExtractedTextResult = {
    text?: string;
    success: boolean;
};

type FileType = {
    uri: string;
    name: string;
    mimeType?: string;
};

export const extractTextFromPdf = async (pdf: FileType): Promise<ExtractedTextResult> => {
    try {
        const formData = new FormData();
        formData.append("file", {
            uri: pdf.uri,
            name: pdf.name,
            type: pdf.mimeType || "application/pdf",
        } as any);

        const res = await axios.post(
            "https://api.pdfrest.com/extracted-text",
            formData,
            {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "multipart/form-data",
                    "Api-Key": process.env.EXPO_PUBLIC_API_PDFREST,
                },
            }
        );

        if (res.data && res.data.fullText) {
            const enhancedText = res.data.fullText.replace(/\[pdfRest Free Demo\]/g, "");
            return { success: true, text: enhancedText };
        }

        return { success: false, text: "No text extracted from PDF." };
    } catch (error: any) {
        console.log("Error extracting text from PDF:", error.response?.data || error.message);
        return { success: false, text: "Unable to extract PDF." };
    }
};