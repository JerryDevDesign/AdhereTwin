// app/doctor/add-patient/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
export const dynamic = 'force-dynamic';

function AddPatientContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [doctorId, setDoctorId] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [isChild, setIsChild] = useState(false);
  const [meds, setMeds] = useState([{ name: '', diagnosis: '', timesPerDay: 1 }]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const docId = searchParams.get('doctorId');
    if (docId) setDoctorId(docId);
  }, [searchParams]);

  const addMed = () => setMeds(m => [...m, { name: '', diagnosis: '', timesPerDay: 1 }]);
  const updMed = (i: number, field: string, val: any) => 
    setMeds(m => m.map((med, idx) => idx === i ? { ...med, [field]: val } : med));

  const register = async () => {
    setLoading(true);
    const res = await fetch('/api/doctor/add-patient', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        doctorId, name, age, isChild, diagnosis, 
        medications: meds.filter(m => m.name) 
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.patientId) {
      alert(`Patient created! ID: ${data.patientId}\nSave this ID for the patient to log in.`);
      router.push(`/doctor/dashboard`);
    }
  };

  const S = {
    input: { width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: '12px 14px', color: '#e2e8f0', fontSize: 15, marginBottom: 12 },
    label: { fontSize: 12, fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: 6 },
    panel: { background: '#1e293b', borderRadius: 16, padding: 24, border: '1px solid #334155', marginBottom: 16 },
  };

  return (
    <main style={{ minHeight: '100vh', background: '#0f172a', color: '#e2e8f0', fontFamily: 'system-ui', padding: '20px 16px', paddingBottom: 60 }}>
      <header style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: 16, fontWeight: 700 }}>← Back</button>
        <div style={{ flex: 1, textAlign: 'center', fontWeight: 800, fontSize: 18 }}>New Patient</div>
        <div style={{ width: 50 }}></div>
      </header>

      <div style={{ maxWidth: 500, margin: '0 auto' }}>
        <div style={S.panel as React.CSSProperties}>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#60a5fa', marginBottom: 16 }}>Clinical Details</div>
          
          <label style={S.label as React.CSSProperties}>Doctor ID</label>
          <input value={doctorId} onChange={e => setDoctorId(e.target.value)} placeholder="Your Doctor ID" style={S.input as React.CSSProperties} />
          
          <label style={S.label as React.CSSProperties}>Patient Name</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Adebayo Johnson" style={S.input as React.CSSProperties} />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={S.label as React.CSSProperties}>Age</label>
              <input value={age} onChange={e => setAge(e.target.value)} placeholder="e.g. 45" style={S.input as React.CSSProperties} />
            </div>
            <div>
              <label style={S.label as React.CSSProperties}>Primary Diagnosis</label>
              <input value={diagnosis} onChange={e => setDiagnosis(e.target.value)} placeholder="e.g. Hypertension" style={S.input as React.CSSProperties} />
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10, padding: 12, background: '#0f172a', borderRadius: 8 }}>
            <input type="checkbox" checked={isChild} onChange={e => setIsChild(e.target.checked)} style={{ width: 20, height: 20 }} />
            <span style={{ fontSize: 14, fontWeight: 600 }}>Paediatric Patient (Caregiver managed)</span>
          </label>
        </div>

        <div style={S.panel as React.CSSProperties}>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#34d399', marginBottom: 16 }}>Prescriptions</div>
          
          {meds.map((med, i) => (
            <div key={i} style={{ background: '#0f172a', padding: 16, borderRadius: 12, marginBottom: 12, border: '1px solid #334155' }}>
              <label style={S.label as React.CSSProperties}>Drug Name (Mapped via HOLON)</label>
              <input value={med.name} onChange={e => updMed(i, 'name', e.target.value)} placeholder="e.g. Amlodipine" style={S.input as React.CSSProperties} />
              
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                <div>
                  <label style={S.label as React.CSSProperties}>Target Condition</label>
                  <input value={med.diagnosis} onChange={e => updMed(i, 'diagnosis', e.target.value)} placeholder="e.g. BP Control" style={S.input as React.CSSProperties} />
                </div>
                <div>
                  <label style={S.label as React.CSSProperties}>Doses/Day</label>
                  <input type="number" min={1} max={4} value={med.timesPerDay} onChange={e => updMed(i, 'timesPerDay', +e.target.value)} style={S.input as React.CSSProperties} />
                </div>
              </div>
            </div>
          ))}

          <button onClick={addMed} style={{ width: '100%', background: '#334155', color: '#e2e8f0', border: 'none', borderRadius: 8, padding: '12px 0', fontWeight: 700, fontSize: 14 }}>
            + Add Another Medication
          </button>
        </div>

        <button 
          onClick={register} 
          disabled={loading || !name || !doctorId}
          style={{ width: '100%', background: '#2563eb', color: 'white', border: 'none', borderRadius: 12, padding: '16px 0', fontWeight: 800, fontSize: 16, opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Provisioning Twin via HOLON...' : 'Register Patient & Generate Twin'}
        </button>
      </div>
    </main>
  );
}

export default function AddPatient() {
  return (
    <Suspense fallback={<div style={{ background: '#0f172a', color: '#e2e8f0', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
      <AddPatientContent />
    </Suspense>
  );
}