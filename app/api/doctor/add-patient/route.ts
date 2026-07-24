import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { name, age, diagnosis, isChild } = await req.json();

    // Fetch default doctor or create relationship if needed
    const { data: doctor } = await supabaseAdmin.from('doctors').select('id').limit(1).single();

    const { data, error } = await supabaseAdmin.from('patients').insert([
      {
        name,
        age,
        diagnosis,
        is_child: isChild || false,
        doctor_id: doctor?.id || null
      }
    ]).select().single();

    if (error) throw error;
    return NextResponse.json({ success: true, patient: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}