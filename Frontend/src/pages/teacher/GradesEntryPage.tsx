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
import { getEvaluationsCC, getEvaluationsSN, getEvaluationsRA } from '@/api/evaluation';
import { getEtudiants } from '@/api/etudiant';
import { getGrades, createGrade, updateGrade } from '@/api/grade';
import { ClipboardList, Save, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

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
          const [cc, sn, ra] = await Promise.all([
            getEvaluationsCC(),
            getEvaluationsSN(),
            getEvaluationsRA()
          ]);

          const subjectEvals = [
            ...cc.map((e: any) => ({ ...e, type: 'CC' })),
            ...sn.map((e: any) => ({ ...e, type: 'SN' })),
            ...ra.map((e: any) => ({ ...e, type: 'RA' }))
          ].filter(e => e.subjectId === selectedSubject);

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
  const selectedSubj = subjects.find((s) => s.id === selectedSubject);

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      CC: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      SN: 'bg-green-500/10 text-green-600 border-green-500/20',
      RA: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    };
    return <Badge className={styles[type] || ''}>{type}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-5 animate-fade-in-up">
        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-3xl gradient-deep-blue shadow-2xl group mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -mr-32 -mt-32 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-[60px] -ml-24 -mb-24 animate-pulse delay-1000"></div>

          <div className="relative z-10 p-8 flex items-center justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-sm animate-fade-in">
                <ClipboardList className="h-4 w-4 text-white" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Gestion des Notes</span>
              </div>
              <h2 className="text-3xl font-black text-white tracking-tight animate-fade-up">Saisie des Notes</h2>
              <p className="text-white/80 font-medium max-w-lg animate-fade-up delay-100">
                Sélectionnez une matière et une évaluation pour saisir ou modifier les notes des étudiants.
              </p>
            </div>
            <div className="hidden md:block animate-float">
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
                <Save className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        <Card className="border-0 shadow-lg animate-fade-in-up delay-200">
          <CardHeader className="py-4 px-6 bg-muted/30">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-primary"></div>
              Critères de Sélection
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Matière</label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Sélectionner une matière" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.code} - {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Évaluation</label>
                <Select
                  value={selectedEvaluation}
                  onValueChange={setSelectedEvaluation}
                  disabled={!selectedSubject}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Sélectionner une évaluation" />
                  </SelectTrigger>
                  <SelectContent>
                    {evaluations.map((evaluation) => (
                      <SelectItem key={evaluation.id} value={evaluation.id}>
                        {evaluation.type} - {evaluation.date_evaluation}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedEvaluation && students.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-4 px-6">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ClipboardList className="h-5 w-5" />
                  {selectedEval && getTypeBadge(selectedEval.type)}
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  {students.length} étudiant(s) • Note sur 20
                </CardDescription>
              </div>
              <Button onClick={handleSaveGrades} disabled={isSaving} size="sm">
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Envoi...' : 'Enregistrer'}
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="py-2.5 px-6 font-black uppercase text-[10px] tracking-wider text-primary">Matricule</TableHead>
                    <TableHead className="py-2.5 px-6 font-black uppercase text-[10px] tracking-wider text-primary">Nom Complet</TableHead>
                    <TableHead className="py-2.5 px-6 font-black uppercase text-[10px] tracking-wider text-primary w-[120px]">Note</TableHead>
                    <TableHead className="py-2.5 px-6 font-black uppercase text-[10px] tracking-wider text-primary w-[100px]">Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student, index) => (
                    <TableRow key={student.id} className={`animate-fade-in-right stagger-${index % 10 + 1}`}>
                      <TableCell className="py-3 px-6 font-mono text-sm font-medium text-primary">{student.user.username}</TableCell>
                      <TableCell className="py-3 px-6 font-bold text-sm">
                        {student.user.firstName} {student.user.lastName}
                      </TableCell>
                      <TableCell className="py-3 px-6">
                        <Input
                          type="number"
                          min="0"
                          max="20"
                          step="0.25"
                          value={grades[student.id] ?? ''}
                          onChange={(e) => handleGradeChange(student.id, e.target.value)}
                          placeholder="—"
                          className={`w-20 h-9 text-sm font-bold text-center ${grades[student.id] !== null && (grades[student.id] as number) >= 10
                              ? 'text-green-600 bg-green-50 border-green-200 focus-visible:ring-green-500'
                              : grades[student.id] !== null
                                ? 'text-red-600 bg-red-50 border-red-200 focus-visible:ring-red-500'
                                : ''
                            }`}
                        />
                      </TableCell>
                      <TableCell className="py-3 px-6">
                        {grades[student.id] !== null ? (
                          <div className="flex items-center gap-1.5 text-green-600 animate-fade-in">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-[10px] font-bold uppercase">Saisi</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/50 text-[10px] font-bold uppercase tracking-wider">En attente</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {selectedEvaluation && students.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Aucun étudiant inscrit pour cette sélection.
            </CardContent>
          </Card>
        )}

        {!selectedEvaluation && (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-up delay-300">
            <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mb-6 animate-pulse">
              <ClipboardList className="h-10 w-10 text-muted-foreground/40" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Prêt à saisir les notes ?</h3>
            <p className="text-muted-foreground max-w-sm">
              Utilisez les filtres ci-dessus pour sélectionner une matière et une évaluation.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
