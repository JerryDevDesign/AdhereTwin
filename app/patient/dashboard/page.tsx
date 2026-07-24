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

  const logDose = async (medicationId: string, status: 'taken' | 'missed', organ: string) => {
    setLogging(medicationId);
    await fetch('/api/patient/dose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId, medicationId, status, organ }),
    });
    await load(patientId); 
    setLogging(null);
  };

  const handleLogDose = async (medicationId: string, organ: string, status: 'taken' | 'missed') => {
    try {
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
        alert(`Dose recorded as ${status}!`);
        await load(patientId || localStorage.getItem('currentPatientId') || '');
      } else {
        alert(`Error: ${resData.error}`);
      }
    } catch (err) {
      console.error('Failed to log dose:', err);
    }
  };

  const affectedOrgans = data?.simResults?.reduce((acc: any, r: any) => {
    acc[r.organ] = r; return acc;
  }, {}) || {};

  const S = {
    page: { minHeight: '100vh', background: '#0f172a', color: '#e2e8f0', fontFamily: 'system-ui', padding: '0 0 80px 0' },
    panel: { background: '#1e293b', borderRadius: 16, padding: 20, border: '1px solid #334155', marginBottom: 16 },
  };

  if (!patientId || !data) {
    return (
      <main style={{ ...S.page as React.CSSProperties, padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ ...S.panel as React.CSSProperties, width: '100%', maxWidth: 400 }}>
          <div style={{ fontWeight: 800, fontSize: 20, color: '#60a5fa', marginBottom: 20, textAlign: 'center' }}>Access Your Twin</div>
          <input value={inputId} onChange={e => setInputId(e.target.value)} placeholder="Enter your Patient ID" style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: 12, padding: '16px', color: '#e2e8f0', fontSize: 16, marginBottom: 16 }} />
          <button onClick={() => { setPatientId(inputId); load(inputId); }} disabled={!inputId.trim() || loading} style={{ width: '100%', background: '#2563eb', color: 'white', border: 'none', borderRadius: 12, padding: '16px', fontWeight: 800, fontSize: 16 }}>
            {loading ? 'Syncing Twin...' : 'Enter App'}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={S.page as React.CSSProperties}>
      <header style={{ background: '#1e3a5f', padding: '20px 20px 30px 20px', borderBottomLeftRadius: 24, borderBottomRightRadius: 24, marginBottom: -20, boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, color: '#93c5fd', fontWeight: 600 }}>Welcome back,</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: 'white' }}>{data.patient.name}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 32, fontWeight: 900, color: data.adherenceRate < 50 ? '#ef4444' : data.adherenceRate < 80 ? '#f97316' : '#34d399' }}>
              {data.adherenceRate}%
            </div>
            <div style={{ fontSize: 11, color: '#cbd5e1' }}>Adherence</div>
          </div>
        </div>
      </header>

      <div style={{ padding: '0 16px' }}>
        
        {data.adherenceRate === 100 ? (
          <div style={{ background: '#065f46', borderRadius: 16, padding: 20, border: '1px solid #059669', position: 'relative', zIndex: 10, marginTop: 10, marginBottom: 20, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)' }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#34d399', marginBottom: 8 }}>
              Fantastic job! 100% Adherence 🎉
            </div>
            <div style={{ fontSize: 13, color: '#a7f3d0', lineHeight: 1.6, marginBottom: 12 }}>
              You have maintained complete adherence to your care plan. Your digital twin is fully optimized and your body is receiving maximum protection.
            </div>
          </div>
        ) : (
          <div style={{ background: '#2d1a1a', borderRadius: 16, padding: 20, border: '1px solid #ef4444', position: 'relative', zIndex: 10, marginTop: 10, marginBottom: 20, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)' }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#f87171', marginBottom: 8 }}>
              Your {data.adherenceRate}% adherence rate needs attention
            </div>
            <div style={{ fontSize: 13, color: '#fca5a5', lineHeight: 1.6, marginBottom: 12 }}>
              Missing doses allows your condition to progress without protection. Take your next scheduled dose now.
            </div>
          </div>
        )}

        <div style={S.panel as React.CSSProperties}>
          <div style={{ fontWeight: 800, fontSize: 15, color: '#94a3b8', marginBottom: 16, textAlign: 'center' }}>Your Digital Twin</div>
          
          <BodyMap affectedOrgans={affectedOrgans} />
          
        </div>

        <div style={{ fontWeight: 800, fontSize: 18, color: '#e2e8f0', marginBottom: 12, paddingLeft: 4 }}>Today's Doses</div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {data.medications.map((med: any) => {
            const isMissed = med.missedStreak > 0;
            return (
              <div key={med.id} style={{ background: isMissed ? '#2d1a1a' : '#1e293b', border: `1px solid ${isMissed ? '#ef4444' : '#334155'}`, borderRadius: 16, padding: 20 }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ fontWeight: 800, fontSize: 18, color: '#f8fafc' }}>{med.name}</div>
                  {med.streakDays > 0 && <div style={{ fontSize: 12, fontWeight: 700, color: '#34d399', background: '#34d39922', padding: '4px 8px', borderRadius: 6 }}>🔥 {med.streakDays}d Streak</div>}
                </div>
                
                <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 16 }}>
                  {med.times_per_day || med.timesPerDay}x Daily • Protects: <strong style={{ color: '#60a5fa' }}>{med.organ}</strong>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <button onClick={() => logDose(med.id, 'taken', med.organ)} disabled={logging === med.id} style={{ background: '#166534', color: 'white', border: 'none', borderRadius: 12, padding: '14px 0', fontWeight: 800, fontSize: 15 }}>
                    ✓ Taken
                  </button>
                  <button onClick={() => logDose(med.id, 'missed', med.organ)} disabled={logging === med.id} style={{ background: 'transparent', color: '#ef4444', border: '2px solid #ef4444', borderRadius: 12, padding: '14px 0', fontWeight: 800, fontSize: 15 }}>
                    ✗ Missed
                  </button>
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button 
                    onClick={() => handleLogDose(med.id, med.organ, 'taken')}
                    style={{ background: '#059669', color: 'white', padding: '8px 16px', borderRadius: 8, border: 'none', fontWeight: 700, cursor: 'pointer', flex: 1 }}
                  >
                    Take Dose ✓
                  </button>
                  <button 
                    onClick={() => handleLogDose(med.id, med.organ, 'missed')}
                    style={{ background: '#dc2626', color: 'white', padding: '8px 16px', borderRadius: 8, border: 'none', fontWeight: 700, cursor: 'pointer', flex: 1 }}
                  >
                    Missed ✕
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