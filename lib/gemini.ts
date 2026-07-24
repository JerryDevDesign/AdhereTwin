// lib/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function generateAdherenceNarrative(patient: any, simResults: any[], adherenceRate: number) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are a clinical digital twin AI. Generate a concise, high-impact clinical briefing for a patient named ${patient.name} (${patient.diagnosis}), with an adherence rate of ${adherenceRate}%. Current organ stress metrics: ${JSON.stringify(simResults)}. Provide 3 fields in JSON format: headline, bodyText, and callToAction.`;
    
    const response = await model.generateContent(prompt);
    const text = response.response.text();
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    console.error('Gemini narrative generation error:', err);
    return {
      headline: adherenceRate === 100 ? 'System Fully Optimized' : 'Biometric Vulnerability Detected',
      bodyText: adherenceRate === 100 
        ? 'All organ pathways are operating under full pharmacological protection.' 
        : 'Missed doses have introduced localized physiological stress. Immediate correction advised.',
      callToAction: adherenceRate === 100 ? 'Maintain current schedule' : 'Take pending dose immediately'
    };
  }
}