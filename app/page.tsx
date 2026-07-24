// app/page.tsx
'use client';
import { useRouter } from 'next/navigation';

export default function AppEntry() {
  const router = useRouter();

  const S = {
    page: { minHeight: '100vh', background: '#0f172a', color: '#e2e8f0', fontFamily: 'system-ui', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 },
    card: { width: '100%', maxWidth: 400, background: '#1e293b', border: '1px solid #334155', borderRadius: 16, padding: 30, textAlign: 'center', marginBottom: 20, cursor: 'pointer', transition: 'transform 0.1s' },
  };

  return (
    <main style={S.page as React.CSSProperties}>
      <div style={{ marginBottom: 40, textAlign: 'center' }}>
        <div style={{ background: '#2563eb', display: 'inline-block', borderRadius: 12, padding: '10px 20px', fontWeight: 900, fontSize: 32, color: 'white', marginBottom: 10 }}>AT</div>
        <div style={{ fontWeight: 800, fontSize: 28, color: '#60a5fa' }}>AdhereTwin</div>
        <div style={{ fontSize: 14, color: '#94a3b8' }}>Real-time physiological consequence engine</div>
      </div>

      <div 
        style={S.card as React.CSSProperties} 
        onClick={() => router.push('/patient/dashboard')}
      >
        <div style={{ fontSize: 40, marginBottom: 10 }}>👤</div>
        <div style={{ fontWeight: 800, fontSize: 20, color: '#e2e8f0' }}>I am a Patient</div>
        <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 5 }}>Log doses and view my body twin</div>
      </div>

      <div 
        style={S.card as React.CSSProperties} 
        onClick={() => router.push('/doctor/dashboard')}
      >
        <div style={{ fontSize: 40, marginBottom: 10 }}>🩺</div>
        <div style={{ fontWeight: 800, fontSize: 20, color: '#60a5fa' }}>I am a Doctor</div>
        <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 5 }}>Monitor patient adherence panel</div>
      </div>
    </main>
  );
}