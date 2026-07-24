// app/patient/dashboard/page.tsx
'use client';
import { useState } from 'react';
import BodyMap from '@/components/BodyMap';

export default function PatientDashboard() {
  const [patientId, setPatientId] = useState('');
  const [inputId, setInputId] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [logging, setLogging] = useState<string | null>(null);

  const load = async (id: string) => {
    setLoading(true);
    const res = await fetch('/api/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId: id }),
    });
    const json = await res.json();
    setData(json);
    setLoading(false);
  };

  const handleLogDose = async (medicationId: string, organ: string, status: 'taken' | 'missed') => {
    try {
      setLogging(medicationId);
      const res = await fetch('/api/patient/dose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: patientId || localStorage.getItem('currentPatientId') || '',
          medicationId,
          status,
          organ
        }),
      });

      const resData = await res.json();
      if (resData.success) {
        await load(patientId || localStorage.getItem('currentPatientId') || '');
      } else {
        alert(`Error: ${resData.error}`);
      }
    } catch (err) {
      console.error('Failed to log dose:', err);
    } finally {
      setLogging(null);
    }
  };

  const affectedOrgans = data?.simResults?.reduce((acc: any, r: any) => {
    acc[r.organ] = r; return acc;
  }, {}) || {};

  if (!patientId || !data) {
    return (
      <main style={{ minHeight: '100vh', background: '#090d16', color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: 'system-ui' }}>
        <div style={{ background: '#111827', borderRadius: 20, padding: 32, width: '100%', maxWidth: 420, border: '1px solid #1f2937', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
          <div style={{ fontWeight: 900, fontSize: 24, color: '#38bdf8', marginBottom: 8, textAlign: 'center' }}>AdhereTwin</div>
          <div style={{ fontSize: 14, color: '#9ca3af', marginBottom: 24, textAlign: 'center' }}>Enter your Patient ID to access your digital twin</div>
          <input 
            value={inputId} 
            onChange={e => setInputId(e.target.value)} 
            placeholder="e.g. uuid-patient-id" 
            style={{ width: '100%', background: '#030712', border: '1px solid #374151', borderRadius: 12, padding: '16px', color: '#f8fafc', fontSize: 15, marginBottom: 16, outline: 'none' }} 
          />
          <button 
            onClick={() => { setPatientId(inputId); load(inputId); }} 
            disabled={!inputId.trim() || loading} 
            style={{ width: '100%', background: '#0284c7', color: 'white', border: 'none', borderRadius: 12, padding: '16px', fontWeight: 800, fontSize: 16, cursor: 'pointer', transition: 'background 0.2s' }}
          >
            {loading ? 'Syncing Biometric Twin...' : 'Access Digital Twin'}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', background: '#090d16', color: '#f8fafc', fontFamily: 'system-ui', paddingBottom: 60 }}>
      <header style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)', padding: '28px 20px 36px 20px', borderBottomLeftRadius: 28, borderBottomRightRadius: 28, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, color: '#7dd3fc', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Patient Dashboard</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: 'white', marginTop: 2 }}>{data.patient.name}</div>
          </div>
          <div style={{ textAlign: 'right', background: 'rgba(15, 23, 42, 0.6)', padding: '10px 16px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: data.adherenceRate < 50 ? '#f87171' : data.adherenceRate < 80 ? '#fb923c' : '#34d399' }}>
              {data.adherenceRate}%
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Adherence</div>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 16px' }}>
        
        {data.adherenceRate === 100 ? (
          <div style={{ background: '#064e3b', borderRadius: 16, padding: 20, border: '1px solid #059669', marginTop: -16, marginBottom: 20, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)' }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#34d399', marginBottom: 6 }}>
              Fantastic job! 100% Adherence 🎉
            </div>
            <div style={{ fontSize: 13, color: '#a7f3d0', lineHeight: 1.5 }}>
              You have maintained complete adherence to your care plan. Your digital twin is fully optimized and your body is receiving maximum protection.
            </div>
          </div>
        ) : (
          <div style={{ background: '#451a03', borderRadius: 16, padding: 20, border: '1px solid #ea580c', marginTop: -16, marginBottom: 20, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)' }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#fb923c', marginBottom: 6 }}>
              Your {data.adherenceRate}% adherence rate needs attention
            </div>
            <div style={{ fontSize: 13, color: '#fed7aa', lineHeight: 1.5 }}>
              Missing doses allows your condition to progress without protection. Take your next scheduled dose now.
            </div>
          </div>
        )}

        <div style={{ background: '#111827', borderRadius: 20, padding: 24, border: '1px solid #1f2937', marginBottom: 20, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#94a3b8', marginBottom: 16, textAlign: 'center', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Your Digital Twin Anatomy</div>
          <BodyMap affectedOrgans={affectedOrgans} />
        </div>

        <div style={{ fontWeight: 800, fontSize: 18, color: '#f8fafc', marginBottom: 14, paddingLeft: 4 }}>Prescription Tracker</div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {data.medications.map((med: any) => {
            const isMissed = med.missedStreak > 0;
            return (
              <div key={med.id} style={{ background: isMissed ? '#2a1215' : '#111827', border: `1px solid ${isMissed ? '#991b1b' : '#1f2937'}`, borderRadius: 18, padding: 20, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' }}>
                  <div style={{ fontWeight: 800, fontSize: 18, color: '#f8fafc' }}>{med.name}</div>
                  {med.streakDays > 0 && (
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#34d399', background: 'rgba(52, 211, 153, 0.1)', padding: '4px 10px', borderRadius: 8, border: '1px solid rgba(52, 211, 153, 0.2)' }}>
                      🔥 {med.streakDays}d Streak
                    </div>
                  )}
                </div>
                
                <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 16 }}>
                  {med.times_per_day || med.timesPerDay}x Daily • Target Organ: <strong style={{ color: '#38bdf8' }}>{med.organ}</strong>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button 
                    onClick={() => handleLogDose(med.id, med.organ, 'taken')} 
                    disabled={logging === med.id} 
                    style={{ flex: 1, background: '#059669', color: 'white', border: 'none', borderRadius: 12, padding: '12px 0', fontWeight: 800, fontSize: 14, cursor: 'pointer', transition: 'background 0.2s' }}
                  >
                    {logging === med.id ? 'Recording...' : 'Take Dose ✓'}
                  </button>
                  <button 
                    onClick={() => handleLogDose(med.id, med.organ, 'missed')} 
                    disabled={logging === med.id} 
                    style={{ flex: 1, background: '#111827', color: '#f87171', border: '1px solid #7f1d1d', borderRadius: 12, padding: '12px 0', fontWeight: 800, fontSize: 14, cursor: 'pointer', transition: 'background 0.2s' }}
                  >
                    {logging === med.id ? 'Recording...' : 'Missed ✕'}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}