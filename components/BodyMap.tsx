// components/BodyMap.tsx
'use client';

interface BodyMapProps {
  affectedOrgans?: Record<string, any>;
}

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

export default function BodyMap({ affectedOrgans = {} }: BodyMapProps) {
  return (
    <svg viewBox="0 0 100 90" style={{ width: '100%', maxHeight: 300 }}>
      {/* Base Silhouette */}
      <ellipse cx="50" cy="14" rx="10" ry="11" fill="#1e3a5f" stroke="#334155" strokeWidth="0.5"/>
      <rect x="37" y="24" width="26" height="35" rx="4" fill="#1e3a5f" stroke="#334155" strokeWidth="0.5"/>
      <rect x="24" y="25" width="12" height="26" rx="4" fill="#1e3a5f" stroke="#334155" strokeWidth="0.5"/>
      <rect x="64" y="25" width="12" height="26" rx="4" fill="#1e3a5f" stroke="#334155" strokeWidth="0.5"/>
      <rect x="38" y="59" width="10" height="28" rx="4" fill="#1e3a5f" stroke="#334155" strokeWidth="0.5"/>
      <rect x="52" y="59" width="10" height="28" rx="4" fill="#1e3a5f" stroke="#334155" strokeWidth="0.5"/>

      {/* Organs Overlay */}
      {Object.entries(ORGAN_POS).map(([organ, pos]) => {
        const sim = affectedOrgans[organ];
        const isAffected = !!sim;
        // Default healthy green, or the specific risk color if degraded
        const color = sim ? sim.colourHex : '#22c55e'; 

        return (
          <g key={organ}>
            <circle 
              cx={pos.x} 
              cy={pos.y} 
              r={pos.r} 
              fill={`${color}${isAffected ? 'aa' : '33'}`} 
              stroke={color} 
              strokeWidth={isAffected ? 2 : 1}
              className={isAffected ? 'animate-pulse' : ''}
            />
            <text 
              x={pos.x} 
              y={pos.y + 1} 
              textAnchor="middle" 
              fontSize="3" 
              fill="white" 
              fontWeight="bold"
            >
              {pos.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}