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
      const studentsInSubjects = allStudents.filter((s) => subjectFiliereIds.has(s.filiere));
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
    <div className="space-y-6 animate-fade-in-up">
      {/* Welcome Banner */}
      <Card className="gradient-institutional text-primary-foreground border-0 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-700 group-hover:scale-125"></div>
        <CardHeader className="relative z-10 py-8 px-8">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-2xl font-black tracking-tight">
              Bienvenue, Prof. {user?.lastName}
            </CardTitle>
            <CardDescription className="text-base text-primary-foreground/90 font-medium">
              Gérez vos cours et les notes de vos étudiants avec précision et élégance.
            </CardDescription>
          </div>
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
          index={1}
        />
        <StatCard
          title="Étudiants"
          value={totalStudents}
          icon={Users}
          description="Dans mes cours"
          color="bg-green-500/10 text-green-600"
          index={2}
        />
        <StatCard
          title="Notes Saisies"
          value={gradesEntered}
          icon={CheckCircle}
          description="Ce semestre"
          color="bg-purple-500/10 text-purple-600"
          index={3}
        />
        <StatCard
          title="En Attente"
          value={pendingGrades}
          icon={AlertCircle}
          description="Notes à saisir"
          color="bg-orange-500/10 text-orange-600"
          index={4}
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
  index,
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  color: string;
  index: number;
}) {
  return (
    <Card className={`hover-lift border-0 shadow-institutional bg-white transition-all duration-300 stagger-${index}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-1">
        <CardTitle className="text-xs font-black text-muted-foreground uppercase tracking-widest">
          {title}
        </CardTitle>
        <div className={`p-2.5 rounded-xl ${color} shadow-inner`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-black text-primary">{value}</div>
        <p className="text-xs text-muted-foreground font-semibold mt-1">{description}</p>
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
      className="flex items-center justify-between p-3.5 rounded-2xl border-2 border-transparent bg-secondary/30 hover:bg-white hover:border-primary/20 hover:shadow-xl transition-all duration-300 group"
    >
      <div>
        <p className="font-bold text-primary group-hover:text-accent-foreground transition-colors">{title}</p>
        <p className="text-xs text-muted-foreground font-medium leading-relaxed">{description}</p>
      </div>
      <div className="p-2 rounded-full bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 transform group-hover:translate-x-1">
        <ClipboardList className="h-4 w-4" />
      </div>
    </a>
  );
}
