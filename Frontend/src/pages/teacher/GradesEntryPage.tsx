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

          const subject = subjects.find(s => s.id === selectedSubject);
          const filiereStudents = allStudents.filter((s: any) => s.filiere === subject.filiereId || true); // Need to check how filiere is linked
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
            const existingGrade = currentEvalEvals.find((g: any) => g.studentId === student.id);
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
        <div>
          <h2 className="text-xl font-bold">Saisie des Notes</h2>
          <p className="text-sm text-muted-foreground">
            Entrez les notes pour vos évaluations
          </p>
        </div>

        <Card>
          <CardHeader className="py-3 px-6">
            <CardTitle className="text-base">Sélection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Matière</label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
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
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Évaluation</label>
                <Select
                  value={selectedEvaluation}
                  onValueChange={setSelectedEvaluation}
                  disabled={!selectedSubject}
                >
                  <SelectTrigger>
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
                  {selectedSubj?.name} - {selectedEval && getTypeBadge(selectedEval.type)}
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
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="py-2 px-6 font-mono text-sm">{student.studentId}</TableCell>
                      <TableCell className="py-2 px-6 font-bold text-sm">
                        {student.user?.first_name} {student.user?.last_name}
                      </TableCell>
                      <TableCell className="py-2 px-6">
                        <Input
                          type="number"
                          min="0"
                          max="20"
                          step="0.25"
                          value={grades[student.id] ?? ''}
                          onChange={(e) => handleGradeChange(student.id, e.target.value)}
                          placeholder="—"
                          className="w-20 h-8 text-sm"
                        />
                      </TableCell>
                      <TableCell className="py-2 px-6">
                        {grades[student.id] !== null ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-tighter">Absent</span>
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
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Sélectionnez une matière et une évaluation pour commencer la saisie.
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
