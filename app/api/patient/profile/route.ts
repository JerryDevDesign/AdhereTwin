// app/api/patient/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const patientId = req.nextUrl.searchParams.get('patientId');
    
    if (!patientId) {
      return NextResponse.json({ error: 'patientId required' }, { status: 400 });
    }

    // 1. Fetch patient and their joined medications
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select(`
        *,
        medications (*)
      `)
      .eq('id', patientId)
      .single();

    if (patientError) throw patientError;

    // 2. Calculate the 7-day adherence rate for the dashboard
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    
    const { data: logs, error: logsError } = await supabase
      .from('dose_logs')
      .select('status')
      .eq('patient_id', patientId)
      .gte('scheduled_time', sevenDaysAgo);

    if (logsError) throw logsError;

    const total = logs?.length || 0;
    const taken = logs?.filter(l => l.status === 'taken').length || 0;
    const adherenceRate = total ? Math.round((taken / total) * 100) : 100;

    // 3. Package the profile with the stats
    const profileWithStats = {
      ...patient,
      adherenceRate
    };

    return NextResponse.json({ profile: profileWithStats });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}