// lib/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SimulationResult } from './simulate';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export interface NarrativeOutput {
  headline:        string;   
  bodyText:        string;   
  callToAction:    string;   
  yorubaHeadline?: string;   
}

export async function generateAdherenceNarrative(
  patient: any,
  simResults: SimulationResult[],
  adherenceRate: number
): Promise<NarrativeOutput> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const isChild = patient.isChild || patient.is_child;
  const missedMeds = simResults
    .map(r => `${r.medicationName} (${r.missedDays} days missed, affecting ${r.organ}, risk: ${r.riskLabel})`)
    .join('; ');

  const prompt = `You are a caring clinical pharmacist speaking directly to ${
    isChild ? `the caregiver of a child named ${patient.name}, aged ${patient.age}`
            : `a patient named ${patient.name}, aged ${patient.age}`
  }.

Medication adherence rate this week: ${adherenceRate}%.
Missed medications: ${missedMeds || 'None — fully adherent'}.

Generate a JSON object with exactly these fields:
{
  "headline": "One sentence (max 15 words) that makes the consequence personal and real. Not scary — honest. E.g. 'Your heart has been working without backup for 3 days.'",
  "bodyText": "2-3 sentences explaining what is happening in the body right now because of the missed medications. Personal, warm, medically accurate, plain language.",
  "callToAction": "One specific, actionable sentence. What should they do right now?",
  "yorubaHeadline": "The headline translated into Yoruba language."
}

Tone: warm, non-judgmental, honest. Never alarmist. Never preachy.
Return ONLY valid JSON. No markdown. No backticks.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, '').trim();
    return JSON.parse(text);
  } catch {
    return {
      headline:     `Your ${adherenceRate}% adherence rate this week needs attention.`,
      bodyText:     'Missing doses allows your condition to progress without protection. Your body works hardest to recover what medication could have maintained.',
      callToAction: 'Take your next scheduled dose now and set a reminder for tomorrow.',
      yorubaHeadline: 'Iwọn imọran oògùn rẹ fun ọsẹ yii nilo akiyesi.',
    };
  }
}