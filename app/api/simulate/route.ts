import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { DTP } from '@ontomorph/dtp-sdk';
import { runConsequenceSimulation } from '@/lib/simulate';
import { generateAdherenceNarrative } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const { patientId } = await req.json();

    const { data: patient, error } = await supabase
      .from('patients')
      .select('*, medications(*)')
      .eq('id', patientId)
      .single();

    if (error || !patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: logs } = await supabase
      .from('dose_logs')
      .select('status')
      .eq('patient_id', patientId)
      .gte('scheduled_time', sevenDaysAgo); // Changed to scheduled_time

    const total         = logs?.length || 0;
    const taken         = logs?.filter(l => l.status === 'taken').length || 0;
    const adherenceRate = total ? Math.round((taken / total) * 100) : 100;

    const medications = patient.medications.map((m: any) => ({
      id:           m.id,
      name:         m.name,
      diagnosis:    m.diagnosis,
      organ:        m.organ,
      timesPerDay:  m.times_per_day,
      doseTimes:    m.dose_times,
      streakDays:   m.streak_days,
      missedStreak: m.missed_streak,
    }));

    const dtp = new DTP({
      apiKey:      process.env.DTP_API_KEY!,
      holonApiUrl: process.env.HOLON_API_URL!,
      holonApiKey: process.env.HOLON_API_KEY!,
    });

    const simResults = await runConsequenceSimulation(medications, dtp);
    const narrative  = await generateAdherenceNarrative(
      { ...patient, medications, isChild: patient.is_child },
      simResults,
      adherenceRate
    );

    return NextResponse.json({ patient, medications, simResults, narrative, adherenceRate });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}