// User Types
export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  id: number | string;
  username: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone: string;
  is_active: boolean;
  createdAt: string;
  password?: string;
}

// Academic Types
export interface Filiere {
  id: number | string;
  name: string;
  code: string;
  description: string;
  createdAt: string;
  department?: string;
}

export interface Student {
  id: number;
  user: User;
  filiere: number;
  status: string;
  createdAt: string;
  // Optional extra fields if they still exist in some responses
  studentId?: string;
  date_of_birth?: string;
  lieu_de_naissance?: string;
  address?: string;
  enrollmentYear?: number;
  level: string;
  cycle?: 'ING' | 'M' | 'D' | 'SCGI';
}

export interface Teacher extends User {
  role: 'teacher';
  teacherId: string;
  subjects: string[];
  grade: string;
  speciality: string;
  bureau: string;
  status: string;
  department: string;
}

export interface Subject {
  id: number;
  code: string;
  name: string;
  description: string;
  level: number;
  semester: number;
  credit: number;
  createdAt: string;
}

// Evaluation Types
export type EvaluationType = 'CC' | 'SN' | 'RA';
export type SessionType = 'normal' | 'rattrapage';

export interface Evaluation {
  id: string;
  subjectId: string;
  type: EvaluationType;
  session: SessionType;
  date: string;
  maxScore: number;
}

export interface Grade {
  id: string;
  studentId: string;
  subjectId: string;
  evaluationId: string;
  score: number | null;
  enteredBy: string;
  enteredAt: string;
  updatedAt: string;
}

// Calculated Results
export type JuryDecision = 'Validé' | 'Rattrapage' | 'Non Validé';

export interface SubjectResult {
  subjectId: string;
  subjectName: string;
  ccScore: number | null;
  snScore: number | null;
  raScore: number | null;
  finalScore: number | null;
  decision: JuryDecision;
  coefficient: number;
}

export interface StudentSemesterResult {
  studentId: string;
  semester: number;
  subjects: SubjectResult[];
  average: number | null;
  totalCredits: number;
  validatedCredits: number;
}

// Statistics
export interface SubjectStatistics {
  subjectId: string;
  totalStudents: number;
  averageScore: number;
  passRate: number;
  failRate: number;
  rattrapageRate: number;
  distribution: {
    range: string;
    count: number;
  }[];
}
