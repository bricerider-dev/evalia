import { Grade, Evaluation, SubjectResult, JuryDecision } from './types';
import { getEvaluations, getGrades } from './storage';

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
 */
export function getSubjectResultForStudent(
  studentId: string,
  subjectId: string,
  subjectName: string,
  coefficient: number
): SubjectResult {
  const evaluations = getEvaluations().filter((e) => e.subjectId === subjectId);
  const grades = getGrades().filter(
    (g) => g.studentId === studentId && g.subjectId === subjectId
  );

  // Find grades by evaluation type
  const ccEval = evaluations.find((e) => e.type === 'CC');
  const snEval = evaluations.find((e) => e.type === 'SN');
  const raEval = evaluations.find((e) => e.type === 'RA');

  const ccGrade = ccEval ? grades.find((g) => g.evaluationId === ccEval.id) : null;
  const snGrade = snEval ? grades.find((g) => g.evaluationId === snEval.id) : null;
  const raGrade = raEval ? grades.find((g) => g.evaluationId === raEval.id) : null;

  const ccScore = ccGrade?.score ?? null;
  const snScore = snGrade?.score ?? null;
  const raScore = raGrade?.score ?? null;

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
