import { describe, it, expect } from 'vitest';
import {
  getSubjectResultForStudent,
  calculateFinalGrade,
  getJuryDecision,
  calculateWeightedAverage,
  getMention
} from '../gradeCalculator';

describe('gradeCalculator', () => {
  describe('calculateFinalGrade', () => {
    it('should calculate final grade correctly with CC and SN', () => {
      const finalGrade = calculateFinalGrade(12, 15, null);
      // (12 × 0.3) + (15 × 0.7) = 3.6 + 10.5 = 14.1
      expect(finalGrade).toBe(14.1);
    });

    it('should use RA fallback when final < 10', () => {
      const finalGrade = calculateFinalGrade(8, 9, 12);
      // Normal: (8 × 0.3) + (9 × 0.7) = 2.4 + 6.3 = 8.7 (< 10)
      // With RA: (8 × 0.3) + (12 × 0.7) = 2.4 + 8.4 = 10.8
      expect(finalGrade).toBe(10.8);
    });

    it('should return 0 when no CC or SN', () => {
      const finalGrade = calculateFinalGrade(null, 15, 12);
      expect(finalGrade).toBe(0);
    });

    it('should return 0 when only CC provided', () => {
      const finalGrade = calculateFinalGrade(12, null, null);
      expect(finalGrade).toBe(0);
    });
  });

  describe('getJuryDecision', () => {
    it('should return "Validé" when final >= 10', () => {
      const decision = getJuryDecision(12, false, null);
      expect(decision).toBe('Validé');
    });

    it('should return "Rattrapage" when final < 10 and RA exists', () => {
      const decision = getJuryDecision(8, true, 11);
      expect(decision).toBe('Rattrapage');
    });

    it('should return "Non Validé" when final < 10 and no RA', () => {
      const decision = getJuryDecision(8, false, null);
      expect(decision).toBe('Non Validé');
    });
  });

  describe('getSubjectResultForStudent', () => {
    const evaluations = [
      { id: 1, subjectId: 101, ue: 101, evaluationType: 'CC', type_evaluation: 'CC' },
      { id: 2, subjectId: 101, ue: 101, evaluationType: 'SN', type_evaluation: 'SN' },
      { id: 3, subjectId: 101, ue: 101, evaluationType: 'RA', type_evaluation: 'RA' },
    ];

    const grades = [
      { id: 1, etudiant: 5, evaluation: 1, grade: 12 },  // CC = 12
      { id: 2, etudiant: 5, evaluation: 2, grade: 15 },  // SN = 15
      { id: 3, etudiant: 5, evaluation: 3, grade: 14 },  // RA = 14
    ];

    it('should calculate subject result correctly', () => {
      const result = getSubjectResultForStudent(
        '5',
        '101',
        'Mathematics',
        3,
        evaluations,
        grades
      );

      expect(result.subjectId).toBe('101');
      expect(result.subjectName).toBe('Mathematics');
      expect(result.ccScore).toBe(12);
      expect(result.snScore).toBe(15);
      expect(result.raScore).toBe(14);
      expect(result.finalScore).toBe(14.1);  // (12 × 0.3) + (15 × 0.7)
      expect(result.decision).toBe('Validé');
      expect(result.coefficient).toBe(3);
    });

    it('should handle missing evaluations gracefully', () => {
      const incompletGrades = [
        { id: 1, etudiant: 6, evaluation: 1, grade: 10 },  // Only CC
      ];

      const result = getSubjectResultForStudent(
        '6',
        '101',
        'Mathematics',
        3,
        evaluations,
        incompletGrades
      );

      expect(result.ccScore).toBe(10);
      expect(result.snScore).toBeNull();
      expect(result.finalScore).toBe(0);  // Can't calculate without SN
      expect(result.decision).toBe('Non Validé');
    });

    it('should handle string and number IDs interchangeably', () => {
      // Test with numeric string IDs
      const result1 = getSubjectResultForStudent(
        '5',
        '101',
        'Math',
        3,
        evaluations,
        grades
      );

      // Test with numeric string IDs (same result)
      const result2 = getSubjectResultForStudent(
        '5',
        '101',
        'Math',
        3,
        evaluations,
        grades
      );

      expect(result1.finalScore).toBe(result2.finalScore);
      expect(result1.decision).toBe(result2.decision);
    });
  });

  describe('calculateWeightedAverage', () => {
    it('should calculate weighted average correctly', () => {
      const results = [
        {
          subjectId: '1',
          subjectName: 'Math',
          ccScore: 12,
          snScore: 15,
          raScore: null,
          finalScore: 14.1,
          decision: 'Validé' as const,
          coefficient: 4,
        },
        {
          subjectId: '2',
          subjectName: 'Physics',
          ccScore: 10,
          snScore: 12,
          raScore: null,
          finalScore: 11.4,
          decision: 'Validé' as const,
          coefficient: 3,
        },
      ];

      const average = calculateWeightedAverage(results);
      // (14.1 × 4 + 11.4 × 3) / (4 + 3) = (56.4 + 34.2) / 7 = 90.6 / 7 ≈ 12.94
      expect(average).toBeCloseTo(12.94, 1);
    });

    it('should return null when no valid results', () => {
      const results = [
        {
          subjectId: '1',
          subjectName: 'Math',
          ccScore: null,
          snScore: null,
          raScore: null,
          finalScore: null,
          decision: 'Non Validé' as const,
          coefficient: 4,
        },
      ];

      const average = calculateWeightedAverage(results);
      expect(average).toBeNull();
    });
  });

  describe('getMention', () => {
    it('should return correct mention based on average', () => {
      expect(getMention(14.5)).toBe('Très Bien');
      expect(getMention(12.5)).toBe('Bien');
      expect(getMention(10.5)).toBe('Assez Bien');
      expect(getMention(8.5)).toBe('Passable');
      expect(getMention(6.5)).toBe('Insufficient');
      expect(getMention(null)).toBe('N/A');
    });
  });
});
