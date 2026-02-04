// User Types
export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  phone: string;
  lastName: string;
  createdAt: string;
  is_active: boolean;
}

// Academic Types
export interface Filiere {
  id: string;
  name: string;
  code: string;
  description: string;
  createdAt: string;
  department?: string;
}

export interface Student extends User {
  role: 'student';
  studentId: string;
  filiere: string;
  date_of_birth: string;
  lieu_de_naissance: string;
  address: string;
  status: string;
  enrollmentYear: number;
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
  id: string;
  name: string;
  code: string;
  filiereId: string;
  teacherId: string;
  coefficient: number;
  semester: number;
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
