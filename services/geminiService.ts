
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Priority, Category } from "../types";

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("CRITICAL: API_KEY is missing in process.env. AI features will not work.");
  }
  return new GoogleGenAI({ apiKey: apiKey || '' });
};

export const refineTask = async (rawInput: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Refine this task into a structured JSON object: "${rawInput}". 
      Categorize it into one of: WORK, PERSONAL, HEALTH, URGENT. 
      Assign a priority: LOW, MEDIUM, HIGH. 
      Provide a title and a clearer description.
      
      CRITICAL: Output MUST be a valid JSON object. 
      The "title" and "description" MUST be in the same language as the input.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            priority: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH'] },
            category: { type: Type.STRING, enum: ['WORK', 'PERSONAL', 'HEALTH', 'URGENT'] }
          },
          required: ['title', 'description', 'priority', 'category']
        }
      }
    });

    if (!response.text) throw new Error("Empty response from AI");
    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("Refine Task Error:", error);
    throw error;
  }
};

export const getDailyInspiration = async (todosCount: number) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a Zen master productivity coach. Provide a single, short, encouraging sentence for someone who has ${todosCount} tasks remaining today. Be poetic and brief in Korean.`
    });
    return response.text?.trim() || "오늘도 당신만의 속도로 나아가세요.";
  } catch (error) {
    console.error("Inspiration Error:", error);
    return "현재에 집중하며 한 걸음씩 나아가세요.";
  }
};

// Live API Helpers
export const encode = (bytes: Uint8Array) => {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

export const decode = (base64: string) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
