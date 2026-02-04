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
import { getSubjects, createSubject, updateSubject, deleteSubject, getUnits } from '@/api/subject';
import { getFilieres } from '@/api/filiere';
import { getEnseignants } from '@/api/enseignant';
import { Subject, Filiere, Teacher } from '@/lib/types';
import { Plus, Pencil, Trash2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [filieres, setFilieres] = useState<Filiere[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<any>(null);
  const [filterFiliere, setFilterFiliere] = useState<string>('all');
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    filiereId: '',
    teacherId: '',
    coefficient: 1,
    semester: 1,
    unitId: '',
  });

  const loadData = async () => {
    try {
      const subjectsData = await getSubjects();
      const filieresData = await getFilieres();
      const teachersData = await getEnseignants();
      const unitsData = await getUnits();

      setSubjects(subjectsData);
      setFilieres(filieresData);
      setTeachers(teachersData);
      setUnits(unitsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erreur lors du chargement des données');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      filiereId: '',
      teacherId: '',
      coefficient: 1,
      semester: 1,
      unitId: units.length > 0 ? units[0].id : '',
    });
    setEditingSubject(null);
  };

  const handleOpenDialog = (subject?: any) => {
    if (subject) {
      setEditingSubject(subject);
      setFormData({
        name: subject.name,
        code: subject.code,
        filiereId: '', // Filiere info might need separate mapping if not in serializer
        teacherId: subject.responsibleTeacherId || '',
        coefficient: subject.coefficient,
        semester: subject.semester,
        unitId: subject.uniteEnseignementId || '',
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.code || !formData.unitId) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const payload = {
      nom: formData.name,
      code: formData.code,
      unite_enseignement: formData.unitId,
      responsable: formData.teacherId || null,
      coefficient: formData.coefficient,
      type_matiere: 'normal',
      description: '',
      volumeHoraire: 40,
      credit: 4
    };

    try {
      if (editingSubject) {
        await updateSubject(editingSubject.id, payload);
        toast.success('Matière mise à jour avec succès');
      } else {
        await createSubject(payload);
        toast.success('Matière créée avec succès');
      }
      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving subject:', error);
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette matière ?')) {
      try {
        await deleteSubject(id);
        toast.success('Matière supprimée');
        loadData();
      } catch (error) {
        console.error('Error deleting subject:', error);
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const getFiliereName = (filiereId: string) => {
    return filieres.find((f) => f.id === filiereId)?.name || 'N/A';
  };

  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find((t) => t.id === teacherId);
    return teacher ? `Prof. ${teacher.user?.last_name || teacher.lastName || ''}` : 'N/A';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in-up">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-institutional border border-black/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-primary tracking-tight">Gestion des Matières</h2>
              <p className="text-sm text-muted-foreground font-medium">
                Structurez le programme académique et assignez les cours
              </p>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} className="gradient-institutional text-white shadow-lg hover:scale-105 transition-all duration-300 py-3 px-6 rounded-xl text-base font-bold">
                <Plus className="mr-2 h-5 w-5" />
                Nouvelle Matière
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingSubject ? 'Modifier la Matière' : 'Nouvelle Matière'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingSubject
                      ? 'Modifiez les informations de la matière'
                      : 'Créez une nouvelle matière'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom de la matière *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="ex: Programmation Java"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Code *</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="ex: INFO101"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unitId">Unité d'Enseignement *</Label>
                    <Select
                      value={formData.unitId}
                      onValueChange={(value) => setFormData({ ...formData, unitId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une UE" />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map((unit) => (
                          <SelectItem key={unit.id} value={unit.id}>
                            {unit.code} - {unit.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="teacherId">Enseignant Responsable</Label>
                    <Select
                      value={formData.teacherId}
                      onValueChange={(value) => setFormData({ ...formData, teacherId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un enseignant" />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            Prof. {teacher.user?.first_name} {teacher.user?.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="coefficient">Coefficient</Label>
                      <Input
                        id="coefficient"
                        type="number"
                        min="1"
                        max="10"
                        value={formData.coefficient}
                        onChange={(e) => setFormData({ ...formData, coefficient: parseInt(e.target.value) || 1 })}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit">
                    {editingSubject ? 'Enregistrer' : 'Créer'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden bg-white">
          <CardHeader className="bg-slate-50 border-b border-slate-100 py-6 px-10">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-3 text-xl font-black text-primary">
                  <span className="p-1.5 bg-primary rounded-lg text-white">
                    <BookOpen className="h-5 w-5" />
                  </span>
                  Liste des Matières
                </CardTitle>
                <CardDescription className="text-sm font-bold text-muted-foreground mt-1">
                  {subjects.length} matière(s) définie(s)
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {subjects.length === 0 ? (
              <div className="text-center py-20">
                <BookOpen className="h-20 w-20 mx-auto text-slate-200 mb-4" />
                <p className="text-2xl font-bold text-slate-400">Aucune matière trouvée.</p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent border-0">
                    <TableHead className="py-3.5 px-10 font-bold text-primary uppercase tracking-widest text-[10px]">Code</TableHead>
                    <TableHead className="py-3.5 px-6 font-bold text-primary uppercase tracking-widest text-[10px]">Matière</TableHead>
                    <TableHead className="py-3.5 px-6 font-bold text-primary uppercase tracking-widest text-[10px]">Enseignant</TableHead>
                    <TableHead className="py-3.5 px-6 font-bold text-primary uppercase tracking-widest text-[10px] text-center">Coef.</TableHead>
                    <TableHead className="py-3.5 px-6 font-bold text-primary uppercase tracking-widest text-[10px] text-center">Semestre</TableHead>
                    <TableHead className="py-3.5 px-10 text-right font-bold text-primary uppercase tracking-widest text-[10px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjects.map((subject) => (
                    <TableRow key={subject.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-50 group">
                      <TableCell className="py-3 px-10 font-mono font-black text-primary text-sm">
                        {subject.code}
                      </TableCell>
                      <TableCell className="py-3 px-6">
                        <div className="font-bold text-base text-slate-700 group-hover:text-primary transition-colors">
                          {subject.name}
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-6 font-medium text-slate-600 text-sm">
                        {getTeacherName(subject.responsibleTeacherId)}
                      </TableCell>
                      <TableCell className="py-3 px-6 text-center">
                        <Badge variant="secondary" className="bg-primary hover:bg-primary text-white px-2 py-0.5 rounded-full font-black text-[10px]">
                          {subject.coefficient}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 px-6 text-center font-bold text-slate-500 text-sm">
                        S{subject.semester}
                      </TableCell>
                      <TableCell className="py-3 px-10 text-right">
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(subject)}
                            className="h-10 w-10 rounded-xl hover:bg-white hover:shadow-lg text-primary transition-all"
                          >
                            <Pencil className="h-5 w-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(subject.id)}
                            className="h-10 w-10 rounded-xl hover:bg-white hover:shadow-lg text-destructive transition-all"
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
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
