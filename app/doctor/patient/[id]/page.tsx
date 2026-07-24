// app/doctor/patient/[id]/page.tsx
'use content';
import { use } from 'react';

export default function PatientDetailView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <main style={{ minHeight: '100vh', background: '#0f172a', color: '#e2e8f0', padding: 24, fontFamily: 'system-ui' }}>
      <h1>Patient Twin Details</h1>
      <p>Patient ID: {id}</p>
    </main>
  );
}