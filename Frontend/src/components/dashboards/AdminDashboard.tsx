import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getFilieres, getStudents, getTeachers, getSubjects, getGrades } from '@/lib/storage';
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
    setStats({
      filieres: getFilieres().length,
      students: getStudents().length,
      teachers: getTeachers().length,
      subjects: getSubjects().length,
      grades: getGrades().length,
    });
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
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card className="gradient-institutional text-primary-foreground border-0">
        <CardHeader>
          <CardTitle className="text-2xl">Bienvenue sur UniGrades</CardTitle>
          <CardDescription className="text-primary-foreground/80">
            Tableau de bord administratif - Vue d'ensemble du département
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
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
      className="flex items-center justify-between p-3 rounded-lg border hover:bg-secondary/50 transition-colors"
    >
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <span className="text-primary">→</span>
    </a>
  );
}
