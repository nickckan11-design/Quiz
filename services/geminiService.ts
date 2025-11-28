
import { GoogleGenAI, Type } from "@google/genai";
import { QuizData, QuestionType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateQuizFromText = async (text: string, imageBase64?: string): Promise<QuizData> => {
  const model = "gemini-2.5-flash";

  const promptText = `
    You are an intelligent Quiz Organizer and Generator.
    The user has provided input (Text and/or Image).
    
    YOUR TASK:
    1. ANALYZE the input. 
       - If an IMAGE is provided, it might be a photo of a quiz, notes, or a diagram. EXTRACT the questions or content from it.
       - If TEXT is provided, analyze it as notes or questions.
    
    2. MODE DETECTION:
       A) RAW QUESTIONS (from image/text): 
          - Extract them exactly. Fix typos.
          - If options exist (A, B, C), use MULTIPLE_CHOICE.
          - If no options, use FILL_IN_BLANK.
          - SOLVE the question to get the 'correctAnswer'.
          - GENERATE an educational 'explanation'.
       
       B) STUDY MATERIAL (notes/articles):
          - GENERATE 5-10 challenging questions based on this content.
    
    OUTPUT REQUIREMENTS:
    - Return strictly valid JSON.
    - 'options' must be an array of strings (4 items for MC).
    - 'options' is [] for Fill-in-Blank.
    
    Input Text Context: "${text}"
  `;

  const contents = [];
  
  // Add Image Part if exists
  if (imageBase64) {
    // Remove data URL prefix if present (e.g., "data:image/png;base64,") to get raw base64
    const base64Data = imageBase64.split(',')[1] || imageBase64;
    contents.push({
      inlineData: {
        mimeType: "image/jpeg", // Assuming JPEG/PNG, the API is generally flexible with common image types
        data: base64Data
      }
    });
  }

  // Add Text Part
  contents.push({ text: promptText });

  const response = await ai.models.generateContent({
    model: model,
    contents: contents, // Pass array of parts
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "A catchy title for the quiz" },
          description: { type: Type.STRING, description: "Brief description of topics covered" },
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.INTEGER },
                type: { type: Type.STRING, enum: [QuestionType.MULTIPLE_CHOICE, QuestionType.FILL_IN_BLANK] },
                questionText: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctAnswer: { type: Type.STRING },
                explanation: { type: Type.STRING },
              },
              required: ["id", "type", "questionText", "correctAnswer", "explanation"],
            },
          },
        },
        required: ["title", "description", "questions"],
      },
    },
  });

  if (!response.text) {
    throw new Error("Failed to generate quiz data");
  }

  try {
    // Sanitize response: sometimes models wrap JSON in markdown code blocks
    let cleanText = response.text.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/^```json/, '').replace(/```$/, '');
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```/, '').replace(/```$/, '');
    }
    
    return JSON.parse(cleanText) as QuizData;
  } catch (e) {
    console.error("JSON Parse Error:", e);
    console.error("Raw Text:", response.text);
    throw new Error("AI generated invalid data format. Please try again.");
  }
};
