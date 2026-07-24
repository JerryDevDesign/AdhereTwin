// app/doctor/dashboard/page.tsx
'use client';
import { useState } from 'react';
import BodyMap from '@/components/BodyMap';

export default function DoctorDashboard() {
  const [doctorId, setDoctorId]   = useState('');
  const [inputId,  setInputId]    = useState('');
  const [patients, setPatients]   = useState<any[]>([]);
  const [loading,  setLoading]    = useState(false);
  const [selected, setSelected]   = useState<any>(null);
  const [simData,  setSimData]    = useState<any>(null);

  const load = async (id: string) => {
    setLoading(true);
    const res  = await fetch(`/api/doctor/patients?doctorId=${id}`);
    const data = await res.json();
    setPatients(data.patients || []);
    setLoading(false);
  };

  const openPatient = async (patient: any) => {
    setSelected(patient);
    const res  = await fetch('/api/simulate', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ patientId: patient.id }),
    });
    const data = await res.json();
    setSimData(data);
  };

  const critical  = patients.filter(p => p.adherenceRate < 50);
  const warning   = patients.filter(p => p.adherenceRate >= 50 && p.adherenceRate < 80);
  const good      = patients.filter(p => p.adherenceRate >= 80);

  const S = {
    page:  { minHeight:'100vh', background:'#0f172a', color:'#e2e8f0',
             fontFamily:'system-ui' },
    panel: { background:'#1e293b', borderRadius:12, padding:20,
             border:'1px solid #334155' },
    card:  (rate: number) => ({
             background: '#1e293b',
             border: `1px solid ${rate < 50 ? '#ef4444' : rate < 80 ? '#f97316' : '#22c55e'}`,
             borderRadius:10, padding:14, cursor:'pointer',
             transition:'all 0.15s',
           } as React.CSSProperties),
    rate:  (rate: number) => ({
             fontSize:28, fontWeight:900,
             color: rate < 50 ? '#ef4444' : rate < 80 ? '#f97316' : '#34d399',
           } as React.CSSProperties),
  };

  const affectedOrgans = simData?.simResults?.reduce((acc: any, r: any) => {
    acc[r.organ] = r; return acc;
  }, {}) || {};

  return (
    <main style={S.page}>
      <header style={{ background:'#1e3a5f', padding:'14px 32px',
                       borderBottom:'2px solid #2563eb',
                       display:'flex', alignItems:'center', gap:16 }}>
        <div style={{ background:'#2563eb', borderRadius:8, padding:'6px 14px',
                      fontWeight:900, fontSize:18, color:'white' }}>AT</div>
        <div>
          <div style={{ fontWeight:800, fontSize:20, color:'#60a5fa' }}>
            AdhereTwin — Doctor Dashboard
          </div>
          <div style={{ fontSize:12, color:'#94a3b8' }}>
            Real-time adherence monitoring across your patient panel
          </div>
        </div>
        {doctorId && (
          <button
            onClick={() => window.location.href = '/doctor/add-patient?doctorId=' + doctorId}
            style={{ marginLeft:'auto', background:'#2563eb', color:'white',
                     border:'none', borderRadius:8, padding:'8px 16px',
                     fontWeight:700, fontSize:13, cursor:'pointer' }}>
            + Add Patient
          </button>
        )}
      </header>

      <div style={{ maxWidth:1400, margin:'0 auto', padding:'24px 20px' }}>
        {!doctorId && (
          <div style={{ ...S.panel, maxWidth:440, margin:'60px auto' }}>
            <div style={{ fontWeight:700, fontSize:16, color:'#60a5fa', marginBottom:16 }}>
              Doctor Login
            </div>
            <input value={inputId} onChange={e => setInputId(e.target.value)}
                   placeholder="Enter your Doctor ID"
                   style={{ width:'100%', background:'#0f172a',
                            border:'1px solid #334155', borderRadius:6,
                            padding:'10px 14px', color:'#e2e8f0',
                            fontSize:14, marginBottom:12 }} />
            <button
              onClick={() => { setDoctorId(inputId); load(inputId); }}
              disabled={!inputId.trim()}
              style={{ width:'100%', background:'#2563eb', color:'white',
                       border:'none', borderRadius:8, padding:'10px 0',
                       fontWeight:700, fontSize:14, cursor:'pointer' }}>
              View My Patients
            </button>
          </div>
        )}

        {loading && (
          <div style={{ textAlign:'center', padding:60, color:'#94a3b8' }}>
            Loading patient panel…
          </div>
        )}

        {doctorId && !loading && (
          <div style={{ display:'grid',
                        gridTemplateColumns: selected ? '1fr 380px' : '1fr',
                        gap:20 }}>
            <div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)',
                            gap:12, marginBottom:20 }}>
                {[
                  { label:'Total Patients', value:patients.length,  color:'#60a5fa' },
                  { label:'Critical (<50%)', value:critical.length, color:'#ef4444' },
                  { label:'At Risk (<80%)',  value:warning.length,  color:'#f97316' },
                  { label:'On Track (≥80%)', value:good.length,    color:'#34d399' },
                ].map(s => (
                  <div key={s.label} style={{ ...S.panel, textAlign:'center' }}>
                    <div style={{ fontSize:32, fontWeight:900, color:s.color }}>
                      {s.value}
                    </div>
                    <div style={{ fontSize:11, color:'#94a3b8', marginTop:2 }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>

              {critical.length > 0 && (
                <div style={{ background:'#2d0f0f', border:'1px solid #ef4444',
                              borderRadius:10, padding:'12px 16px', marginBottom:16 }}>
                  <div style={{ fontWeight:700, color:'#ef4444', fontSize:13,
                                marginBottom:8 }}>
                    ⚠ Critical — Immediate Attention Required
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:8 }}>
                    {critical.map(p => (
                      <div key={p.id} onClick={() => openPatient(p)}
                           style={{ background:'#1e293b', borderRadius:6,
                                    padding:'8px 12px', cursor:'pointer',
                                    border:'1px solid #ef444444' }}>
                        <div style={{ fontWeight:700, color:'#e2e8f0' }}>{p.name}</div>
                        <div style={{ fontSize:11, color:'#94a3b8' }}>
                          {p.age} · {p.diagnosis}
                        </div>
                        <div style={{ fontSize:22, fontWeight:900, color:'#ef4444' }}>
                          {p.adherenceRate}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={S.panel}>
                <div style={{ fontWeight:700, fontSize:14, color:'#60a5fa', marginBottom:14 }}>
                  All Patients
                </div>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                  <thead>
                    <tr style={{ borderBottom:'1px solid #334155' }}>
                      {['Patient','Age','Diagnosis','Medications',
                        '7-Day Adherence','Status','Action'].map(h => (
                        <th key={h} style={{ padding:'6px 10px', textAlign:'left',
                                            color:'#94a3b8', fontWeight:600,
                                            fontSize:11 }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map((p, i) => (
                      <tr key={p.id}
                          style={{ borderBottom:'1px solid #1e293b',
                                   background: i % 2 ? '#1a2332' : 'transparent' }}>
                        <td style={{ padding:'10px', fontWeight:700, color:'#e2e8f0' }}>
                          {p.name}
                          {p.is_child && (
                            <span style={{ marginLeft:6, fontSize:10,
                                           background:'#7c3aed22', color:'#a78bfa',
                                           padding:'1px 5px', borderRadius:3 }}>
                              Paeds
                            </span>
                          )}
                        </td>
                        <td style={{ padding:'10px', color:'#94a3b8' }}>{p.age}</td>
                        <td style={{ padding:'10px', color:'#94a3b8' }}>{p.diagnosis}</td>
                        <td style={{ padding:'10px', color:'#94a3b8' }}>
                          {p.medications?.length || 0} drugs
                        </td>
                        <td style={{ padding:'10px' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <div style={{ flex:1, background:'#334155',
                                          borderRadius:4, height:6 }}>
                              <div style={{
                                width:`${p.adherenceRate}%`, height:6, borderRadius:4,
                                background: p.adherenceRate < 50 ? '#ef4444'
                                          : p.adherenceRate < 80 ? '#f97316'
                                          : '#22c55e',
                              }}/>
                            </div>
                            <span style={S.rate(p.adherenceRate) as React.CSSProperties}>
                              {p.adherenceRate}%
                            </span>
                          </div>
                        </td>
                        <td style={{ padding:'10px' }}>
                          <span style={{
                            fontSize:10, fontWeight:700, padding:'2px 8px',
                            borderRadius:4,
                            background: p.adherenceRate < 50 ? '#ef444422'
                                      : p.adherenceRate < 80 ? '#f9731622'
                                      : '#22c55e22',
                            color: p.adherenceRate < 50 ? '#ef4444'
                                 : p.adherenceRate < 80 ? '#f97316'
                                 : '#22c55e',
                          }}>
                            {p.adherenceRate < 50 ? 'CRITICAL'
                              : p.adherenceRate < 80 ? 'AT RISK'
                              : 'ON TRACK'}
                          </span>
                        </td>
                        <td style={{ padding:'10px' }}>
                          <button onClick={() => openPatient(p)} style={{
                            background:'#2563eb22', color:'#60a5fa',
                            border:'1px solid #2563eb44', borderRadius:6,
                            padding:'4px 10px', fontSize:11,
                            cursor:'pointer', fontWeight:600,
                          }}>
                            View Twin →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {selected && simData && (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                <div style={{ ...S.panel, display:'flex',
                              justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <div style={{ fontWeight:800, fontSize:15, color:'#e2e8f0' }}>
                      {selected.name}
                    </div>
                    <div style={{ fontSize:12, color:'#94a3b8' }}>
                      {selected.age} · {selected.diagnosis}
                    </div>
                  </div>
                  <button onClick={() => { setSelected(null); setSimData(null); }}
                          style={{ background:'#334155', color:'#94a3b8',
                                   border:'none', borderRadius:6, padding:'4px 10px',
                                   cursor:'pointer', fontSize:12 }}>
                    ✕ Close
                  </button>
                </div>

                <div style={S.panel}>
                  <div style={{ fontWeight:700, fontSize:12,
                                color:'#60a5fa', marginBottom:8 }}>
                    Body Twin — Affected Systems
                  </div>
                  
                  {/* THE NEW COMPONENT IS HERE */}
                  <BodyMap affectedOrgans={affectedOrgans} />
                  
                </div>

                {simData.narrative && (
                  <div style={{ ...S.panel, background:'#1a2744',
                                border:'1px solid #2563eb' }}>
                    <div style={{ fontWeight:700, fontSize:13,
                                  color:'#60a5fa', marginBottom:6 }}>
                      {simData.narrative.headline}
                    </div>
                    <div style={{ fontSize:12, color:'#cbd5e1',
                                  lineHeight:1.6, marginBottom:10 }}>
                      {simData.narrative.bodyText}
                    </div>
                    <div style={{ background:'#2563eb22', borderRadius:6,
                                  padding:'6px 10px', fontSize:12,
                                  color:'#93c5fd', fontWeight:600 }}>
                      → {simData.narrative.callToAction}
                    </div>
                  </div>
                )}

                {simData.simResults?.map((r: any, i: number) => (
                  <div key={i} style={{
                    ...S.panel,
                    borderColor: `${r.colourHex}44`,
                    background:  `${r.colourHex}11`,
                  }}>
                    <div style={{ display:'flex', justifyContent:'space-between',
                                  marginBottom:4 }}>
                      <span style={{ fontWeight:700, color:'#e2e8f0', fontSize:13 }}>
                        {r.organ}
                      </span>
                      <span style={{ fontSize:10, fontWeight:700,
                                     color:r.colourHex }}>{r.severity}</span>
                    </div>
                    <div style={{ fontSize:11, color:'#94a3b8' }}>
                      {r.medicationName} · {r.missedDays}d missed
                    </div>
                    <div style={{ fontSize:12, color:r.colourHex, marginTop:4 }}>
                      Risk: {r.riskLabel}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}