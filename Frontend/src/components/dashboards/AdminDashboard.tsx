import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getFilieres } from '@/api/filiere';
import { getEtudiants } from '@/api/etudiant';
import { getEnseignants } from '@/api/enseignant';
import { getSubjects } from '@/api/subject';
import { getGrades } from '@/api/grade';
import { Users, GraduationCap, BookOpen, ClipboardList, TrendingUp, AlertTriangle, ArrowUpRight } from 'lucide-react';

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
      color: 'text-primary bg-primary/10',
    },
    {
      title: 'Étudiants',
      value: stats.students,
      icon: Users,
      description: 'Inscrits cette année',
      color: 'text-emerald-500 bg-emerald-500/10',
    },
    {
      title: 'Enseignants',
      value: stats.teachers,
      icon: Users,
      description: 'Corps professoral',
      color: 'text-purple-500 bg-purple-500/10',
    },
    {
      title: 'Matières',
      value: stats.subjects,
      icon: BookOpen,
      description: 'Cours dispensés',
      color: 'text-cyan-500 bg-cyan-500/10',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in stagger-1">
      {/* Tech Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl gradient-deep-blue shadow-2xl group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-[80px] -mr-40 -mt-40 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-[60px] -ml-32 -mb-32 animate-pulse delay-1000"></div>

        <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-sm animate-fade-in">
              <span className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Administrative Console</span>
            </div>

            <div className="space-y-2 animate-fade-up">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">Bienvenue, Admin</h2>
              <p className="text-lg text-white/80 font-medium max-w-xl leading-relaxed">
                Tableau de bord de gestion centralisé. Visualisez et pilotez les performances académiques de l'ENSPD en temps réel.
              </p>
            </div>
          </div>

          <div className="hidden md:block animate-float">
            <div className="relative w-32 h-32 flex items-center justify-center bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl rotate-3 hover:rotate-6 transition-all duration-500">
              <TrendingUp className="h-16 w-16 text-white drop-shadow-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <div key={stat.title} className={`tech-card p-6 animate-fade-up stagger-${index + 1}`}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                {stat.title}
              </span>
              <div className={`p-2.5 rounded-xl ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <div className="text-4xl font-black">{stat.value}</div>
            <p className="text-xs text-muted-foreground font-medium mt-2 flex items-center gap-1 opacity-70">
              <TrendingUp className="h-3 w-3 text-emerald-500" />
              {stat.description}
            </p>
          </div>
        ))}
      </div>

      {/* Bottom Layout */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              Actions Rapides
            </h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <QuickAction
              title="Filieres"
              description="Nouveaux programmes"
              href="/dashboard/filieres"
            />
            <QuickAction
              title="Etudiants"
              description="Nouveaux inscrits"
              href="/dashboard/students"
            />
            <QuickAction
              title="Evaluations"
              description="Planification session"
              href="/dashboard/evaluations"
            />
            <QuickAction
              title="Rapports"
              description="Statistiques globales"
              href="/dashboard/reports"
            />
          </div>
        </div>

        {/* System Health / Status */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Statut du Système
          </h3>
          <div className="tech-card p-6 bg-emerald-500/5 border-emerald-500/20">
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-sm">Notes Saisies</p>
              <Badge className="bg-emerald-500 text-white border-0">On Track</Badge>
            </div>
            <div className="text-4xl font-black mb-1">{stats.grades}</div>
            <p className="text-xs text-muted-foreground">Volume de données traitées ce semestre</p>
          </div>

          <div className="tech-card p-6 bg-yellow-500/5 border-yellow-500/20">
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-sm">Sessions RA</p>
              <Badge className="bg-yellow-500 text-black border-0">Pending</Badge>
            </div>
            <div className="flex items-center gap-2 text-yellow-500">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-bold">Vérification Requise</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Étudiants en attente de rattrapages</p>
          </div>
        </div>
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
      className="tech-card p-5 group flex items-center justify-between hover:bg-primary/5 border-white/5"
    >
      <div>
        <p className="font-bold text-lg group-hover:text-primary transition-colors">{title}</p>
        <p className="text-xs text-muted-foreground font-medium">{description}</p>
      </div>
      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
        <ArrowUpRight className="h-5 w-5" />
      </div>
    </a>
  );
}
