// User Types
export type UserRole = 'admin' | 'teacher' | 'student';
export type TeacherGrade = 'PA' | 'PH' | 'DR' | 'PR' | 'MC' | 'AS' | 'VAC';
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
  teacher_id?: number;
  student_id?: number;
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

export interface Teacher  {
  user: User;
  id: number;
  grade: TeacherGrade;
  status: string;
}

export interface Subject {
  id: number | string;
  code: string;
  name: string;
  description: string;
  level: number;
  semester: number;
  credit: number;
  filiere?: number | string;  // Optional filiere ID
  createdAt?: string;
  enseignant?: string;  // Optional teacher ID
}

// Evaluation Types
export type EvaluationType = 'CC' | 'SN' | 'RA';
export type SessionType = 'normal' | 'rattrapage';

export interface Evaluation {
  id?: number | string;
  subjectId?: number | string;
  ue?: number | string;  // Backend field name
  title?: string;
  intitule?: string;  // Backend field name
  description?: string;
  evaluationDate?: Date | string;
  date_evaluation?: Date | string;  // Backend field name
  startTime?: string;
  heure_debut?: string;  // Backend field name
  endTime?: string;
  heure_fin?: string;  // Backend field name
  room?: string;
  salle?: string;  // Backend field name
  evaluationStatus?: string;
  statut_time?: string;  // Backend field name
  evaluationType: EvaluationType;
  type_evaluation?: EvaluationType;  // Backend field name
  createdAt?: string;
  created_at?: string;  // Backend field name
}

export interface Grade {
  id: string | number;
  evaluation: number | string;
  etudiant: number | string;
  grade: number | null;
  score?: number | null;  // Backward compatibility
  final_grade?: number | null;  // From serializer
  status?: string;  // Status from backend
  evaluation_type?: string;  // Type d'évaluation (CC, SN, RA)
  ue_code?: string;
  student_name?: string;
  statut?: string;  // Field name from model
  created_at?: string;
  updated_at?: string;
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
