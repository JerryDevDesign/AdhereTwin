import { NextRequest, NextResponse } from 'next/server';
import { logDose } from '@/lib/supabase';

const ALLOWED_STATUSES = ['taken', 'missed', 'skipped'] as const;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { patientId, medicationId, status, organ } = body;

    // 1. Input Validation
    if (!patientId || !medicationId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: patientId, medicationId, and status are required.' },
        { status: 400 }
      );
    }

    if (!ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${ALLOWED_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    // 2. Execute domain logic
    const result = await logDose({
      patientId,
      medicationId,
      status,
      organ,
    });

    return NextResponse.json({
      success: true,
      message: `Dose recorded successfully as ${status}`,
      data: result,
    });
  } catch (err: any) {
    console.error('[DOSE_LOG_ERROR]:', err);
    return NextResponse.json(
      { error: err.message || 'An unexpected internal error occurred.' },
      { status: 500 }
    );
  }
}