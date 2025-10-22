
import { GoogleGenAI, Modality } from '@google/genai';
import type { GroundingSource } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = (base64: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64,
      mimeType
    },
  };
};

export const analyzeImageForLandmark = async (base64Image: string, mimeType: string): Promise<string> => {
  const imagePart = fileToGenerativePart(base64Image, mimeType);
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        { text: "Identify the primary landmark in this image. Respond with only the name of the landmark and its city/country. For example: 'Eiffel Tower, Paris, France'." },
        imagePart,
      ],
    },
  });
  return response.text.trim();
};

export const fetchLandmarkHistory = async (landmarkName: string): Promise<{ history: string; sources: GroundingSource[] }> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Tell me a brief, interesting history of ${landmarkName}. Focus on key facts and stories suitable for a tourist's audio guide. Keep it concise, around 150 words.`,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });
  
  const history = response.text;
  const sources = (response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingSource[]) || [];
  
  return { history, sources };
};

export const generateNarration = async (text: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Read the following text in a clear, engaging, and slightly enthusiastic tone, as if you were a tour guide: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) {
    throw new Error("Failed to generate audio from TTS API.");
  }
  return base64Audio;
};
