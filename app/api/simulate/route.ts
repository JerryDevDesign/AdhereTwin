// app/api/simulate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { executeOntomorphSimulation } from '@/lib/ontomorph-engine';
import { generateAdherenceNarrative } from '@/lib/ai-service';

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
      .gte('scheduled_time', sevenDaysAgo);

    const total = logs?.length || 0;
    const taken = logs?.filter((l: any) => l.status === 'taken').length || 0;
    const adherenceRate = total ? Math.round((taken / total) * 100) : 100;

    const medications = (patient.medications || []).map((m: any) => ({
      id: m.id,
      name: m.name,
      diagnosis: m.diagnosis,
      organ: m.organ,
      timesPerDay: m.times_per_day,
      doseTimes: m.dose_times,
      streakDays: m.streak_days,
      missedStreak: m.missed_streak,
    }));

    let simResults = [];
    try {
      simResults = await executeOntomorphSimulation(medications);
    } catch (simErr) {
      simResults = medications.map((med: any) => {
        const missed = med.missedStreak || 0;
        const degradationScore = Math.min(100, Math.round(10 * Math.log(missed + 1) * 10));
        return {
          organ: med.organ || 'General',
          medication: med.name,
          missedStreak: missed,
          degradationScore,
          status: missed > 0 ? 'degraded' : 'optimized'
        };
      });
    }

    const narrative = await generateAdherenceNarrative(patient, simResults, adherenceRate);

    return NextResponse.json({ patient, medications, simResults, narrative, adherenceRate });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}