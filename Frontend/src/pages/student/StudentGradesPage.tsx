import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getSubjects } from '@/api/subject';
import { getFilieres } from '@/api/filiere';
import { getEvaluationsCC, getEvaluationsSN, getEvaluationsRA } from '@/api/evaluation';
import { getGrades } from '@/api/grade';
import { getSubjectResultForStudent, calculateWeightedAverage, getMention } from '@/lib/gradeCalculator';
import { Student, SubjectResult } from '@/lib/types';
import { FileText, Award, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function StudentGradesPage() {
  const { user } = useAuth();
  const [results, setResults] = useState<SubjectResult[]>([]);
  const [average, setAverage] = useState<number | null>(null);
  const [filiereName, setFiliereName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (user && 'filiere' in user) {
        try {
          const student = user as any;
          const [allFilieres, allSubjects, cc, sn, ra, allGrades] = await Promise.all([
            getFilieres(),
            getSubjects(),
            getEvaluationsCC(),
            getEvaluationsSN(),
            getEvaluationsRA(),
            getGrades()
          ]);

          const filiere = allFilieres.find((f: any) => f.id === student.filiere);
          setFiliereName(filiere?.name || '');

          const allEvals = [
            ...cc.map((e: any) => ({ ...e, type: 'CC' })),
            ...sn.map((e: any) => ({ ...e, type: 'SN' })),
            ...ra.map((e: any) => ({ ...e, type: 'RA' }))
          ];

          // Filter subjects for student's filiere (simplified logic)
          const studentSubjects = allSubjects.filter((s: any) => s.filiereId === student.filiere || true);

          const subjectResults = studentSubjects.map((subject: any) =>
            getSubjectResultForStudent(
              student.id,
              subject.id,
              subject.name,
              subject.coefficient,
              allEvals,
              allGrades
            )
          );
          setResults(subjectResults);

          const weightedAvg = calculateWeightedAverage(subjectResults);
          setAverage(weightedAvg);
        } catch (error) {
          console.error("Error loading student grades:", error);
          toast.error("Erreur lors du chargement des notes");
        } finally {
          setLoading(false);
        }
      }
    };
    loadData();
  }, [user]);

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

  const getScoreColor = (score: number | null) => {
    if (score === null) return '';
    if (score >= 14) return 'text-green-600 font-bold';
    if (score >= 10) return 'text-primary font-bold';
    return 'text-red-500 font-bold';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
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
    <DashboardLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <motion.div variants={itemVariants}>
            <h2 className="text-xl font-black text-primary tracking-tight">Mes Notes</h2>
            <p className="text-sm text-muted-foreground font-medium">
              {filiereName} • Année universitaire 2024-2025
            </p>
          </motion.div>
        </div>

        {/* Summary Card */}
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[2.5rem] gradient-premium shadow-2xl group border border-white/10">
          <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-white/10 rounded-full blur-[100px] -mr-32 -mt-32 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-[20rem] h-[20rem] bg-black/10 rounded-full blur-[60px] -ml-24 -mb-24 animate-pulse delay-1000"></div>

          <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 10 }}
                className="p-5 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl"
              >
                <Award className="h-10 w-10 text-white drop-shadow-md" />
              </motion.div>
              <div className="space-y-1">
                <p className="text-white/80 text-xs font-black uppercase tracking-widest">Moyenne Générale</p>
                <div className="flex items-baseline gap-2">
                  <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, type: 'spring' }}
                    className="text-5xl md:text-6xl font-black text-white tracking-tighter"
                  >
                    {average !== null ? average.toFixed(2) : '—'}
                  </motion.span>
                  <span className="text-white/60 font-medium text-xl">/ 20</span>
                </div>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-black text-white uppercase tracking-wider backdrop-blur-sm">
                  {average !== null ? getMention(average) : 'En attente'}
                </div>
              </div>
            </div>

            <div className="hidden md:block text-right space-y-2 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
              <p className="text-white/80 text-[10px] font-black uppercase tracking-widest">Matières validées</p>
              <div className="flex items-center justify-end gap-3">
                <span className="text-4xl font-black text-white">{results.filter((r) => r.decision === 'Validé').length}</span>
                <span className="text-white/60 text-lg font-medium">/ {results.length}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Grades Table */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-2xl rounded-[2rem] overflow-hidden bg-white/60 dark:bg-card/60 backdrop-blur-xl border-white/20 ring-1 ring-black/5">
            <CardHeader className="py-6 px-8 bg-muted/30 border-b border-white/5">
              <CardTitle className="flex items-center gap-3 text-lg font-black text-primary">
                <span className="p-2 bg-primary/10 rounded-xl">
                  <FileText className="h-5 w-5" />
                </span>
                Détail des Notes
              </CardTitle>
              <CardDescription className="text-xs font-bold text-muted-foreground ml-1">
                Formule: Note Finale = (CC × 30%) + (SN × 70%)
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {results.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground/50">
                  <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-6">
                    <FileText className="h-10 w-10 opacity-50" />
                  </div>
                  <h3 className="text-lg font-black text-foreground">Aucune note disponible</h3>
                  <p className="text-sm font-medium mt-1">
                    Les résultats n'ont pas encore été publiés.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/5 bg-slate-50/50">
                        <th className="text-left py-4 px-8 font-black uppercase text-[10px] tracking-widest text-primary/70">Matière</th>
                        <th className="text-center py-4 px-4 font-black uppercase text-[10px] tracking-widest text-primary/70">
                          <div>CC</div>
                          <div className="text-[9px] font-normal opacity-70">(30%)</div>
                        </th>
                        <th className="text-center py-4 px-4 font-black uppercase text-[10px] tracking-widest text-primary/70">
                          <div>SN</div>
                          <div className="text-[9px] font-normal opacity-70">(70%)</div>
                        </th>
                        <th className="text-center py-4 px-4 font-black uppercase text-[10px] tracking-widest text-primary/70">
                          <div>RA</div>
                          <div className="text-[9px] font-normal opacity-70">(ratt.)</div>
                        </th>
                        <th className="text-center py-4 px-4 font-black uppercase text-[10px] tracking-widest text-primary">Final</th>
                        <th className="text-center py-4 px-4 font-black uppercase text-[10px] tracking-widest text-primary/70">Coef.</th>
                        <th className="text-center py-4 px-4 font-black uppercase text-[10px] tracking-widest text-primary">Décision</th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence>
                        {results.map((result, index) => (
                          <motion.tr
                            key={result.subjectId}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-b border-slate-100 last:border-0 hover:bg-primary/5 transition-colors group"
                          >
                            <td className="py-4 px-8 font-bold text-sm text-foreground/80 group-hover:text-primary transition-colors">
                              <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary/30 group-hover:bg-primary transition-colors"></span>
                                {result.subjectName}
                              </div>
                            </td>
                            <td className="py-4 px-4 text-center text-sm font-mono">
                              <span className={getScoreColor(result.ccScore)}>
                                {result.ccScore !== null ? result.ccScore.toFixed(1) : '—'}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-center text-sm font-mono">
                              <span className={getScoreColor(result.snScore)}>
                                {result.snScore !== null ? result.snScore.toFixed(1) : '—'}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-center text-sm font-mono">
                              <span className={getScoreColor(result.raScore)}>
                                {result.raScore !== null ? result.raScore.toFixed(1) : '—'}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className={`text-base font-black ${getScoreColor(result.finalScore)}`}>
                                {result.finalScore !== null ? result.finalScore.toFixed(2) : '—'}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <Badge variant="outline" className="text-[10px] font-bold h-6 px-2 border-slate-200 bg-white">{result.coefficient}</Badge>
                            </td>
                            <td className="py-4 px-4 text-center">
                              {getDecisionBadge(result.decision)}
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Legend */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-sm bg-white/40 border-white/20">
            <CardContent className="py-4 px-8">
              <div className="flex flex-wrap gap-6 text-[10px] font-black uppercase tracking-wider justify-center md:justify-start">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 text-green-700 border border-green-100">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span>Validé (≥10)</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-100">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <span>Rattrapage (&lt;10, en attente)</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 text-red-700 border border-red-100">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span>Non Validé</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
