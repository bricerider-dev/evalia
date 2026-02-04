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
import { getEvaluationsCC, getEvaluationsSN, getEvaluationsRA, createEvaluationCC, createEvaluationSN, createEvaluationRA, deleteEvaluation } from '@/api/evaluation';
import { getSubjects } from '@/api/subject';
import { EvaluationType, SessionType } from '@/lib/types';
import { Plus, Trash2, ClipboardList, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function EvaluationsPage() {
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [formData, setFormData] = useState({
    subjectId: '',
    type: 'CC' as EvaluationType,
    date: '',
    startTime: '08:00',
    duration: 120,
    room: '',
  });

  const loadData = async () => {
    try {
      const [cc, sn, ra, subjectsData] = await Promise.all([
        getEvaluationsCC(),
        getEvaluationsSN(),
        getEvaluationsRA(),
        getSubjects()
      ]);

      const allEvals = [
        ...cc.map((e: any) => ({ ...e, type: 'CC' })),
        ...sn.map((e: any) => ({ ...e, type: 'SN' })),
        ...ra.map((e: any) => ({ ...e, type: 'RA' }))
      ];

      setEvaluations(allEvals);
      setSubjects(subjectsData);
    } catch (error) {
      console.error('Error loading evaluations:', error);
      toast.error('Erreur lors du chargement des données');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setFormData({
      subjectId: '',
      type: 'CC',
      date: '',
      startTime: '08:00',
      duration: 120,
      room: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.subjectId || !formData.date) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const payload = {
      matiere: formData.subjectId,
      intitule: `${formData.type} - ${subjects.find(s => s.id === formData.subjectId)?.name}`,
      date_evaluation: formData.date,
      heure_debut: formData.startTime,
      duree: formData.duration,
      salle: formData.room,
      statut: 'planifiee',
      coefficient: formData.type === 'CC' ? 0.3 : 0.7
    };

    try {
      if (formData.type === 'CC') {
        await createEvaluationCC({ ...payload, nombre_activites: 1, type_cc: 'devoir' });
      } else if (formData.type === 'SN') {
        await createEvaluationSN({ ...payload, duree_revision: 7, type_examen: 'ecrit' });
      } else {
        // Find a session normale for the subject to link the makeup
        const snForSubject = evaluations.find(ev => ev.type === 'SN' && ev.subjectId === formData.subjectId);
        if (!snForSubject && formData.type === 'RA') {
          toast.error('Une session normale doit exister avant de créer un rattrapage');
          return;
        }
        await createEvaluationRA({
          ...payload,
          session_normale: snForSubject.id,
          date_limite_inscription: formData.date,
          type_rattrapage: 'ecrit'
        });
      }

      toast.success('Évaluation programmée avec succès');
      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error creating evaluation:', error);
      toast.error('Erreur lors de la programmation');
    }
  };

  const handleDelete = async (type: EvaluationType, id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette évaluation ?')) {
      try {
        await deleteEvaluation(type, id);
        toast.success('Évaluation supprimée');
        loadData();
      } catch (error) {
        console.error('Error deleting evaluation:', error);
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const filteredEvaluations = filterSubject === 'all'
    ? evaluations
    : evaluations.filter((e) => e.subjectId === filterSubject);

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
                  <div className="grid grid-cols-2 gap-4">
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
                      <Label htmlFor="startTime">Heure</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="duration">Durée (min)</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 120 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="room">Salle</Label>
                      <Input
                        id="room"
                        value={formData.room}
                        onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                      />
                    </div>
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
                    <TableHead>Matière</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date & Heure</TableHead>
                    <TableHead>Salle</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvaluations
                    .sort((a, b) => new Date(a.evaluationDate).getTime() - new Date(b.evaluationDate).getTime())
                    .map((evaluation) => (
                      <TableRow key={evaluation.id}>
                        <TableCell className="font-medium">
                          {subjects.find(s => s.id === evaluation.subjectId)?.name || '...'}
                        </TableCell>
                        <TableCell>{getTypeBadge(evaluation.type)}</TableCell>
                        <TableCell>
                          {format(new Date(evaluation.evaluationDate), 'dd MMM yyyy', { locale: fr })} à {evaluation.startTime}
                        </TableCell>
                        <TableCell>{evaluation.room || '—'}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(evaluation.type, evaluation.id)}
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
