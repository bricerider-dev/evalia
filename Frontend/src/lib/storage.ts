import { User, Student, Teacher, Filiere, Subject, Evaluation, Grade } from './types';
import {
  defaultAdmin,
  defaultFilieres,
  defaultTeachers,
  defaultStudents,
  defaultSubjects,
  defaultEvaluations,
  defaultGrades,
} from './mockData';
const STORAGE_KEYS = {
  USERS: 'ugms_users',
  FILIERES: 'ugms_filieres',
  TEACHERS: 'ugms_teachers',
  STUDENTS: 'ugms_students',
  SUBJECTS: 'ugms_subjects',
  EVALUATIONS: 'ugms_evaluations',
  GRADES: 'ugms_grades',
  CURRENT_USER: 'ugms_current_user',
};

// Initialize storage with default data if empty
export function initializeStorage(): void {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    const allUsers = [defaultAdmin, ...defaultTeachers, ...defaultStudents];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(allUsers));
  }
  if (!localStorage.getItem(STORAGE_KEYS.FILIERES)) {
    localStorage.setItem(STORAGE_KEYS.FILIERES, JSON.stringify(defaultFilieres));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TEACHERS)) {
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(defaultTeachers));
  }
  if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(defaultStudents));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SUBJECTS)) {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(defaultSubjects));
  }
  if (!localStorage.getItem(STORAGE_KEYS.EVALUATIONS)) {
    localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(defaultEvaluations));
  }
  if (!localStorage.getItem(STORAGE_KEYS.GRADES)) {
    localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify(defaultGrades));
  }
}

// Generic CRUD helpers
function getFromStorage<T>(key: string): T[] {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function saveToStorage<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// User operations
export function getAllUsers(): User[] {
  return getFromStorage<User>(STORAGE_KEYS.USERS);
}

export function getUserByEmail(email: string): User | undefined {
  const users = getAllUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function getUserById(id: string): User | undefined {
  const users = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return users ? JSON.parse(users) : null;
}

export function authenticateUser(email: string, password: string): User | null {
  const user = getUserByEmail(email);
  if (user && user.password === password) {
    return user;
  }
  return null;
}

export function getCurrentUser(): any | null {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  console.log(data);
  return data ? JSON.parse(data) : null;
}

export function setCurrentUser(user: any | null): void {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
}

// Filiere operations
export function getFilieres(): Filiere[] {
  return getFromStorage<Filiere>(STORAGE_KEYS.FILIERES);
}

export function addFiliere(filiere: Filiere): void {
  const filieres = getFilieres();
  filieres.push(filiere);
  saveToStorage(STORAGE_KEYS.FILIERES, filieres);
}

export function updateFiliere(id: string, updates: Partial<Filiere>): void {
  const filieres = getFilieres();
  const index = filieres.findIndex((f) => f.id === id);
  if (index !== -1) {
    filieres[index] = { ...filieres[index], ...updates };
    saveToStorage(STORAGE_KEYS.FILIERES, filieres);
  }
}

export function deleteFiliere(id: string): void {
  const filieres = getFilieres().filter((f) => f.id !== id);
  saveToStorage(STORAGE_KEYS.FILIERES, filieres);
}

// Teacher operations
export function getTeachers(): Teacher[] {
  return getFromStorage<Teacher>(STORAGE_KEYS.TEACHERS);
}

export function addTeacher(teacher: Teacher): void {
  const teachers = getTeachers();
  teachers.push(teacher);
  saveToStorage(STORAGE_KEYS.TEACHERS, teachers);

  // Also add to users
  const users = getAllUsers();
  users.push(teacher);
  saveToStorage(STORAGE_KEYS.USERS, users);
}

export function updateTeacher(id: string, updates: Partial<Teacher>): void {
  const teachers = getTeachers();
  const index = teachers.findIndex((t) => t.id === id);
  if (index !== -1) {
    teachers[index] = { ...teachers[index], ...updates };
    saveToStorage(STORAGE_KEYS.TEACHERS, teachers);
  }
}

export function deleteTeacher(id: string): void {
  const teachers = getTeachers().filter((t) => t.id !== id);
  saveToStorage(STORAGE_KEYS.TEACHERS, teachers);

  const users = getAllUsers().filter((u) => u.id !== id);
  saveToStorage(STORAGE_KEYS.USERS, users);
}

// Student operations
export function getStudents(): Student[] {
  return getFromStorage<Student>(STORAGE_KEYS.STUDENTS);
}

export function getStudentsByFiliere(filiereId: string | number): Student[] {
  return getStudents().filter((s) => String(s.filiere) === String(filiereId));
}

export function addStudent(student: Student): void {
  const students = getStudents();
  students.push(student);
  saveToStorage(STORAGE_KEYS.STUDENTS, students);

  const users = getAllUsers();
  users.push(student.user);
  saveToStorage(STORAGE_KEYS.USERS, users);
}

export function updateStudent(id: string | number, updates: Partial<Student>): void {
  const students = getStudents();
  const index = students.findIndex((s) => String(s.id) === String(id));
  if (index !== -1) {
    students[index] = { ...students[index], ...updates };
    saveToStorage(STORAGE_KEYS.STUDENTS, students);
  }
}

export function deleteStudent(id: string | number): void {
  const students = getStudents().filter((s) => String(s.id) === String(id));
  saveToStorage(STORAGE_KEYS.STUDENTS, students);

  const users = getAllUsers().filter((u) => String(u.id) !== String(id));
  saveToStorage(STORAGE_KEYS.USERS, users);
}

// Subject operations
// Subject operations
export function getSubjects(): Subject[] {
  return getFromStorage<Subject>(STORAGE_KEYS.SUBJECTS);
}

// export function getSubjectsByFiliere(filiereId: string): Subject[] {
//   return getSubjects().filter((s) => s.filiereId === filiereId);
// }

// export function getSubjectsByTeacher(teacherId: string): Subject[] {
//   return getSubjects().filter((s) => s.teacherId === teacherId);
// }

export function addSubject(subject: Subject): void {
  const subjects = getSubjects();
  subjects.push(subject);
  saveToStorage(STORAGE_KEYS.SUBJECTS, subjects);
}

export function updateSubject(id: number | string, updates: Partial<Subject>): void {
  const subjects = getSubjects();
  const index = subjects.findIndex((s) => s.id === Number(id));
  if (index !== -1) {
    subjects[index] = { ...subjects[index], ...updates };
    saveToStorage(STORAGE_KEYS.SUBJECTS, subjects);
  }
}

export function deleteSubject(id: number | string): void {
  const subjects = getSubjects().filter((s) => s.id !== Number(id));
  saveToStorage(STORAGE_KEYS.SUBJECTS, subjects);
}

// Evaluation operations
export function getEvaluations(): Evaluation[] {
  return getFromStorage<Evaluation>(STORAGE_KEYS.EVALUATIONS);
}

export function getEvaluationsBySubject(subjectId: string): Evaluation[] {
  return getEvaluations().filter((e) => e.subjectId === subjectId);
}

export function addEvaluation(evaluation: Evaluation): void {
  const evaluations = getEvaluations();
  evaluations.push(evaluation);
  saveToStorage(STORAGE_KEYS.EVALUATIONS, evaluations);
}

export function updateEvaluation(id: string, updates: Partial<Evaluation>): void {
  const evaluations = getEvaluations();
  const index = evaluations.findIndex((e) => e.id === id);
  if (index !== -1) {
    evaluations[index] = { ...evaluations[index], ...updates };
    saveToStorage(STORAGE_KEYS.EVALUATIONS, evaluations);
  }
}

export function deleteEvaluation(id: string): void {
  const evaluations = getEvaluations().filter((e) => e.id !== id);
  saveToStorage(STORAGE_KEYS.EVALUATIONS, evaluations);
}

// Grade operations
export function getGrades(): Grade[] {
  return getFromStorage<Grade>(STORAGE_KEYS.GRADES);
}

export function getGradesByStudent(studentId: string): Grade[] {
  return getGrades().filter((g) => g.studentId === studentId);
}

export function getGradesBySubject(subjectId: string): Grade[] {
  return getGrades().filter((g) => g.subjectId === subjectId);
}

export function getGradesByEvaluation(evaluationId: string): Grade[] {
  return getGrades().filter((g) => g.evaluationId === evaluationId);
}

export function addGrade(grade: Grade): void {
  const grades = getGrades();
  grades.push(grade);
  saveToStorage(STORAGE_KEYS.GRADES, grades);
}

export function updateGrade(id: string, updates: Partial<Grade>): void {
  const grades = getGrades();
  const index = grades.findIndex((g) => g.id === id);
  if (index !== -1) {
    grades[index] = { ...grades[index], ...updates, updatedAt: new Date().toISOString() };
    saveToStorage(STORAGE_KEYS.GRADES, grades);
  }
}

export function upsertGrade(grade: Grade): void {
  const grades = getGrades();
  // Utiliser les vrais noms de champs du backend: etudiant et evaluation
  const studentId = String(grade.etudiant ?? (grade as any).studentId);
  const evaluationId = String(grade.evaluation ?? (grade as any).evaluationId);
  
  const existingIndex = grades.findIndex(
    (g) => {
      const gStudentId = String((g as any).etudiant ?? (g as any).studentId);
      const gEvaluationId = String((g as any).evaluation ?? (g as any).evaluationId);
      return gStudentId === studentId && gEvaluationId === evaluationId;
    }
  );

  if (existingIndex !== -1) {
    grades[existingIndex] = { ...grade, updated_at: new Date().toISOString() };
  } else {
    grades.push(grade);
  }
  saveToStorage(STORAGE_KEYS.GRADES, grades);
}

export function deleteGrade(id: string): void {
  const grades = getGrades().filter((g) => g.id !== id);
  saveToStorage(STORAGE_KEYS.GRADES, grades);
}
