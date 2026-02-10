import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardTitle, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getSubjects } from '@/api/subject';
import { getEtudiants } from '@/api/etudiant';
import { getGrades } from '@/api/grade';
import { getFilieres } from '@/api/filiere';
import { BookOpen, Users, ClipboardList, CheckCircle, AlertCircle, TrendingUp, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

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
      className="space-y-6"
    >
      {/* Welcome Banner */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[2.5rem] gradient-deep-blue shadow-2xl group border border-white/10">
        <div className="absolute top-0 right-0 w-[35rem] h-[35rem] bg-indigo-500/30 rounded-full blur-[100px] -mr-40 -mt-40 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-purple-500/20 rounded-full blur-[80px] -ml-32 -mb-32 animate-pulse delay-1000"></div>

        <div className="relative z-10 p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg"
            >
              <Users className="h-4 w-4 text-white" />
              <span className="text-[10px] font-black text-white uppercase tracking-wider">Espace Enseignant</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-2"
            >
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
                Bienvenue, <br />
                <span className="text-white/90">Prof. {user?.lastName}</span>
              </h2>
              <p className="text-lg text-blue-100 font-medium max-w-lg leading-relaxed">
                Gérez vos cours et les notes de vos étudiants avec précision et élégance.
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0, rotate: 10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="hidden md:block relative"
          >
            <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full transform translate-y-4"></div>
            <div className="relative p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl hover:scale-105 transition-transform duration-500">
              <BookOpen className="h-16 w-16 text-white drop-shadow-xl" />
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={containerVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Subjects List */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="border-0 shadow-institutional bg-white dark:bg-card rounded-[2rem] overflow-hidden flex flex-col h-full">
            <CardHeader className="border-b border-slate-100 py-6 px-8 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black text-primary flex items-center gap-3">
                  <span className="p-2 bg-primary/10 rounded-xl"><BookOpen className="h-5 w-5" /></span>
                  Mes Matières
                </CardTitle>
                <p className="text-sm font-bold text-muted-foreground mt-1 ml-1">
                  Liste des cours que vous enseignez
                </p>
              </div>
              <Badge variant="secondary" className="font-bold">{subjects.length} Cours</Badge>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              {subjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                  <BookOpen className="h-10 w-10 opacity-20 mb-2" />
                  <p className="font-bold">Aucune matière assignée</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {subjects.map((subject, idx) => {
                    const filiere = filieres.find((f) => f.id === subject.filiereId);
                    return (
                      <motion.div
                        key={subject.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-center justify-between p-6 hover:bg-slate-50 transition-colors group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            {subject.code.substring(0, 2)}
                          </div>
                          <div>
                            <p className="font-black text-foreground group-hover:text-primary transition-colors text-base">{subject.name}</p>
                            <p className="text-xs font-bold text-muted-foreground mt-0.5 flex items-center gap-1.5">
                              <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 uppercase tracking-wider text-[10px]">{subject.code}</span>
                              <span>•</span>
                              <span>{filiere?.name || 'N/A'}</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-bold text-[10px] border-slate-200 bg-white shadow-sm">Coef. {subject.coefficient}</Badge>
                          <Badge className="font-bold text-[10px] bg-primary/10 text-primary hover:bg-primary/20">S{subject.semester}</Badge>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-institutional bg-white dark:bg-card rounded-[2rem] overflow-hidden h-full">
            <CardHeader className="border-b border-slate-100 py-6 px-8">
              <CardTitle className="text-xl font-black text-primary flex items-center gap-3">
                <span className="p-2 bg-primary/10 rounded-xl"><ClipboardList className="h-5 w-5" /></span>
                Actions Rapides
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <QuickActionCard
                title="Saisir des Notes"
                description="Entrer les notes d'une évaluation"
                href="/dashboard/grades"
                delay={0}
              />
              <QuickActionCard
                title="Voir les Statistiques"
                description="Consulter les performances"
                href="/dashboard/statistics"
                delay={1}
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
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
    <motion.div
      variants={{
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
      }}
      whileHover={{ y: -5 }}
      className="tech-card p-6 bg-white dark:bg-card border-0 shadow-institutional rounded-[2rem]"
    >
      <div className="flex flex-row items-center justify-between pb-4">
        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
          {title}
        </span>
        <div className={`p-3 rounded-xl ${color} shadow-sm ring-1 ring-black/5`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div>
        <div className="text-4xl font-black text-primary tracking-tighter">{value}</div>
        <p className="text-xs text-muted-foreground font-bold mt-2 flex items-center gap-1.5">
          <TrendingUp className="h-3 w-3 text-emerald-500" />
          {description}
        </p>
      </div>
    </motion.div>
  );
}

function QuickActionCard({
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
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: delay * 0.1 + 0.5 }}
      whileHover={{ scale: 1.02, backgroundColor: "rgba(37, 99, 235, 0.05)" }}
      whileTap={{ scale: 0.98 }}
      className="flex items-center justify-between p-5 rounded-2xl border-2 border-slate-100 bg-white hover:border-primary/20 hover:shadow-xl transition-all duration-300 group cursor-pointer"
    >
      <div>
        <p className="font-black text-base group-hover:text-primary transition-colors">{title}</p>
        <p className="text-xs text-muted-foreground font-bold mt-1">{description}</p>
      </div>
      <div className="p-3 rounded-full bg-slate-50 text-slate-400 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm">
        <ArrowUpRight className="h-5 w-5" />
      </div>
    </motion.a>
  );
}
