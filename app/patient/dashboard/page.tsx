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

  // High-impact feature states
  const [simDays, setSimDays] = useState(3);
  const [whatIfData, setWhatIfData] = useState<any>(null);
  const [simulating, setSimulating] = useState(false);
  const [telemetry, setTelemetry] = useState<any[]>([]);
  const [fetchingTelemetry, setFetchingTelemetry] = useState(false);

  const load = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId: id }),
      });
      const json = await res.json();
      setData(json);
      loadTelemetry(id);
    } catch (err) {
      console.error('Failed to load patient twin:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTelemetry = async (id: string) => {
    setFetchingTelemetry(true);
    try {
      const res = await fetch('/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId: id })
      });
      const json = await res.json();
      if (json.success) setTelemetry(json.telemetryStreams);
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingTelemetry(false);
    }
  };

  const runWhatIf = async (days: number) => {
    setSimDays(days);
    setSimulating(true);
    try {
      const res = await fetch('/api/what-if', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId, simulatedMissedDays: days })
      });
      const json = await res.json();
      if (json.success) setWhatIfData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setSimulating(false);
    }
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
        <div style={{ background: '#111827', borderRadius: 24, padding: 40, width: '100%', maxWidth: 440, border: '1px solid #1f2937', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)' }}>
          <div style={{ fontWeight: 900, fontSize: 28, color: '#38bdf8', marginBottom: 8, textAlign: 'center', letterSpacing: '-0.025em' }}>AdhereTwin</div>
          <div style={{ fontSize: 14, color: '#9ca3af', marginBottom: 32, textAlign: 'center', lineHeight: 1.6 }}>Enter your Patient ID to access your digital biometric twin</div>
          
          <label style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Patient ID</label>
          <input 
            value={inputId} 
            onChange={e => setInputId(e.target.value)} 
            placeholder="e.g. uuid-patient-id" 
            style={{ width: '100%', background: '#030712', border: '1px solid #374151', borderRadius: 14, padding: '16px', color: '#f8fafc', fontSize: 15, marginBottom: 20, outline: 'none', boxSizing: 'border-box' }} 
          />
          <button 
            onClick={() => { setPatientId(inputId); load(inputId); }} 
            disabled={!inputId.trim() || loading} 
            style={{ width: '100%', background: '#0284c7', color: 'white', border: 'none', borderRadius: 14, padding: '16px', fontWeight: 800, fontSize: 16, cursor: 'pointer', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)' }}
          >
            {loading ? 'Syncing Biometric Twin...' : 'Access Digital Twin'}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', background: '#090d16', color: '#f8fafc', fontFamily: 'system-ui', paddingBottom: 80 }}>
      {/* Header Banner */}
      <header style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)', padding: '36px 24px 44px 24px', borderBottomLeftRadius: 32, borderBottomRightRadius: 32, boxShadow: '0 15px 30px -10px rgba(0,0,0,0.5)' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 12, color: '#7dd3fc', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Patient Dashboard</div>
            <div style={{ fontSize: 30, fontWeight: 900, color: 'white', letterSpacing: '-0.02em' }}>{data.patient.name}</div>
          </div>
          <div style={{ textAlign: 'right', background: 'rgba(15, 23, 42, 0.65)', padding: '14px 20px', borderRadius: 18, border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}>
            <div style={{ fontSize: 32, fontWeight: 900, color: data.adherenceRate < 50 ? '#f87171' : data.adherenceRate < 80 ? '#fb923c' : '#34d399', lineHeight: 1 }}>
              {data.adherenceRate}%
            </div>
            <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>Adherence</div>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 20px', boxSizing: 'border-box' }}>
        
        {/* Adherence Notification Card */}
        {data.adherenceRate === 100 ? (
          <div style={{ background: '#064e3b', borderRadius: 20, padding: 22, border: '1px solid #059669', marginTop: -22, marginBottom: 24, boxShadow: '0 10px 25px -5px rgba(5, 150, 105, 0.2)' }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#34d399', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>Fantastic job! 100% Adherence</span> 🎉
            </div>
            <div style={{ fontSize: 13, color: '#a7f3d0', lineHeight: 1.6 }}>
              You have maintained complete adherence to your care plan. Your digital twin is fully optimized and your body is receiving maximum pharmacological protection.
            </div>
          </div>
        ) : (
          <div style={{ background: '#451a03', borderRadius: 20, padding: 22, border: '1px solid #ea580c', marginTop: -22, marginBottom: 24, boxShadow: '0 10px 25px -5px rgba(234, 88, 12, 0.2)' }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#fb923c', marginBottom: 6 }}>
              Your {data.adherenceRate}% adherence rate needs attention
            </div>
            <div style={{ fontSize: 13, color: '#fed7aa', lineHeight: 1.6 }}>
              Missing doses allows your condition to progress without protection. Take your next scheduled dose now to stabilize your digital twin state.
            </div>
          </div>
        )}

        {/* Digital Twin Map Container */}
        <div style={{ background: '#111827', borderRadius: 24, padding: 24, border: '1px solid #1f2937', marginBottom: 24, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)' }}>
          <div style={{ fontWeight: 800, fontSize: 13, color: '#94a3b8', marginBottom: 16, textAlign: 'center', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Digital Twin Organ Mapping</div>
          <BodyMap affectedOrgans={affectedOrgans} />
        </div>

        {/* What-If Counterfactual Simulation Widget */}
        <div style={{ background: '#111827', borderRadius: 24, padding: 24, border: '1px solid #1f2937', marginBottom: 24, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)' }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: '#38bdf8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>⚡ Ontomorph Predictive Twin Engine</div>
          <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 16 }}>Simulate future physiological degradation based on projected non-adherence:</div>
          
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {[1, 3, 7, 14].map(days => (
              <button 
                key={days}
                onClick={() => runWhatIf(days)}
                disabled={simulating}
                style={{ flex: 1, background: simDays === days ? '#0284c7' : '#1f2937', color: 'white', border: 'none', borderRadius: 10, padding: '10px 0', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}
              >
                +{days}d Missed
              </button>
            ))}
          </div>

          {whatIfData && (
            <div style={{ background: '#030712', borderRadius: 14, padding: 16, border: '1px solid #374151' }}>
              <div style={{ fontSize: 12, color: '#fb923c', fontWeight: 700, marginBottom: 6 }}>GEMINI PREDICTIVE INSIGHT:</div>
              <div style={{ fontSize: 13, color: '#e2e8f0', lineHeight: 1.5, marginBottom: 12 }}>{whatIfData.aiWarning}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {whatIfData.simulationResults.map((res: any, idx: number) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#9ca3af', background: '#111827', padding: '8px 12px', borderRadius: 8 }}>
                    <span>Target Organ: <strong style={{ color: '#fff' }}>{res.organ}</strong></span>
                    <span>Stress Index: <strong style={{ color: res.degradationScore > 75 ? '#f87171' : '#34d399' }}>{res.degradationScore}% ({res.riskLevel})</strong></span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Molecular & Cellular Telemetry Stream */}
        <div style={{ background: '#111827', borderRadius: 24, padding: 24, border: '1px solid #1f2937', marginBottom: 24, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🧬 Ontomorph Cellular Telemetry</div>
            <button 
              onClick={() => loadTelemetry(patientId)}
              style={{ background: '#1f2937', color: '#38bdf8', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
            >
              {fetchingTelemetry ? 'Syncing...' : 'Refresh ↻'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {telemetry.length === 0 ? (
              <div style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', padding: 12 }}>Telemetry streams initialized.</div>
            ) : (
              telemetry.map((stream: any, idx: number) => (
                <div key={idx} style={{ background: '#030712', border: '1px solid #1f2937', borderRadius: 14, padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontWeight: 800, fontSize: 14, color: '#fff' }}>{stream.medicationName} <span style={{ fontSize: 12, color: '#38bdf8' }}>({stream.targetOrgan})</span></span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: stream.plasmaConcentration < 50 ? '#f87171' : '#34d399' }}>{stream.statusReport}</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 10 }}>
                    <div style={{ background: '#111827', padding: '8px 10px', borderRadius: 8, textAlign: 'center' }}>
                      <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase' }}>Plasma Level</div>
                      <div style={{ fontSize: 15, fontWeight: 900, color: '#38bdf8', marginTop: 2 }}>{stream.plasmaConcentration}%</div>
                    </div>
                    <div style={{ background: '#111827', padding: '8px 10px', borderRadius: 8, textAlign: 'center' }}>
                      <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase' }}>Cytokines</div>
                      <div style={{ fontSize: 15, fontWeight: 900, color: stream.inflammatoryCytokines > 200 ? '#f87171' : '#fb923c', marginTop: 2 }}>{stream.inflammatoryCytokines} pg/mL</div>
                    </div>
                    <div style={{ background: '#111827', padding: '8px 10px', borderRadius: 8, textAlign: 'center' }}>
                      <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase' }}>Resilience</div>
                      <div style={{ fontSize: 15, fontWeight: 900, color: '#34d399', marginTop: 2 }}>{stream.cellularResilience}%</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Prescription Section Title */}
        <div style={{ fontWeight: 800, fontSize: 18, color: '#f8fafc', marginBottom: 14, paddingLeft: 4, letterSpacing: '-0.01em' }}>Today's Prescriptions</div>
        
        {/* Prescription Cards List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {data.medications.map((med: any) => {
            const isMissed = med.missedStreak > 0;
            return (
              <div key={med.id} style={{ background: isMissed ? '#2a1215' : '#111827', border: `1px solid ${isMissed ? '#991b1b' : '#1f2937'}`, borderRadius: 20, padding: 22, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
                  <div style={{ fontWeight: 800, fontSize: 18, color: '#f8fafc', letterSpacing: '-0.01em' }}>{med.name}</div>
                  {med.streakDays > 0 && (
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#34d399', background: 'rgba(52, 211, 153, 0.1)', padding: '5px 12px', borderRadius: 10, border: '1px solid rgba(52, 211, 153, 0.2)' }}>
                      🔥 {med.streakDays}d Streak
                    </div>
                  )}
                </div>
                
                <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>{med.times_per_day || med.timesPerDay}x Daily</span>
                  <span>•</span>
                  <span>Protects: <strong style={{ color: '#38bdf8' }}>{med.organ}</strong></span>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <button 
                    onClick={() => handleLogDose(med.id, med.organ, 'taken')} 
                    disabled={logging === med.id} 
                    style={{ flex: 1, background: '#059669', color: 'white', border: 'none', borderRadius: 14, padding: '14px 0', fontWeight: 800, fontSize: 15, cursor: 'pointer', boxShadow: '0 4px 12px rgba(5, 150, 105, 0.2)' }}
                  >
                    {logging === med.id ? 'Recording...' : 'Take Dose ✓'}
                  </button>
                  <button 
                    onClick={() => handleLogDose(med.id, med.organ, 'missed')} 
                    disabled={logging === med.id} 
                    style={{ flex: 1, background: '#111827', color: '#f87171', border: '1px solid #7f1d1d', borderRadius: 14, padding: '14px 0', fontWeight: 800, fontSize: 15, cursor: 'pointer' }}
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