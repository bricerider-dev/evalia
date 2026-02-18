import { Grade, Evaluation, SubjectResult, JuryDecision } from './types';

// Constants for grade calculation
const CC_WEIGHT = 0.3;
const SN_WEIGHT = 0.7;
const PASSING_GRADE = 10;

/**
 * Calculate final grade for a subject
 * Formula: Note Finale = (CC × 0.3) + (SN × 0.7)
 * If final < 10 and RA exists: Note Finale = max(SN, RA)
 */
export function calculateFinalGrade(
  ccScore: number | null,
  snScore: number | null,
  raScore: number | null
): number | null {
  // Need at least CC and SN to calculate
  if (ccScore === null || snScore === null) {
    return null;
  }

  const normalFinal = ccScore * CC_WEIGHT + snScore * SN_WEIGHT;

  // If passed, return normal final
  if (normalFinal >= PASSING_GRADE) {
    return normalFinal;
  }

  // If rattrapage exists, use the better score
  if (raScore !== null) {
    // Recalculate with RA instead of SN
    const raFinal = ccScore * CC_WEIGHT + raScore * SN_WEIGHT;
    return Math.max(normalFinal, raFinal);
  }

  return normalFinal;
}

/**
 * Determine jury decision based on final grade
 */
export function getJuryDecision(
  finalScore: number | null,
  hasRattrapage: boolean,
  raScore: number | null
): JuryDecision {
  if (finalScore === null) {
    return 'Non Validé';
  }

  if (finalScore >= PASSING_GRADE) {
    return 'Validé';
  }

  // If below passing and no rattrapage yet, needs rattrapage
  if (!hasRattrapage && raScore === null) {
    return 'Rattrapage';
  }

  return 'Non Validé';
}

/**
 * Get subject result for a student
 * Récupère les notes CC, SN, RA pour une matière d'un étudiant
 */
export function getSubjectResultForStudent(
  studentId: string,
  subjectId: string,
  subjectName: string,
  coefficient: number,
  allEvaluations: any[],
  allGrades: any[]
): SubjectResult {
  // Trouver les évaluations pour cette matière (UE)
  // Note: Backend retourne "ue" mais le frontend utilise "subjectId"
  // On cherche en vérifiant les deux cas
  const evaluations = allEvaluations.filter((e) => 
    String(e.subjectId) === String(subjectId) || String(e.ue) === String(subjectId)
  );
  
  // Trouver les évaluations par type
  const ccEval = evaluations.find((e) => e.evaluationType === 'CC' || e.type_evaluation === 'CC');
  const snEval = evaluations.find((e) => e.evaluationType === 'SN' || e.type_evaluation === 'SN');
  const raEval = evaluations.find((e) => e.evaluationType === 'RA' || e.type_evaluation === 'RA');

  // Trouver les notes correspondantes pour cet étudiant
  // Backend envoie étudiant comme FK (nombre), on compare en tant que strings
  const ccGrade = ccEval ? allGrades.find((g) => 
    String(g.etudiant) === String(studentId) && String(g.evaluation) === String(ccEval.id)
  ) : null;
  
  const snGrade = snEval ? allGrades.find((g) => 
    String(g.etudiant) === String(studentId) && String(g.evaluation) === String(snEval.id)
  ) : null;
  
  const raGrade = raEval ? allGrades.find((g) => 
    String(g.etudiant) === String(studentId) && String(g.evaluation) === String(raEval.id)
  ) : null;

  // Backend retourne "grade", pas "score"
  // Important: Convertir en nombres car le backend retourne des Decimal (strings en JSON)
  const ccScore = ccGrade?.grade ? parseFloat(String(ccGrade.grade)) : null;
  const snScore = snGrade?.grade ? parseFloat(String(snGrade.grade)) : null;
  const raScore = raGrade?.grade ? parseFloat(String(raGrade.grade)) : null;

  const finalScore = calculateFinalGrade(ccScore, snScore, raScore);
  const hasRattrapage = raEval !== undefined;
  const decision = getJuryDecision(finalScore, hasRattrapage, raScore);

  return {
    subjectId,
    subjectName,
    ccScore,
    snScore,
    raScore,
    finalScore,
    decision,
    coefficient,
  };
}

/**
 * Calculate weighted average for multiple subjects
 */
export function calculateWeightedAverage(results: SubjectResult[]): number | null {
  const validResults = results.filter((r) => r.finalScore !== null);

  if (validResults.length === 0) {
    return null;
  }

  const totalWeight = validResults.reduce((sum, r) => sum + r.coefficient, 0);
  const weightedSum = validResults.reduce(
    (sum, r) => sum + (r.finalScore! * r.coefficient),
    0
  );

  return weightedSum / totalWeight;
}

/**
 * Check if student needs rattrapage for a subject
 */
export function needsRattrapage(
  ccScore: number | null,
  snScore: number | null
): boolean {
  if (ccScore === null || snScore === null) {
    return false;
  }

  const normalFinal = ccScore * CC_WEIGHT + snScore * SN_WEIGHT;
  return normalFinal < PASSING_GRADE;
}

/**
 * Get mention based on final average
 */
export function getMention(average: number): string {
  if (average >= 16) return 'Très Bien';
  if (average >= 14) return 'Bien';
  if (average >= 12) return 'Assez Bien';
  if (average >= 10) return 'Passable';
  return 'Insuffisant';
}
