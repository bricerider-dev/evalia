import { User, Student, Teacher, Filiere, Subject, Evaluation, Grade } from './types';

// Default Admin
export const defaultAdmin: User = {
  id: 'admin-1',
  username: 'admin',
  email: 'admin@univ.edu',
  password: 'admin123',
  role: 'admin',
  firstName: 'Mohamed',
  lastName: 'Administrateur',
  createdAt: '2024-01-01T00:00:00Z',
  phone: '0600000000',
  is_active: true,
};

// ... (Filieres unchanged)

// Sample Teachers
export const defaultTeachers: Teacher[] = [
  {
    id: 'teacher-1',
    username: 'prof.benali',
    email: 'prof.benali@univ.edu',
    password: 'prof123',
    role: 'teacher',
    firstName: 'Ahmed',
    lastName: 'Benali',
    teacherId: 'T001',
    department: 'Informatique',
    subjects: ['sub-1', 'sub-2'],
    createdAt: '2024-01-15T00:00:00Z',
    grade: 'Professor',
    speciality: 'Informatique',
    bureau: 'B101',
    status: 'Active',
    phone: '',
    is_active: true,
  },
  {
    id: 'teacher-2',
    username: 'prof.mansouri',
    email: 'prof.mansouri@univ.edu',
    password: 'prof123',
    role: 'teacher',
    firstName: 'Fatima',
    lastName: 'Mansouri',
    teacherId: 'T002',
    department: 'Mathématiques',
    subjects: ['sub-3'],
    createdAt: '2024-01-15T00:00:00Z',
    grade: 'Associate Professor',
    speciality: 'Mathematics',
    bureau: 'B102',
    status: 'Active',
    phone: '',
    is_active: true,
  },
];

// Sample Students
export const defaultStudents: Student[] = [
  {
    id: 1,
    user: {
      id: 2,
      username: 'S2024001',
      email: 'etudiant1@univ.edu',
      role: 'student',
      firstName: 'Youssef',
      lastName: 'El Amrani',
      phone: '',
      is_active: true,
      createdAt: '2024-09-01T00:00:00Z',
    },
    filiere: 1,
    status: 'active',
    createdAt: '2024-09-01T00:00:00Z',
  },
  {
    id: 2,
    user: {
      id: 3,
      username: 'S2024002',
      email: 'etudiant2@univ.edu',
      role: 'student',
      firstName: 'Sara',
      lastName: 'Bouazza',
      phone: '',
      is_active: true,
      createdAt: '2024-09-01T00:00:00Z',
    },
    filiere: 1,
    status: 'active',
    createdAt: '2024-09-01T00:00:00Z',
  },
  {
    id: 3,
    user: {
      id: 4,
      username: 'S2024003',
      email: 'etudiant3@univ.edu',
      role: 'student',
      firstName: 'Karim',
      lastName: 'Hajji',
      phone: '',
      is_active: true,
      createdAt: '2024-09-01T00:00:00Z',
    },
    filiere: 2,
    status: 'active',
    createdAt: '2024-09-01T00:00:00Z',
  },
];

// Sample Subjects
export const defaultSubjects: Subject[] = [
  {
    id: 1,
    name: 'Programmation Java',
    code: 'INFO101',
    description: 'Cours de programmation orientée objet en Java',
    level: 1,
    semester: 1,
    credit: 4,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Bases de Données',
    code: 'INFO102',
    description: 'Introduction aux bases de données relationnelles',
    level: 1,
    semester: 1,
    credit: 3,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 3,
    name: 'Analyse Mathématique',
    code: 'MATH101',
    description: 'Analyse réelle et complexe',
    level: 1,
    semester: 1,
    credit: 4,
    createdAt: '2024-01-01T00:00:00Z',
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
