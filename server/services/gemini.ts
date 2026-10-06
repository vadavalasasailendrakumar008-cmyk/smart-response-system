import '../config/loadEnv.js';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;

export const hasGeminiApiKey = Boolean(
  apiKey &&
  apiKey.trim().length > 5 &&
  apiKey !== 'your_google_gemini_api_key_here' &&
  apiKey !== 'your_gemini_api_key_here'
);

export let ai: GoogleGenAI | null = null;

if (hasGeminiApiKey) {
  try {
    ai = new GoogleGenAI({ apiKey: apiKey! });
    console.log('✅ Google GenAI SDK initialized with Gemini 2.5 Flash.');
  } catch (err) {
    console.warn('⚠️ Failed to initialize GoogleGenAI client:', err);
    ai = null;
  }
} else {
  console.log('ℹ️ GEMINI_API_KEY is not set or placeholder. RescuOS AI Triage Engine operating with High-Fidelity Rule/Expert fallback.');
}
