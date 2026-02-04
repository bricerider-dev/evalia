import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getFilieres } from '@/api/filiere';
import { getEtudiants } from '@/api/etudiant';
import { getEnseignants } from '@/api/enseignant';
import { getSubjects } from '@/api/subject';
import { getGrades } from '@/api/grade';
import { Users, GraduationCap, BookOpen, ClipboardList, TrendingUp, AlertTriangle } from 'lucide-react';

export function AdminDashboard() {
  const [stats, setStats] = useState({
    filieres: 0,
    students: 0,
    teachers: 0,
    subjects: 0,
    grades: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [f, e, t, s, g] = await Promise.all([
          getFilieres(),
          getEtudiants(),
          getEnseignants(),
          getSubjects(),
          getGrades()
        ]);
        setStats({
          filieres: f.length,
          students: e.length,
          teachers: t.length,
          subjects: s.length,
          grades: g.length,
        });
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      }
    };
    loadStats();
  }, []);

  const statCards = [
    {
      title: 'Filières',
      value: stats.filieres,
      icon: GraduationCap,
      description: 'Programmes actifs',
      color: 'bg-blue-500/10 text-blue-600',
    },
    {
      title: 'Étudiants',
      value: stats.students,
      icon: Users,
      description: 'Inscrits cette année',
      color: 'bg-green-500/10 text-green-600',
    },
    {
      title: 'Enseignants',
      value: stats.teachers,
      icon: Users,
      description: 'Corps professoral',
      color: 'bg-purple-500/10 text-purple-600',
    },
    {
      title: 'Matières',
      value: stats.subjects,
      icon: BookOpen,
      description: 'Cours dispensés',
      color: 'bg-orange-500/10 text-orange-600',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Welcome Banner */}
      <Card className="gradient-institutional text-primary-foreground border-0 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-700 group-hover:scale-125"></div>
        <CardHeader className="relative z-10 py-8 px-8">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-2xl font-black tracking-tight">Bienvenue sur ENSPD</CardTitle>
            <CardDescription className="text-base text-primary-foreground/90 font-medium">
              Tableau de bord administratif — Propulsez la réussite académique de votre département.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card key={stat.title} className={`hover-lift border-0 shadow-institutional bg-white transition-all duration-300 stagger-${index + 1}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-1">
              <CardTitle className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                {stat.title}
              </CardTitle>
              <div className={`p-2.5 rounded-xl ${stat.color} shadow-inner`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-primary">{stat.value}</div>
              <p className="text-xs text-muted-foreground font-semibold mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-success" />
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              Actions Rapides
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <QuickAction
              title="Ajouter une filière"
              description="Créer un nouveau programme d'études"
              href="/dashboard/filieres"
            />
            <QuickAction
              title="Inscrire un étudiant"
              description="Ajouter un nouvel étudiant au système"
              href="/dashboard/students"
            />
            <QuickAction
              title="Programmer une évaluation"
              description="Planifier un examen ou contrôle"
              href="/dashboard/evaluations"
            />
            <QuickAction
              title="Générer un rapport"
              description="Créer des statistiques académiques"
              href="/dashboard/reports"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Aperçu Académique
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <div>
                <p className="font-medium">Notes saisies</p>
                <p className="text-sm text-muted-foreground">Ce semestre</p>
              </div>
              <Badge variant="secondary" className="text-lg px-3">
                {stats.grades}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800 dark:text-yellow-200">Rattrapages en attente</p>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">Étudiants en session RA</p>
                </div>
              </div>
              <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                À venir
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function QuickAction({
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
        <p className="text-xs text-muted-foreground font-medium">{description}</p>
      </div>
      <div className="p-2 rounded-full bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
        <TrendingUp className="h-4 w-4 rotate-45" />
      </div>
    </a>
  );
}
