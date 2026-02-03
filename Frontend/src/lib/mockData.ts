import { User, Student, Teacher, Filiere, Subject, Evaluation, Grade } from './types';

// Default Admin
export const defaultAdmin: User = {
  id: 'admin-1',
  email: 'admin@univ.edu',
  password: 'admin123',
  role: 'admin',
  firstName: 'Mohamed',
  lastName: 'Administrateur',
  createdAt: '2024-01-01T00:00:00Z',
};

// Sample Filieres
export const defaultFilieres: Filiere[] = [
  {
    id: 'fil-1',
    name: 'Informatique',
    code: 'INFO',
    description: 'Licence en Sciences Informatiques',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'fil-2',
    name: 'Mathématiques',
    code: 'MATH',
    description: 'Licence en Mathématiques Appliquées',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'fil-3',
    name: 'Physique',
    code: 'PHYS',
    description: 'Licence en Physique Fondamentale',
    createdAt: '2024-01-01T00:00:00Z',
  },
];

// Sample Teachers
export const defaultTeachers: Teacher[] = [
  {
    id: 'teacher-1',
    email: 'prof.benali@univ.edu',
    password: 'prof123',
    role: 'teacher',
    firstName: 'Ahmed',
    lastName: 'Benali',
    teacherId: 'T001',
    department: 'Informatique',
    subjects: ['sub-1', 'sub-2'],
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'teacher-2',
    email: 'prof.mansouri@univ.edu',
    password: 'prof123',
    role: 'teacher',
    firstName: 'Fatima',
    lastName: 'Mansouri',
    teacherId: 'T002',
    department: 'Mathématiques',
    subjects: ['sub-3'],
    createdAt: '2024-01-15T00:00:00Z',
  },
];

// Sample Students
export const defaultStudents: Student[] = [
  {
    id: 'student-1',
    email: 'etudiant1@univ.edu',
    password: 'etud123',
    role: 'student',
    firstName: 'Youssef',
    lastName: 'El Amrani',
    studentId: 'S2024001',
    filiereId: 'fil-1',
    enrollmentYear: 2024,
    createdAt: '2024-09-01T00:00:00Z',
  },
  {
    id: 'student-2',
    email: 'etudiant2@univ.edu',
    password: 'etud123',
    role: 'student',
    firstName: 'Sara',
    lastName: 'Bouazza',
    studentId: 'S2024002',
    filiereId: 'fil-1',
    enrollmentYear: 2024,
    createdAt: '2024-09-01T00:00:00Z',
  },
  {
    id: 'student-3',
    email: 'etudiant3@univ.edu',
    password: 'etud123',
    role: 'student',
    firstName: 'Karim',
    lastName: 'Hajji',
    studentId: 'S2024003',
    filiereId: 'fil-1',
    enrollmentYear: 2024,
    createdAt: '2024-09-01T00:00:00Z',
  },
];

// Sample Subjects
export const defaultSubjects: Subject[] = [
  {
    id: 'sub-1',
    name: 'Programmation Java',
    code: 'INFO101',
    filiereId: 'fil-1',
    teacherId: 'teacher-1',
    coefficient: 3,
    semester: 1,
  },
  {
    id: 'sub-2',
    name: 'Bases de Données',
    code: 'INFO102',
    filiereId: 'fil-1',
    teacherId: 'teacher-1',
    coefficient: 3,
    semester: 1,
  },
  {
    id: 'sub-3',
    name: 'Analyse Mathématique',
    code: 'MATH101',
    filiereId: 'fil-1',
    teacherId: 'teacher-2',
    coefficient: 4,
    semester: 1,
  },
];

// Sample Evaluations
export const defaultEvaluations: Evaluation[] = [
  {
    id: 'eval-1',
    subjectId: 'sub-1',
    type: 'CC',
    session: 'normal',
    date: '2024-10-15',
    maxScore: 20,
  },
  {
    id: 'eval-2',
    subjectId: 'sub-1',
    type: 'SN',
    session: 'normal',
    date: '2024-12-20',
    maxScore: 20,
  },
  {
    id: 'eval-3',
    subjectId: 'sub-2',
    type: 'CC',
    session: 'normal',
    date: '2024-10-18',
    maxScore: 20,
  },
  {
    id: 'eval-4',
    subjectId: 'sub-2',
    type: 'SN',
    session: 'normal',
    date: '2024-12-22',
    maxScore: 20,
  },
];

// Sample Grades
export const defaultGrades: Grade[] = [
  // Student 1 - Java
  {
    id: 'grade-1',
    studentId: 'student-1',
    subjectId: 'sub-1',
    evaluationId: 'eval-1',
    score: 14,
    enteredBy: 'teacher-1',
    enteredAt: '2024-10-16T10:00:00Z',
    updatedAt: '2024-10-16T10:00:00Z',
  },
  {
    id: 'grade-2',
    studentId: 'student-1',
    subjectId: 'sub-1',
    evaluationId: 'eval-2',
    score: 12,
    enteredBy: 'teacher-1',
    enteredAt: '2024-12-21T10:00:00Z',
    updatedAt: '2024-12-21T10:00:00Z',
  },
  // Student 2 - Java
  {
    id: 'grade-3',
    studentId: 'student-2',
    subjectId: 'sub-1',
    evaluationId: 'eval-1',
    score: 16,
    enteredBy: 'teacher-1',
    enteredAt: '2024-10-16T10:00:00Z',
    updatedAt: '2024-10-16T10:00:00Z',
  },
  {
    id: 'grade-4',
    studentId: 'student-2',
    subjectId: 'sub-1',
    evaluationId: 'eval-2',
    score: 15,
    enteredBy: 'teacher-1',
    enteredAt: '2024-12-21T10:00:00Z',
    updatedAt: '2024-12-21T10:00:00Z',
  },
  // Student 3 - Java (needs rattrapage)
  {
    id: 'grade-5',
    studentId: 'student-3',
    subjectId: 'sub-1',
    evaluationId: 'eval-1',
    score: 8,
    enteredBy: 'teacher-1',
    enteredAt: '2024-10-16T10:00:00Z',
    updatedAt: '2024-10-16T10:00:00Z',
  },
  {
    id: 'grade-6',
    studentId: 'student-3',
    subjectId: 'sub-1',
    evaluationId: 'eval-2',
    score: 7,
    enteredBy: 'teacher-1',
    enteredAt: '2024-12-21T10:00:00Z',
    updatedAt: '2024-12-21T10:00:00Z',
  },
];
