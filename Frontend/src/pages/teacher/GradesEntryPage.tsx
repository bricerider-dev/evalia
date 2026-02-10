import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getSubjects } from '@/api/subject';
import { getEvaluations } from '@/api/evaluation';
import { getEtudiants } from '@/api/etudiant';
import { getGrades, createGrade, updateGrade } from '@/api/grade';
import { ClipboardList, Save, CheckCircle, GraduationCap, ChevronRight, Users } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function GradesEntryPage() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [selectedEvaluation, setSelectedEvaluation] = useState<string>('');
  const [students, setStudents] = useState<any[]>([]);
  const [grades, setGrades] = useState<Record<string, number | null>>({});
  const [existingGrades, setExistingGrades] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const allSubjects = await getSubjects();
        // Filter by teacher if user is teacher
        const teacherSubjects = user?.role === 'teacher'
          ? allSubjects.filter((s: any) => s.responsibleTeacherId === user.id)
          : allSubjects;
        setSubjects(teacherSubjects);
      } catch (error) {
        toast.error('Erreur lors du chargement des matières');
      }
    };
    if (user) loadSubjects();
  }, [user]);

  useEffect(() => {
    const loadEvaluations = async () => {
      if (selectedSubject) {
        try {
          const [evals] = await Promise.all([
            getEvaluations()
          ]);

          const subjectEvals = evals.filter(e => e.subjectId === selectedSubject);
          setEvaluations(subjectEvals);
          setSelectedEvaluation('');
          setStudents([]);
          setGrades({});
        } catch (error) {
          toast.error('Erreur lors du chargement des évaluations');
        }
      }
    };
    loadEvaluations();
  }, [selectedSubject]);

  useEffect(() => {
    const loadStudentsAndGrades = async () => {
      if (selectedEvaluation && selectedSubject) {
        try {
          const [allStudents, allGrades] = await Promise.all([
            getEtudiants(),
            getGrades()
          ]);

          const subject = subjects.find(s => String(s.id) === String(selectedSubject));
          const filiereStudents = allStudents.filter((s: any) => {
            // If subject has a filiere property, use it. Otherwise, use what's available or default to true for now.
            const subjectFiliere = subject?.filiere;
            return subjectFiliere ? s.filiere === subjectFiliere : true;
          });
          setStudents(filiereStudents);

          const currentEvalEvals = allGrades.filter((g: any) => {
            const evalObj = evaluations.find(e => e.id === selectedEvaluation);
            if (!evalObj) return false;
            if (evalObj.type === 'CC') return g.controle_continu === selectedEvaluation;
            if (evalObj.type === 'SN') return g.session_normale === selectedEvaluation;
            if (evalObj.type === 'RA') return g.rattrapage === selectedEvaluation;
            return false;
          });
          setExistingGrades(currentEvalEvals);

          const gradesMap: Record<string, number | null> = {};
          filiereStudents.forEach((student: any) => {
            const existingGrade = currentEvalEvals.find((g: any) => String(g.studentId) === String(student.id));
            gradesMap[student.id] = existingGrade?.score ?? null;
          });
          setGrades(gradesMap);

        } catch (error) {
          toast.error('Erreur lors du chargement des notes');
        }
      }
    };
    loadStudentsAndGrades();
  }, [selectedEvaluation]);

  const handleGradeChange = (studentId: string, value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    if (numValue !== null && (numValue < 0 || numValue > 20)) {
      return;
    }
    setGrades((prev) => ({ ...prev, [studentId]: numValue }));
  };

  const handleSaveGrades = async () => {
    if (!selectedEvaluation || !user) return;
    setIsSaving(true);

    try {
      const evalObj = evaluations.find(e => e.id === selectedEvaluation);
      if (!evalObj) return;

      const promises = Object.entries(grades).map(async ([studentId, score]) => {
        if (score !== null) {
          const existingGrade = existingGrades.find(g => g.studentId === studentId);

          const payload: any = {
            studentId,
            score,
            enteredBy: user.id,
            isValidated: false,
          };

          if (evalObj.type === 'CC') payload.controle_continu = selectedEvaluation;
          else if (evalObj.type === 'SN') payload.session_normale = selectedEvaluation;
          else if (evalObj.type === 'RA') payload.rattrapage = selectedEvaluation;

          if (existingGrade) {
            await updateGrade(existingGrade.id, payload);
          } else {
            await createGrade(payload);
          }
        }
      });

      await Promise.all(promises);
      toast.success('Notes enregistrées avec succès');

      // Refresh
      const allGrades = await getGrades();
      const currentEvalEvals = allGrades.filter((g: any) => {
        if (evalObj.type === 'CC') return g.controle_continu === selectedEvaluation;
        if (evalObj.type === 'SN') return g.session_normale === selectedEvaluation;
        if (evalObj.type === 'RA') return g.rattrapage === selectedEvaluation;
        return false;
      });
      setExistingGrades(currentEvalEvals);
    } catch (error) {
      console.error('Error saving grades:', error);
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setIsSaving(false);
    }
  };

  const selectedEval = evaluations.find((e) => e.id === selectedEvaluation);

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      CC: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      SN: 'bg-green-500/10 text-green-600 border-green-500/20',
      RA: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    };
    return <Badge className={`${styles[type] || ''} font-black`}>{type}</Badge>;
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
        {/* Header Banner */}
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[2.5rem] gradient-deep-blue shadow-2xl group mb-8 border border-white/10">
          <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-white/10 rounded-full blur-[100px] -mr-48 -mt-48 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-[25rem] h-[25rem] bg-black/20 rounded-full blur-[80px] -ml-32 -mb-32 animate-pulse delay-1000"></div>

          <div className="relative z-10 p-10 flex items-center justify-between">
            <div className="space-y-4 max-w-2xl">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg"
              >
                <ClipboardList className="h-4 w-4 text-white" />
                <span className="text-xs font-black text-white uppercase tracking-wider">Gestion Académique</span>
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight"
              >
                Saisie des Notes
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-lg text-blue-100 font-medium leading-relaxed"
              >
                Gérez les évaluations et enregistrez les performances académiques de vos étudiants.
              </motion.p>
            </div>
            <motion.div
              initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ delay: 0.6, type: "spring" }}
              className="hidden lg:block relative"
            >
              <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full transform translate-y-4"></div>
              <div className="relative p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-700">
                <GraduationCap className="h-20 w-20 text-white drop-shadow-xl" />
              </div>
            </motion.div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-institutional bg-white/60 dark:bg-card/60 backdrop-blur-xl rounded-[2rem] border border-white/5 ring-1 ring-black/5 overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-white/5 py-6 px-8">
              <CardTitle className="text-lg font-black text-primary flex items-center gap-2">
                <span className="w-1.5 h-6 rounded-full gradient-institutional mr-2"></span>
                Critères de Sélection
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-3 group">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground group-focus-within:text-primary transition-colors">Matière</label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger className="h-14 text-base rounded-2xl bg-white border-2 border-slate-100 focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all shadow-sm">
                      <SelectValue placeholder="Sélectionner une matière" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-none shadow-2xl">
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={String(subject.id)} className="py-3 text-base cursor-pointer">
                          <span className="font-bold mr-2">{subject.code}</span>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3 group">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground group-focus-within:text-primary transition-colors">Évaluation</label>
                  <Select
                    value={selectedEvaluation}
                    onValueChange={setSelectedEvaluation}
                    disabled={!selectedSubject}
                  >
                    <SelectTrigger className="h-14 text-base rounded-2xl bg-white border-2 border-slate-100 focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all shadow-sm disabled:opacity-50">
                      <SelectValue placeholder="Sélectionner une évaluation" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-none shadow-2xl">
                      {evaluations.map((evaluation) => (
                        <SelectItem key={evaluation.id} value={evaluation.id} className="py-3 text-base cursor-pointer">
                          <div className="flex items-center gap-2">
                            {getTypeBadge(evaluation.type)}
                            <span className="text-muted-foreground ml-2">{evaluation.date_evaluation}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <AnimatePresence mode="wait">
          {selectedEvaluation && students.length > 0 && (
            <motion.div
              key="table"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-0 shadow-2xl rounded-[2rem] overflow-hidden bg-white/60 dark:bg-card/60 backdrop-blur-xl border-white/20 ring-1 ring-black/5">
                <CardHeader className="flex flex-row items-center justify-between py-6 px-8 bg-muted/30 border-b border-white/5">
                  <div>
                    <CardTitle className="flex items-center gap-3 text-xl font-black text-primary">
                      <span className="p-2 bg-primary/10 rounded-xl">
                        <ClipboardList className="h-5 w-5" />
                      </span>
                      {selectedEval && getTypeBadge(selectedEval.type)}
                    </CardTitle>
                    <CardDescription className="text-sm font-bold text-muted-foreground mt-2 pl-1 flex items-center gap-2">
                      <span>{students.length} étudiant(s)</span>
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/30"></span>
                      <span>Note sur 20</span>
                    </CardDescription>
                  </div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={handleSaveGrades}
                      disabled={isSaving}
                      className="bg-primary text-white rounded-xl shadow-lg hover:shadow-primary/25 h-12 px-6 font-bold"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {isSaving ? 'Envoi...' : 'Enregistrer Tout'}
                    </Button>
                  </motion.div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-muted/10">
                        <TableRow className="border-b border-white/5 hover:bg-transparent">
                          <TableHead className="py-4 px-8 font-black uppercase text-[10px] tracking-widest text-primary">Matricule</TableHead>
                          <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest text-primary">Nom Complet</TableHead>
                          <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest text-primary w-[140px]">Note / 20</TableHead>
                          <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest text-primary w-[120px]">Statut</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.map((student, index) => (
                          <motion.tr
                            key={student.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="group hover:bg-primary/5 transition-colors border-b border-slate-100 last:border-0"
                          >
                            <TableCell className="py-4 px-8">
                              <span className="font-mono font-bold text-sm bg-white border border-slate-200 px-2 py-1 rounded-md text-slate-600">
                                {student.user.username}
                              </span>
                            </TableCell>
                            <TableCell className="py-4 px-6">
                              <div className="font-bold text-foreground/80">{student.user.firstName} {student.user.lastName}</div>
                            </TableCell>
                            <TableCell className="py-4 px-6">
                              <div className="relative">
                                <Input
                                  type="number"
                                  min="0"
                                  max="20"
                                  step="0.25"
                                  value={grades[student.id] ?? ''}
                                  onChange={(e) => handleGradeChange(student.id, e.target.value)}
                                  placeholder="-"
                                  className={`w-24 h-10 text-base font-black text-center shadow-sm transition-all border-2 focus:ring-4 focus:ring-primary/10 ${grades[student.id] !== null && (grades[student.id] as number) >= 10
                                    ? 'text-green-600 bg-green-50 border-green-200 focus:border-green-500'
                                    : grades[student.id] !== null
                                      ? 'text-red-600 bg-red-50 border-red-200 focus:border-red-500'
                                      : 'bg-white border-slate-200'
                                    }`}
                                />
                              </div>
                            </TableCell>
                            <TableCell className="py-4 px-6">
                              {grades[student.id] !== null ? (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-full w-fit"
                                >
                                  <CheckCircle className="h-3.5 w-3.5" />
                                  <span className="text-[10px] font-black uppercase tracking-wider">Saisi</span>
                                </motion.div>
                              ) : (
                                <span className="text-muted-foreground/30 text-[10px] font-black uppercase tracking-widest pl-2">—</span>
                              )}
                            </TableCell>
                          </motion.tr>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {selectedEvaluation && students.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card className="border-dashed border-2 border-slate-200">
                <CardContent className="py-16 text-center text-muted-foreground">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-slate-300" />
                  </div>
                  <p className="font-bold">Aucun étudiant inscrit pour cette sélection.</p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {!selectedEvaluation && (
          <motion.div
            variants={itemVariants}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent rounded-full flex items-center justify-center mb-6 ring-1 ring-primary/20 shadow-xl">
              <ChevronRight className="h-10 w-10 text-primary opacity-50 ml-1" />
            </div>
            <h3 className="text-2xl font-black text-foreground mb-3 tracking-tight">Prêt à saisir les notes ?</h3>
            <p className="text-muted-foreground font-medium max-w-md mx-auto text-lg">
              Utilisez les filtres ci-dessus pour sélectionner une matière et une évaluation.
            </p>
          </motion.div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
