import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getSubjects } from '@/api/subject';
import { getFilieres } from '@/api/filiere';
import { getGrades } from '@/api/grade';
import { Student, SubjectResult } from '@/lib/types';
import { BookOpen, Award, TrendingUp, AlertTriangle, CheckCircle, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';

export function StudentDashboard() {
  const { user } = useAuth();
  const [results, setResults] = useState<SubjectResult[]>([]);
  const [average, setAverage] = useState<number | null>(null);
  const [filiereName, setFiliereName] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (user && 'filiere' in user) {
        try {
          const student = user as Student;
          const [allFilieres, allSubjects, allGrades] = await Promise.all([
            getFilieres(),
            getSubjects(),
            getGrades()
          ]);

          const filiere = allFilieres.find((f: any) => f.id === student.filiere);
          setFiliereName(filiere?.name || '');

          // Filter subjects for student's filiere
          const filiereSubjects = allSubjects.filter((s: any) => s.filiereId === student.filiere || s.uniteEnseignementId); // Simplified logic

          // Mocking calculation for now based on allGrades
          // In a real app, the backend would provide this pre-calculated
          const studentResults: SubjectResult[] = filiereSubjects.map((sub: any) => {
            const grades = allGrades.filter((g: any) => g.studentId === student.id && g.subjectId === sub.id);
            return {
              subjectId: sub.id,
              subjectName: sub.name,
              ccScore: grades.find((g: any) => g.evaluationId?.includes('CC'))?.score || null,
              snScore: grades.find((g: any) => g.evaluationId?.includes('SN'))?.score || null,
              raScore: grades.find((g: any) => g.evaluationId?.includes('RA'))?.score || null,
              finalScore: null, // To be calculated
              decision: 'Non Validé',
              coefficient: sub.coefficient
            };
          });

          setResults(studentResults);
          setAverage(0); // Placeholder
        } catch (error) {
          console.error("Error loading student dashboard data:", error);
        }
      }
    };
    loadData();
  }, [user]);

  const validatedCount = results.filter((r) => r.decision === 'Validé').length;
  const rattrapageCount = results.filter((r) => r.decision === 'Rattrapage').length;

  const getDecisionBadge = (decision: string) => {
    switch (decision) {
      case 'Validé':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20 font-black">Validé</Badge>;
      case 'Rattrapage':
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 font-black">Rattrapage</Badge>;
      case 'Non Validé':
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20 font-black">Non Validé</Badge>;
      default:
        return <Badge variant="outline" className="font-bold">{decision}</Badge>;
    }
  };

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
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[2.5rem] gradient-premium shadow-2xl group border border-white/10">
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-white/10 rounded-full blur-[100px] -mr-40 -mt-40 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-black/10 rounded-full blur-[80px] -ml-32 -mb-32 animate-pulse delay-1000"></div>

        <div className="relative z-10 p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg"
            >
              <GraduationCap className="h-4 w-4 text-white" />
              <span className="text-[10px] font-black text-white uppercase tracking-wider">Espace Étudiant • 2024-2025</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-2"
            >
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
                Bienvenue, <br />
                <span className="text-white/90">{user?.firstName} {user?.lastName}</span>
              </h1>
              <p className="text-lg text-white/80 font-medium max-w-lg leading-relaxed">
                Votre tableau de bord centralisé pour suivre vos performances et votre progression académique.
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
              <GraduationCap className="h-16 w-16 text-white drop-shadow-xl" />
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats & Average */}
      <motion.div variants={containerVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Moyenne Générale"
          value={average !== null ? average.toFixed(2) : '—'}
          icon={Award}
          description={average !== null ? 'Mention Assez Bien' : 'En attente'}
          color="bg-primary/10 text-primary"
          index={1}
        />

        <StatCard
          title="Validées"
          value={validatedCount}
          icon={CheckCircle}
          description={`sur ${results.length} matières`}
          color="bg-green-500/10 text-green-600"
          index={2}
        />

        <StatCard
          title="Rattrapages"
          value={rattrapageCount}
          icon={AlertTriangle}
          description="Examens à repasser"
          color="bg-yellow-500/10 text-yellow-600"
          index={3}
        />

        <motion.div
          variants={itemVariants}
          whileHover={{ y: -5 }}
          className="hover-lift border-0 shadow-institutional bg-white rounded-[2rem] overflow-hidden"
        >
          <div className="p-6">
            <div className="flex flex-row items-center justify-between pb-4">
              <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                Progression
              </h3>
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 shadow-inner">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-primary tracking-tighter">
                {results.length > 0 ? Math.round((validatedCount / results.length) * 100) : 0}%
              </div>
              <Progress
                value={results.length > 0 ? (validatedCount / results.length) * 100 : 0}
                className="mt-3 h-2 bg-slate-100 rounded-full"
                indicatorClassName="gradient-institutional"
              />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Grades Table */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-2xl rounded-[2rem] overflow-hidden bg-white">
          <CardHeader className="bg-slate-50 border-b border-slate-100 py-6 px-10">
            <CardTitle className="flex items-center gap-3 text-xl font-black text-primary">
              <span className="p-2 bg-primary/10 rounded-xl"><BookOpen className="h-5 w-5" /></span>
              Mes Notes
            </CardTitle>
            <CardDescription className="text-xs font-bold text-muted-foreground mt-1 ml-1">
              Résultats par matière - Formule: (CC × 30%) + (SN × 70%)
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {results.length === 0 ? (
              <p className="text-muted-foreground text-center py-20 font-bold text-xl">
                Aucune note disponible pour le moment
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50/50">
                    <tr className="border-b border-slate-100">
                      <th className="text-left py-5 px-10 font-black text-primary uppercase tracking-widest text-[10px]">Matière</th>
                      <th className="text-center py-5 px-6 font-black text-primary uppercase tracking-widest text-[10px]">CC</th>
                      <th className="text-center py-5 px-6 font-black text-primary uppercase tracking-widest text-[10px]">SN</th>
                      <th className="text-center py-5 px-6 font-black text-primary uppercase tracking-widest text-[10px]">RA</th>
                      <th className="text-center py-5 px-6 font-black text-primary uppercase tracking-widest text-[10px]">Final</th>
                      <th className="text-center py-5 px-6 font-black text-primary uppercase tracking-widest text-[10px]">Coef.</th>
                      <th className="text-center py-5 px-10 font-black text-primary uppercase tracking-widest text-[10px]">Décision</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result, idx) => (
                      <motion.tr
                        key={result.subjectId}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 + 0.5 }}
                        className="border-b border-slate-50 last:border-0 hover:bg-slate-50/80 transition-colors group"
                      >
                        <td className="py-5 px-10 font-bold text-slate-700 group-hover:text-primary transition-colors text-sm">
                          <div className="flex items-center gap-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-primary transition-colors"></span>
                            {result.subjectName}
                          </div>
                        </td>
                        <td className="py-5 px-6 text-center font-bold text-slate-500 text-sm font-mono">
                          {result.ccScore !== null ? result.ccScore.toFixed(1) : '—'}
                        </td>
                        <td className="py-5 px-6 text-center font-bold text-slate-500 text-sm font-mono">
                          {result.snScore !== null ? result.snScore.toFixed(1) : '—'}
                        </td>
                        <td className="py-5 px-6 text-center font-bold text-slate-500 text-sm font-mono">
                          {result.raScore !== null ? result.raScore.toFixed(1) : '—'}
                        </td>
                        <td className="py-5 px-6 text-center font-black text-primary text-base">
                          {result.finalScore !== null ? result.finalScore.toFixed(2) : '—'}
                        </td>
                        <td className="py-5 px-6 text-center">
                          <Badge variant="outline" className="font-bold text-[10px] h-6 px-2 border-slate-200 bg-white shadow-sm text-slate-500">{result.coefficient}</Badge>
                        </td>
                        <td className="py-5 px-10 text-center">
                          {getDecisionBadge(result.decision)}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
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
  value: string | number;
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
