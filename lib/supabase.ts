// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// We use the Service Role Key here to bypass RLS for backend APIs
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Single exported Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseKey);

// --- INTERFACES MATCHING YOUR SQL SCHEMA ---

export interface Medication {
  id: string;
  patient_id: string;
  name: string;
  diagnosis: string;
  organ: string;
  times_per_day: number;
  dose_times: string[];
  streak_days: number;
  missed_streak: number;
}

export interface PatientProfile {
  id: string;
  doctor_id: string;
  name: string;
  age: string;
  is_child: boolean;
  diagnosis: string;
  twin_id?: string;
  medications?: Medication[];
}

export type DoseStatus = 'taken' | 'missed' | 'skipped' | 'pending';

export interface DoseLog {
  id?: string;
  medication_id: string;
  patient_id: string;
  status: DoseStatus;
  scheduled_time?: string;
  taken_at?: string | null;
  organ: string;
}

export type DoseLogPayload = {
  patientId: string;
  medicationId: string;
  status: DoseStatus;
  organ?: string;
  scheduledTime?: string;
};

// --- DOCTOR METHODS ---

// Register a new patient and their medications
export async function addPatient(
  patient: Omit<PatientProfile, 'medications'>,
  medications: Omit<Medication, 'id' | 'patient_id'>[]
): Promise<string> {
  // 1. Insert the Patient
  const { data: newPatient, error: pError } = await supabase
    .from('patients')
    .insert(patient)
    .select('id')
    .single();

  if (pError || !newPatient) {
    console.error('Error adding patient:', pError);
    throw new Error('Failed to add patient');
  }

  // 2. Insert Medications linked to the new patient ID
  if (medications && medications.length > 0) {
    const medsToInsert = medications.map((med) => ({
      ...med,
      patient_id: newPatient.id,
    }));

    const { error: mError } = await supabase.from('medications').insert(medsToInsert);

    if (mError) console.error('Error adding medications:', mError);
  }

  return newPatient.id;
}

// Get all patients for a doctor (Joined with their medications)
export async function getDoctorPatients(doctorId: string): Promise<PatientProfile[]> {
  const { data, error } = await supabase
    .from('patients')
    .select(`
      *,
      medications (*)
    `)
    .eq('doctor_id', doctorId);

  if (error || !data) return [];
  return data as PatientProfile[];
}

// --- PATIENT METHODS ---

// Get a single patient profile (Joined with medications)
export async function getPatient(id: string): Promise<PatientProfile | null> {
  const { data, error } = await supabase
    .from('patients')
    .select(`
      *,
      medications (*)
    `)
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data as PatientProfile;
}

// Log a dose event and update medication streaks
export async function logDose(payload: DoseLogPayload | DoseLog) {
  // Normalize fields in case payload comes as camelCase or snake_case
  const patientId = 'patientId' in payload ? payload.patientId : payload.patient_id;
  const medicationId = 'medicationId' in payload ? payload.medicationId : payload.medication_id;
  const status = payload.status;
  const organ = payload.organ || 'Unknown';
  const scheduledTime = 'scheduledTime' in payload ? payload.scheduledTime : payload.scheduled_time;

  // 1. Insert into dose_logs
  const { data: logData, error: logError } = await supabase
    .from('dose_logs')
    .insert([
      {
        patient_id: patientId,
        medication_id: medicationId,
        status,
        organ,
        scheduled_time: scheduledTime,
        taken_at: status === 'taken' ? new Date().toISOString() : null,
      },
    ])
    .select()
    .single();

  if (logError) {
    console.error('Error logging dose:', logError);
    throw new Error(`Failed to log dose: ${logError.message}`);
  }

  // 2. Fetch current medication to update streaks
  const { data: currentMed, error: fetchError } = await supabase
    .from('medications')
    .select('streak_days, missed_streak')
    .eq('id', medicationId)
    .single();

  if (fetchError) {
    console.error('Error fetching medication for streak update:', fetchError);
    throw new Error(`Dose logged, but failed to fetch medication streaks: ${fetchError.message}`);
  }

  // 3. Update streaks conditionally
  if (currentMed) {
    const isTaken = status === 'taken';
    const nextStreak = isTaken ? (currentMed.streak_days || 0) + 1 : 0;
    const nextMissed = isTaken ? 0 : (currentMed.missed_streak || 0) + 1;

    const { error: updateError } = await supabase
      .from('medications')
      .update({
        streak_days: nextStreak,
        missed_streak: nextMissed,
      })
      .eq('id', medicationId);

    if (updateError) {
      console.error('Error updating streak:', updateError);
      throw new Error(`Dose logged, but failed updating streaks: ${updateError.message}`);
    }
  }

  return logData;
}

// Get all dose logs for simulation/adherence rate
export async function getDoseLogs(patientId: string): Promise<DoseLog[]> {
  const { data, error } = await supabase
    .from('dose_logs')
    .select('*')
    .eq('patient_id', patientId)
    .order('scheduled_time', { ascending: false });

  if (error || !data) return [];
  return data as DoseLog[];
}