// app/api/what-if/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { patientId, simulatedMissedDays } = await req.json();

    const { data: medications } = await supabase
      .from('medications')
      .select('*')
      .eq('patient_id', patientId);

    // Run predictive counterfactual simulation
    const simulationResults = (medications || []).map(med => {
      const projectedMissed = (med.missed_streak || 0) + simulatedMissedDays;
      const degradationScore = Math.min(100, Math.round(10 * Math.log(projectedMissed + 1) * 10));
      return {
        organ: med.organ || 'General',
        medication: med.name,
        projectedMissedDays: projectedMissed,
        degradationScore,
        riskLevel: degradationScore > 75 ? 'Critical' : degradationScore > 40 ? 'Moderate' : 'Low'
      };
    });

    // Generate dynamic AI warning using Gemini
    let aiWarning = `Simulating ${simulatedMissedDays} days of missed adherence projects accelerated organ stress across target pathways.`;
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `As a clinical AI, provide a short, impactful 2-sentence warning for a patient projecting ${simulatedMissedDays} days of missed medication, affecting these organs: ${JSON.stringify(simulationResults)}.`;
      const response = await model.generateContent(prompt);
      aiWarning = response.response.text() || aiWarning;
    } catch (e) {
      console.error('Gemini prediction warning fallback used:', e);
    }

    return NextResponse.json({
      success: true,
      simulatedMissedDays,
      simulationResults,
      aiWarning
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}