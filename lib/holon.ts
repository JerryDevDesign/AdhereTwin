// lib/holon.ts
import { DTP } from '@ontomorph/dtp-sdk';

// Maps common medications to the organ systems they protect
const DRUG_ORGAN_MAP: Record<string, string> = {
  amlodipine:    'Heart', lisinopril:   'Heart', atenolol:    'Heart',
  metoprolol:    'Heart', ramipril:     'Heart', losartan:    'Heart',
  warfarin:      'Heart', aspirin:      'Heart', clopidogrel: 'Heart',
  hydroxyurea:   'Blood', folicacid:    'Blood', penicillin:  'Blood',
  phenobarbitone: 'Brain & Nervous System', valproate: 'Brain & Nervous System',
  levetiracetam:  'Brain & Nervous System', carbamazepine: 'Brain & Nervous System',
  metformin:     'Liver', insulin:      'Liver',
  levothyroxine: 'Hormonal System',
  salbutamol:    'Lungs', prednisolone: 'Lungs', beclometasone: 'Lungs',
  furosemide:    'Kidneys', spironolactone: 'Kidneys',
  cotrimoxazole: 'Immune System', artemether: 'Blood',
};

// Consequence descriptions per organ when medication is missed
const CONSEQUENCE_MAP: Record<string, { short: string; risk: string; colour: string }> = {
  'Heart':                   { short: 'BP rising, cardiac stress increasing', risk: 'Stroke / Heart attack', colour: '#ef4444' },
  'Blood':                   { short: 'Crisis risk increasing', risk: 'Vaso-occlusive crisis / Anaemia', colour: '#f97316' },
  'Brain & Nervous System':  { short: 'Seizure threshold lowering', risk: 'Breakthrough seizure', colour: '#8b5cf6' },
  'Liver':                   { short: 'Blood glucose drifting', risk: 'Hyperglycaemic episode', colour: '#eab308' },
  'Lungs':                   { short: 'Airway inflammation rising', risk: 'Asthma attack', colour: '#06b6d4' },
  'Kidneys':                 { short: 'Fluid retention increasing', risk: 'Oedema / Renal stress', colour: '#3b82f6' },
  'Immune System':           { short: 'Infection susceptibility rising', risk: 'Opportunistic infection', colour: '#10b981' },
  'Hormonal System':         { short: 'Thyroid function drifting', risk: 'Hypothyroid episode', colour: '#f59e0b' },
};

export function getOrganForDrug(drugName: string): string {
  const lower = drugName.toLowerCase().replace(/\s/g, '');
  for (const [key, organ] of Object.entries(DRUG_ORGAN_MAP)) {
    if (lower.includes(key)) return organ;
  }
  return 'Unknown';
}

export function getConsequence(organ: string, missedDays: number) {
  const base = CONSEQUENCE_MAP[organ] || {
    short: 'Medication effect wearing off',
    risk: 'Disease progression',
    colour: '#6b7280',
  };
  const severity = missedDays >= 7 ? 'HIGH' : missedDays >= 3 ? 'MODERATE' : 'LOW';
  return { ...base, severity, missedDays };
}

export async function enrichDrugWithHOLON(
  drugName: string,
  dtp: DTP
): Promise<{ organ: string; interactions: string[] }> {
  try {
    const results = await dtp.holon.concepts.search(drugName);
    if (!results?.hits?.length) {
      return { organ: getOrganForDrug(drugName), interactions: [] };
    }
    const concept = results.hits[0];
    const organ = concept.bodySystems?.[0] || getOrganForDrug(drugName);
    const interactions = (concept.drugInteractions || [])
      .slice(0, 3)
      .map((d: any) => d.label || d);
    return { organ, interactions };
  } catch {
    return { organ: getOrganForDrug(drugName), interactions: [] };
  }
}