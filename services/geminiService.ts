
import { GoogleGenAI } from "@google/genai";

export const getExerciseTip = async (exerciseName: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Give me a one-sentence minimalist pro-tip for the gym exercise: ${exerciseName}. Focus on form or mind-muscle connection.`,
    });
    return response.text || "Keep your form tight and stay focused.";
  } catch (error) {
    console.error("Error fetching AI tip:", error);
    return "Focus on controlled movements and full range of motion.";
  }
};
