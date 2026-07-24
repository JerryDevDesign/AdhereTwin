// lib/simulate.ts
import { DTP } from '@ontomorph/dtp-sdk';
import { getConsequence } from './holon';

export interface SimulationResult {
  organ: string;
  medicationName: string;
  missedDays: number;
  severity: 'LOW' | 'MODERATE' | 'HIGH';
  riskLabel: string;
  shortDescription: string;
  colourHex: string;
  organDegradationScore: number;
}

export async function runConsequenceSimulation(
  medications: any[],
  dtp: DTP
): Promise<SimulationResult[]> {
  const results: SimulationResult[] = [];

  for (const med of medications) {
    // Handle both snake_case (DB) and camelCase properties
    const missedStreak = med.missedStreak ?? med.missed_streak ?? 0;
    const timesPerDay = med.timesPerDay ?? med.times_per_day ?? 1;

    if (missedStreak === 0) continue; // Fully adherent, skip simulation

    const consequence = getConsequence(med.organ, missedStreak);

    // Degradation score: 0 = healthy, 100 = critical
    const degradation = Math.min(
      100,
      Math.round(10 * Math.log(missedStreak + 1) * 10)
    );

    try {
      await dtp.simulation.run({
        system:    med.organ,
        scenario:  `medication_nonadherence`,
        parameters: {
          drug:        med.name,
          missedDoses: missedStreak * timesPerDay,
          diagnosis:   med.diagnosis,
        },
      });
    } catch (err) {
      console.warn('Simulation API unavailable, using local model:', err);
    }

    results.push({
      organ:                 med.organ,
      medicationName:        med.name,
      missedDays:            missedStreak,
      severity:              consequence.severity as 'LOW' | 'MODERATE' | 'HIGH',
      riskLabel:             consequence.risk,
      shortDescription:      consequence.short,
      colourHex:             consequence.colour,
      organDegradationScore: degradation,
    });
  }

  return results;
}