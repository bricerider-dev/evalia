import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { getEvaluations, addEvaluation, deleteEvaluation, getSubjects, getFilieres } from '@/lib/storage';
import { Evaluation, Subject, EvaluationType, SessionType } from '@/lib/types';
import { Plus, Trash2, ClipboardList, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function EvaluationsPage() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [formData, setFormData] = useState({
    subjectId: '',
    type: 'CC' as EvaluationType,
    session: 'normal' as SessionType,
    date: '',
    maxScore: 20,
  });

  const loadData = () => {
    setEvaluations(getEvaluations());
    setSubjects(getSubjects());
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setFormData({
      subjectId: '',
      type: 'CC',
      session: 'normal',
      date: '',
      maxScore: 20,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.subjectId || !formData.date) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Check if evaluation already exists for this subject and type
    const exists = evaluations.some(
      (ev) => ev.subjectId === formData.subjectId && ev.type === formData.type
    );
    if (exists) {
      toast.error('Une évaluation de ce type existe déjà pour cette matière');
      return;
    }

    const newEvaluation: Evaluation = {
      id: `eval-${Date.now()}`,
      ...formData,
    };
    addEvaluation(newEvaluation);
    toast.success('Évaluation programmée avec succès');

    setIsDialogOpen(false);
    resetForm();
    loadData();
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette évaluation ?')) {
      deleteEvaluation(id);
      toast.success('Évaluation supprimée');
      loadData();
    }
  };

  const filteredEvaluations = filterSubject === 'all'
    ? evaluations
    : evaluations.filter((e) => e.subjectId === filterSubject);

  const getSubjectName = (subjectId: string) => {
    return subjects.find((s) => s.id === subjectId)?.name || 'N/A';
  };

  const getSubjectCode = (subjectId: string) => {
    return subjects.find((s) => s.id === subjectId)?.code || 'N/A';
  };

  const getTypeBadge = (type: EvaluationType) => {
    const styles = {
      CC: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      SN: 'bg-green-500/10 text-green-600 border-green-500/20',
      RA: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    };
    const labels = {
      CC: 'Contrôle Continu',
      SN: 'Session Normale',
      RA: 'Rattrapage',
    };
    return <Badge className={styles[type]}>{labels[type]}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-5 animate-fade-in-up">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Programmation des Évaluations</h2>
            <p className="text-sm text-muted-foreground">
              Planifiez les examens et contrôles
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle Évaluation
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Programmer une Évaluation</DialogTitle>
                  <DialogDescription>
                    Planifiez un examen ou contrôle continu
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="subjectId">Matière *</Label>
                    <Select
                      value={formData.subjectId}
                      onValueChange={(value) => setFormData({ ...formData, subjectId: value })}
                    >
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
                  <div className="space-y-2">
                    <Label htmlFor="type">Type d'évaluation *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value as EvaluationType })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CC">Contrôle Continu (30%)</SelectItem>
                        <SelectItem value="SN">Session Normale (70%)</SelectItem>
                        <SelectItem value="RA">Rattrapage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxScore">Note maximale</Label>
                    <Input
                      id="maxScore"
                      type="number"
                      min="1"
                      max="100"
                      value={formData.maxScore}
                      onChange={(e) => setFormData({ ...formData, maxScore: parseInt(e.target.value) || 20 })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit">Programmer</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Info Card */}
        <Card className="bg-secondary/30 border-dashed border-2">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Système d'évaluation</h3>
                <p className="text-sm text-muted-foreground">
                  <strong>Note Finale = (CC × 30%) + (SN × 70%)</strong><br />
                  Si la note finale est inférieure à 10, l'étudiant passe en rattrapage.
                  La note de rattrapage remplace la note SN si elle est meilleure.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filter */}
        <Card>
          <CardContent className="pt-4 pb-4">
            <Select value={filterSubject} onValueChange={setFilterSubject}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Filtrer par matière" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les matières</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.code} - {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-4 px-6">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ClipboardList className="h-5 w-5" />
              Calendrier des Évaluations
            </CardTitle>
            <CardDescription className="text-xs font-bold text-muted-foreground mt-0.5">
              {filteredEvaluations.length} évaluation(s) programmée(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredEvaluations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucune évaluation programmée.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Matière</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Note Max</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvaluations
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map((evaluation) => (
                      <TableRow key={evaluation.id}>
                        <TableCell className="font-mono font-medium">
                          {getSubjectCode(evaluation.subjectId)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {getSubjectName(evaluation.subjectId)}
                        </TableCell>
                        <TableCell>{getTypeBadge(evaluation.type)}</TableCell>
                        <TableCell>
                          {format(new Date(evaluation.date), 'dd MMMM yyyy', { locale: fr })}
                        </TableCell>
                        <TableCell>{evaluation.maxScore}/20</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(evaluation.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
