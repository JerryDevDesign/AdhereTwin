import { NextRequest, NextResponse } from 'next/server';
import { logDose } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { patientId, medicationId, status, organ } = await req.json();

    // The helper function handles both the insert and the streak updates
    await logDose({
      patient_id: patientId,
      medication_id: medicationId,
      status: status,
      organ: organ || 'Unknown' 
    });

    return NextResponse.json({ success: true });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}