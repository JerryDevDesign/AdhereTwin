import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { enrichDrugWithHOLON } from '@/lib/holon';
import { DTP } from '@ontomorph/dtp-sdk';

export async function POST(req: NextRequest) {
  try {
    const { doctorId, name, age, isChild, diagnosis, medications } = await req.json();

    const dtp = new DTP({
      apiKey:      process.env.DTP_API_KEY!,
      holonApiUrl: process.env.HOLON_API_URL!,
      holonApiKey: process.env.HOLON_API_KEY!,
    });

    // 1. Create patient record
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .insert({ doctor_id: doctorId, name, age, is_child: isChild, diagnosis })
      .select()
      .single();

    if (patientError) throw patientError;

    // 2. Enrich medications with HOLON and insert
    const enrichedMeds = await Promise.all(
      medications.map(async (m: any) => {
        const { organ } = await enrichDrugWithHOLON(m.name, dtp);
        return {
          patient_id:    patient.id,
          name:          m.name,
          diagnosis:     m.diagnosis || diagnosis,
          organ,
          times_per_day: m.timesPerDay || 1,
          dose_times:    m.doseTimes || ['08:00'],
        };
      })
    );

    const { data: meds, error: medsError } = await supabase
      .from('medications')
      .insert(enrichedMeds)
      .select();

    if (medsError) throw medsError;

    return NextResponse.json({ patient: { ...patient, medications: meds } });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}