// components/BodyMap.tsx
'use client';

export default function BodyMap({ affectedOrgans }: { affectedOrgans: any }) {
  const organsList = ['Heart', 'Liver', 'Kidneys', 'Brain', 'Lungs'];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 10 }}>
      {organsList.map(organ => {
        const isDegraded = affectedOrgans[organ]?.status === 'degraded';
        return (
          <div key={organ} style={{ background: isDegraded ? '#2d1a1a' : '#030712', border: `1px solid ${isDegraded ? '#ef4444' : '#1f2937'}`, borderRadius: 12, padding: 14, textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: isDegraded ? '#f87171' : '#38bdf8' }}>{organ}</div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
              {isDegraded ? 'Stress Detected' : 'Optimized'}
            </div>
          </div>
        );
      })}
    </div>
  );
}