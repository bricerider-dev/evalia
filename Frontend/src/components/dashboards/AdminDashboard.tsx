import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { getFilieres } from '@/api/filiere';
import { getEtudiants } from '@/api/etudiant';
import { getEnseignants } from '@/api/enseignant';
import { getSubjects } from '@/api/subject';
import { getGrades } from '@/api/grade';
import { Users, GraduationCap, BookOpen, ClipboardList, TrendingUp, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 100 }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8"
    >
      {/* Tech Welcome Banner */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[2.5rem] gradient-deep-blue shadow-2xl group border border-white/10">
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-white/10 rounded-full blur-[100px] -mr-40 -mt-40 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-black/20 rounded-full blur-[80px] -ml-32 -mb-32 animate-pulse delay-1000"></div>

        <div className="relative z-10 p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg"
            >
              <TrendingUp className="h-4 w-4 text-white" />
              <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Administrative Console</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-2"
            >
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">Bienvenue, Admin</h2>
              <p className="text-lg text-blue-100 font-medium max-w-xl leading-relaxed">
                Tableau de bord de gestion centralisé. Visualisez et pilotez les performances académiques de l'ENSPD en temps réel.
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="hidden md:block relative"
          >
            <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full transform translate-y-4"></div>
            <div className="relative p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl hover:scale-105 transition-transform duration-500">
              <TrendingUp className="h-16 w-16 text-white drop-shadow-xl" />
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={containerVariants} className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="tech-card p-6 bg-white dark:bg-card border-0 shadow-institutional rounded-3xl"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                {stat.title}
              </span>
              <div className={`p-3 rounded-xl ${stat.color} shadow-sm ring-1 ring-black/5`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <div className="text-4xl font-black text-primary tracking-tighter">{stat.value}</div>
            <p className="text-xs text-muted-foreground font-bold mt-2 flex items-center gap-1.5 opacity-80">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              {stat.description}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Bottom Layout */}
      <motion.div variants={itemVariants} className="grid gap-8 lg:grid-cols-3">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black flex items-center gap-3 text-primary">
              <span className="p-2 bg-primary/10 rounded-xl"><ClipboardList className="h-5 w-5" /></span>
              Actions Rapides
            </h3>
          </div>
          <motion.div variants={containerVariants} className="grid gap-4 md:grid-cols-2">
            <QuickAction
              title="Filieres"
              description="Nouveaux programmes"
              href="/dashboard/filieres"
              delay={0}
            />
            <QuickAction
              title="Etudiants"
              description="Nouveaux inscrits"
              href="/dashboard/students"
              delay={1}
            />
            <QuickAction
              title="Evaluations"
              description="Planification session"
              href="/dashboard/evaluations"
              delay={2}
            />
            <QuickAction
              title="Rapports"
              description="Statistiques globales"
              href="/dashboard/reports"
              delay={3}
            />
          </motion.div>
        </div>

        {/* System Health / Status */}
        <div className="space-y-6">
          <h3 className="text-xl font-black flex items-center gap-3 text-primary">
            <span className="p-2 bg-primary/10 rounded-xl"><TrendingUp className="h-5 w-5" /></span>
            Statut du Système
          </h3>
          <motion.div whileHover={{ scale: 1.02 }} className="tech-card p-6 bg-emerald-500/5 border-emerald-500/20 rounded-3xl cursor-pointer transition-all hover:shadow-lg hover:shadow-emerald-500/10">
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-sm text-emerald-900 dark:text-emerald-100">Notes Saisies</p>
              <Badge className="bg-emerald-500 text-white border-0 font-bold px-3 py-1">On Track</Badge>
            </div>
            <div className="text-4xl font-black mb-1 text-emerald-600 dark:text-emerald-400">{stats.grades}</div>
            <p className="text-xs font-bold text-emerald-600/70 dark:text-emerald-400/70">Volume de données traitées</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className="tech-card p-6 bg-yellow-500/5 border-yellow-500/20 rounded-3xl cursor-pointer transition-all hover:shadow-lg hover:shadow-yellow-500/10">
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-sm text-yellow-900 dark:text-yellow-100">Sessions RA</p>
              <Badge className="bg-yellow-500 text-white border-0 font-bold px-3 py-1">Pending</Badge>
            </div>
            <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 mb-2">
              <AlertTriangle className="h-6 w-6" />
              <span className="font-black text-lg">Action Requise</span>
            </div>
            <p className="text-xs font-bold text-yellow-600/70 dark:text-yellow-400/70">Étudiants en attente de rattrapages</p>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function QuickAction({
  title,
  description,
  href,
  delay
}: {
  title: string;
  description: string;
  href: string;
  delay: number;
}) {
  return (
    <motion.a
      href={href}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1 + 0.5 }}
      whileHover={{ scale: 1.03, backgroundColor: "rgba(37, 99, 235, 0.05)" }}
      whileTap={{ scale: 0.98 }}
      className="tech-card p-5 group flex items-center justify-between border-2 border-transparent bg-white dark:bg-card shadow-sm hover:border-primary/20 hover:shadow-xl transition-all duration-300 rounded-2xl cursor-pointer"
    >
      <div>
        <p className="font-black text-lg text-foreground group-hover:text-primary transition-colors">{title}</p>
        <p className="text-xs text-muted-foreground font-bold">{description}</p>
      </div>
      <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-inner group-hover:shadow-lg group-hover:shadow-primary/30">
        <ArrowUpRight className="h-6 w-6" />
      </div>
    </motion.a>
  );
}
