// app/api/doctor/patients/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const doctorId = req.nextUrl.searchParams.get('doctorId');
    if (!doctorId) {
      return NextResponse.json({ error: 'doctorId required' }, { status: 400 });
    }

    // Get all patients for this doctor with their medications
    const { data: patients, error } = await supabase
      .from('patients')
      .select(`
        *,
        medications (*)
      `)
      .eq('doctor_id', doctorId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // For each patient, calculate 7-day adherence rate
    const patientsWithStats = await Promise.all(
      (patients || []).map(async (patient) => {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

        const { data: logs } = await supabase
          .from('dose_logs')
          .select('status')
          .eq('patient_id', patient.id)
          .gte('scheduled_time', sevenDaysAgo);

        const total  = logs?.length || 0;
        const taken  = logs?.filter(l => l.status === 'taken').length || 0;
        const adherenceRate = total ? Math.round((taken / total) * 100) : 100;

        return { ...patient, adherenceRate };
      })
    );

    return NextResponse.json({ patients: patientsWithStats });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}