// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// We use the Service Role Key here to bypass RLS for the hackathon backend APIs
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
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

export interface DoseLog {
  id?: string;
  medication_id: string;
  patient_id: string;
  status: 'taken' | 'missed' | 'pending';
  scheduled_time?: string;
  taken_at?: string | null;
  organ: string;
}

// --- DOCTOR METHODS ---

// Register a new patient and their medications
export async function addPatient(patient: Omit<PatientProfile, 'medications'>, medications: Omit<Medication, 'id' | 'patient_id'>[]): Promise<string> {
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
    const medsToInsert = medications.map(med => ({
      ...med,
      patient_id: newPatient.id
    }));
    
    const { error: mError } = await supabase
      .from('medications')
      .insert(medsToInsert);

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

// Log a dose event and update streaks
export async function logDose(log: DoseLog): Promise<void> {
  // 1. Log the dose
  const { error: logError } = await supabase
    .from('dose_logs')
    .insert({
      ...log,
      taken_at: log.status === 'taken' ? new Date().toISOString() : null
    });
    
  if (logError) {
    console.error('Error logging dose:', logError);
    return;
  }

  // 2. Fetch current medication to update streaks
  const { data: currentMed } = await supabase
    .from('medications')
    .select('streak_days, missed_streak')
    .eq('id', log.medication_id)
    .single();

  if (currentMed) {
    const isTaken = log.status === 'taken';
    await supabase
      .from('medications')
      .update({
        streak_days: isTaken ? currentMed.streak_days + 1 : 0,
        missed_streak: isTaken ? 0 : currentMed.missed_streak + 1
      })
      .eq('id', log.medication_id);
  }
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