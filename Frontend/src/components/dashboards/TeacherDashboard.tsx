import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getSubjects } from '@/api/subject';
import { getEtudiants } from '@/api/etudiant';
import { getGrades } from '@/api/grade';
import { getFilieres } from '@/api/filiere';
import { BookOpen, Users, ClipboardList, CheckCircle, AlertCircle } from 'lucide-react';

export function TeacherDashboard() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [gradesEntered, setGradesEntered] = useState(0);
  const [pendingGrades, setPendingGrades] = useState(0);
  const [filieres, setFilieres] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        try {
          const [allSubjects, allEtudiants, allGrades, allFilieres] = await Promise.all([
            getSubjects(),
            getEtudiants(),
            getGrades(),
            getFilieres()
          ]);

          setFilieres(allFilieres);

          // Filter subjects for this teacher
          const teacherSubjects = allSubjects.filter((s: any) => s.responsibleTeacherId === user.id);
          setSubjects(teacherSubjects);

          // Calculate students across these subjects
          // (Simplify: count students in the filieres of these subjects)
          const subjectFiliereIds = new Set(teacherSubjects.map((s: any) => s.filiereId));
          const studentsInSubjects = allEtudiants.filter((s: any) => subjectFiliereIds.has(s.filiere));
          setTotalStudents(studentsInSubjects.length);

          // Calculate grades entered by this teacher
          const teacherGrades = allGrades.filter((g: any) => g.enteredBy === user.id);
          setGradesEntered(teacherGrades.length);

          // Note: pendingGrades logic could be complex, keeping it simple for now as 0 or estimated
          setPendingGrades(0);

        } catch (error) {
          console.error("Error loading teacher dashboard data:", error);
        }
      }
    };
    loadData();
  }, [user]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl gradient-deep-blue shadow-2xl group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-[80px] -mr-40 -mt-40 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-[60px] -ml-32 -mb-32 animate-pulse delay-1000"></div>

        <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-sm animate-fade-in">
              <Users className="h-4 w-4 text-white" />
              <span className="text-sm font-medium text-white/90">Espace Enseignant</span>
            </div>

            <div className="space-y-2 animate-fade-up">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
                Bienvenue, <br />
                <span className="text-white/90">Prof. {user?.lastName}</span>
              </h2>
              <p className="text-lg text-white/80 font-medium max-w-lg leading-relaxed">
                Gérez vos cours et les notes de vos étudiants avec précision et élégance.
              </p>
            </div>
          </div>

          <div className="hidden md:block animate-float">
            <div className="relative w-32 h-32 flex items-center justify-center bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl rotate-3 hover:rotate-6 transition-all duration-500">
              <BookOpen className="h-16 w-16 text-white drop-shadow-lg" />
            </div>
          </div>
        </div>
      </div>

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
                const filiere = filieres.find((f) => f.id === subject.filiereId);
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
