// app/doctor/dashboard/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DoctorDashboard() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [isChild, setIsChild] = useState(false);
  const router = useRouter();

  const fetchPatients = async () => {
    try {
      const res = await fetch('/api/doctor/patients');
      const data = await res.json();
      if (data.patients) setPatients(data.patients);
    } catch (err) {
      console.error('Failed to load patients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/doctor/add-patient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, age, diagnosis, isChild }),
      });
      const data = await res.json();
      if (data.success) {
        setName('');
        setAge('');
        setDiagnosis('');
        setIsChild(false);
        setShowAddModal(false);
        fetchPatients();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error('Failed to add patient:', err);
    }
  };

  return (
    <main style={{ minHeight: '100vh', background: '#090d16', color: '#f8fafc', padding: '40px 20px', fontFamily: 'system-ui' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 12, color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Clinical Command Center</div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: '4px 0 0 0' }}>Doctor Dashboard (OAUTHC)</h1>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            style={{ background: '#0284c7', color: 'white', border: 'none', borderRadius: 12, padding: '12px 20px', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}
          >
            + Register Patient
          </button>
        </div>

        {/* Add Patient Modal / Form Drawer */}
        {showAddModal && (
          <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 20, padding: 24, marginBottom: 28 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#f8fafc', marginBottom: 16 }}>Register New Patient</h3>
            <form onSubmit={handleAddPatient} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Patient Full Name" required style={{ background: '#030712', border: '1px solid #374151', borderRadius: 10, padding: '12px', color: '#fff', fontSize: 14 }} />
              <input value={age} onChange={e => setAge(e.target.value)} placeholder="Age (e.g. 45 or 8yo)" required style={{ background: '#030712', border: '1px solid #374151', borderRadius: 10, padding: '12px', color: '#fff', fontSize: 14 }} />
              <input value={diagnosis} onChange={e => setDiagnosis(e.target.value)} placeholder="Primary Diagnosis" required style={{ background: '#030712', border: '1px solid #374151', borderRadius: 10, padding: '12px', color: '#fff', fontSize: 14 }} />
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#9ca3af', cursor: 'pointer' }}>
                <input type="checkbox" checked={isChild} onChange={e => setIsChild(e.target.checked)} style={{ width: 16, height: 16 }} />
                Paediatric Profile (Enable Caregiver Alerts)
              </label>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="submit" style={{ background: '#059669', color: 'white', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 700, cursor: 'pointer' }}>Save Patient</button>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ background: '#374151', color: 'white', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Patients List */}
        <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 24, padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 20 }}>Managed Cohort ({patients.length})</h2>
          
          {loading ? (
            <div style={{ color: '#9ca3af', textAlign: 'center', padding: 40 }}>Loading clinical cohort...</div>
          ) : patients.length === 0 ? (
            <div style={{ color: '#9ca3af', textAlign: 'center', padding: 40 }}>No patients found. Register one above.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {patients.map(p => (
                <div key={p.id} style={{ background: '#030712', border: '1px solid #1f2937', borderRadius: 16, padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#f8fafc' }}>{p.name} {p.is_child && <span style={{ fontSize: 11, background: '#ea580c', color: 'white', padding: '2px 6px', borderRadius: 6 }}>Paediatric</span>}</div>
                    <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 4 }}>Diagnosis: <strong style={{ color: '#38bdf8' }}>{p.diagnosis || 'General Care'}</strong> • Age: {p.age}</div>
                    <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'monospace', marginTop: 4 }}>ID: {p.id}</div>
                  </div>
                  <button 
                    onClick={() => {
                      localStorage.setItem('currentPatientId', p.id);
                      router.push('/patient/dashboard');
                    }}
                    style={{ background: '#1e293b', border: '1px solid #334155', color: '#38bdf8', padding: '10px 16px', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                  >
                    View Digital Twin →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}