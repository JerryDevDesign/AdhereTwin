// lib/simulate.ts
export async function runConsequenceSimulation(medications: any[], dtp: any) {
  return await Promise.all(medications.map(async (med) => {
    const missed = med.missedStreak || 0;
    
    // Optional live platform verification call if concept search is available
    try {
      if (dtp && dtp.holon?.concepts) {
        await dtp.holon.concepts.search({ query: med.name }).catch(() => {});
      }
    } catch (e) {
      // Non-blocking platform call safeguard
    }

    // Core degradation scoring formula
    const degradationScore = Math.min(100, Math.round(10 * Math.log(missed + 1) * 10));
    
    return {
      organ: med.organ || 'General',
      medication: med.name,
      missedStreak: missed,
      degradationScore,
      status: missed > 0 ? 'degraded' : 'optimized'
    };
  }));
}