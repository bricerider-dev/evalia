import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getSubjectsByTeacher, getStudents, getGrades, getEvaluations, getFilieres } from '@/lib/storage';
import { Subject, Student, Grade } from '@/lib/types';
import { BookOpen, Users, ClipboardList, CheckCircle, AlertCircle } from 'lucide-react';

export function TeacherDashboard() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [gradesEntered, setGradesEntered] = useState(0);
  const [pendingGrades, setPendingGrades] = useState(0);

  useEffect(() => {
    if (user) {
      const teacherSubjects = getSubjectsByTeacher(user.id);
      setSubjects(teacherSubjects);

      // Calculate students in teacher's subjects
      const filieres = getFilieres();
      const allStudents = getStudents();
      const subjectFiliereIds = new Set(teacherSubjects.map((s) => s.filiereId));
      const studentsInSubjects = allStudents.filter((s) => subjectFiliereIds.has(s.filiereId));
      setTotalStudents(studentsInSubjects.length);

      // Calculate grades entered by this teacher
      const allGrades = getGrades();
      const teacherGrades = allGrades.filter((g) => g.enteredBy === user.id);
      setGradesEntered(teacherGrades.length);

      // Calculate pending grades (evaluations without grades for all students)
      const evaluations = getEvaluations();
      const teacherEvaluations = evaluations.filter((e) =>
        teacherSubjects.some((s) => s.id === e.subjectId)
      );
      const expectedGrades = teacherEvaluations.length * studentsInSubjects.length;
      setPendingGrades(Math.max(0, expectedGrades - teacherGrades.length));
    }
  }, [user]);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card className="gradient-institutional text-primary-foreground border-0">
        <CardHeader>
          <CardTitle className="text-2xl">
            Bienvenue, Prof. {user?.lastName}
          </CardTitle>
          <CardDescription className="text-primary-foreground/80">
            Gérez vos cours et les notes de vos étudiants
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Mes Matières"
          value={subjects.length}
          icon={BookOpen}
          description="Cours assignés"
          color="bg-blue-500/10 text-blue-600"
        />
        <StatCard
          title="Étudiants"
          value={totalStudents}
          icon={Users}
          description="Dans mes cours"
          color="bg-green-500/10 text-green-600"
        />
        <StatCard
          title="Notes Saisies"
          value={gradesEntered}
          icon={CheckCircle}
          description="Ce semestre"
          color="bg-purple-500/10 text-purple-600"
        />
        <StatCard
          title="En Attente"
          value={pendingGrades}
          icon={AlertCircle}
          description="Notes à saisir"
          color="bg-orange-500/10 text-orange-600"
        />
      </div>

      {/* Subjects List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Mes Matières
          </CardTitle>
          <CardDescription>
            Liste des cours que vous enseignez
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subjects.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Aucune matière assignée
            </p>
          ) : (
            <div className="space-y-3">
              {subjects.map((subject) => {
                const filiere = getFilieres().find((f) => f.id === subject.filiereId);
                return (
                  <div
                    key={subject.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-secondary/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{subject.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {subject.code} • {filiere?.name || 'N/A'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Coef. {subject.coefficient}</Badge>
                      <Badge variant="secondary">S{subject.semester}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Actions Rapides
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <QuickActionCard
            title="Saisir des Notes"
            description="Entrer les notes d'une évaluation"
            href="/dashboard/grades"
          />
          <QuickActionCard
            title="Voir les Statistiques"
            description="Consulter les performances"
            href="/dashboard/statistics"
          />
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  color,
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  color: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}

function QuickActionCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="flex items-center justify-between p-4 rounded-lg border hover:bg-secondary/50 transition-colors"
    >
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <span className="text-primary">→</span>
    </a>
  );
}
