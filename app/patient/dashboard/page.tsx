// app/patient/dashboard/page.tsx
'use client';
import { useState } from 'react';

// Exact coordinate map from your doctor dashboard
const ORGAN_POS: Record<string, {x:number;y:number;r:number;label:string}> = {
  'Brain & Nervous System': {x:50,y:10,r:9,  label:'Brain'  },
  'Heart':                  {x:44,y:33,r:5.5,label:'Heart'  },
  'Lungs':                  {x:57,y:31,r:4.5,label:'Lungs'  },
  'Liver':                  {x:44,y:43,r:4.5,label:'Liver'  },
  'Blood':                  {x:57,y:43,r:3.5,label:'Blood'  },
  'Kidneys':                {x:50,y:55,r:4,  label:'Kidneys'},
  'Hormonal System':        {x:40,y:54,r:3,  label:'Thyroid'},
  'Immune System':          {x:60,y:54,r:3,  label:'Immune' },
  'Bones & Muscles':        {x:50,y:68,r:4.5,label:'Bones'  },
};

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
    await load(patientId); // Reload twin data to reflect dose
    setLogging(null);
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
      {/* App Header */}
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
        
        {/* Gemini Narrative Card */}
        {data.narrative && (
          <div style={{ background: '#1a2744', borderRadius: 16, padding: 20, border: '1px solid #2563eb', position: 'relative', zIndex: 10, marginTop: 10, marginBottom: 20, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)' }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#60a5fa', marginBottom: 8 }}>
              {data.narrative.headline}
            </div>
            <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6, marginBottom: 12 }}>
              {data.narrative.bodyText}
            </div>
            <div style={{ background: '#2563eb', borderRadius: 8, padding: '10px 14px', fontSize: 14, color: 'white', fontWeight: 700 }}>
              {data.narrative.callToAction}
            </div>
          </div>
        )}

        {/* Body Twin SVG */}
        <div style={S.panel as React.CSSProperties}>
          <div style={{ fontWeight: 800, fontSize: 15, color: '#94a3b8', marginBottom: 16, textAlign: 'center' }}>Your Digital Twin</div>
          <svg viewBox="0 0 100 90" style={{ width: '100%', maxHeight: 300 }}>
            <ellipse cx="50" cy="14" rx="10" ry="11" fill="#1e3a5f" stroke="#334155" strokeWidth="0.5"/>
            <rect x="37" y="24" width="26" height="35" rx="4" fill="#1e3a5f" stroke="#334155" strokeWidth="0.5"/>
            <rect x="24" y="25" width="12" height="26" rx="4" fill="#1e3a5f" stroke="#334155" strokeWidth="0.5"/>
            <rect x="64" y="25" width="12" height="26" rx="4" fill="#1e3a5f" stroke="#334155" strokeWidth="0.5"/>
            <rect x="38" y="59" width="10" height="28" rx="4" fill="#1e3a5f" stroke="#334155" strokeWidth="0.5"/>
            <rect x="52" y="59" width="10" height="28" rx="4" fill="#1e3a5f" stroke="#334155" strokeWidth="0.5"/>
            
            {Object.entries(ORGAN_POS).map(([organ, pos]) => {
              const sim = affectedOrgans[organ];
              const color = sim ? sim.colourHex : '#22c55e';
              return (
                <g key={organ}>
                  <circle cx={pos.x} cy={pos.y} r={pos.r} fill={`${color}${sim ? 'aa' : '33'}`} stroke={color} strokeWidth={sim ? 2 : 1}/>
                  <text x={pos.x} y={pos.y + 1} textAnchor="middle" fontSize="3" fill="white" fontWeight="bold">
                    {pos.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Actionable Medication Cards */}
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
                  {med.timesPerDay}x Daily • Protects: <strong style={{ color: '#60a5fa' }}>{med.organ}</strong>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <button onClick={() => logDose(med.id, 'taken', med.organ)} disabled={logging === med.id} style={{ background: '#166534', color: 'white', border: 'none', borderRadius: 12, padding: '14px 0', fontWeight: 800, fontSize: 15 }}>
                    ✓ Taken
                  </button>
                  <button onClick={() => logDose(med.id, 'missed', med.organ)} disabled={logging === med.id} style={{ background: 'transparent', color: '#ef4444', border: '2px solid #ef4444', borderRadius: 12, padding: '14px 0', fontWeight: 800, fontSize: 15 }}>
                    ✗ Missed
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