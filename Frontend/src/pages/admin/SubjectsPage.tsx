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
import { getSubjects, addSubject, updateSubject, deleteSubject, getFilieres, getTeachers } from '@/lib/storage';
import { Subject, Filiere, Teacher } from '@/lib/types';
import { Plus, Pencil, Trash2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [filieres, setFilieres] = useState<Filiere[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [filterFiliere, setFilterFiliere] = useState<string>('all');
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    filiereId: '',
    teacherId: '',
    coefficient: 1,
    semester: 1,
  });

  const loadData = () => {
    setSubjects(getSubjects());
    setFilieres(getFilieres());
    setTeachers(getTeachers());
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
    });
    setEditingSubject(null);
  };

  const handleOpenDialog = (subject?: Subject) => {
    if (subject) {
      setEditingSubject(subject);
      setFormData({
        name: subject.name,
        code: subject.code,
        filiereId: subject.filiereId,
        teacherId: subject.teacherId,
        coefficient: subject.coefficient,
        semester: subject.semester,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.code || !formData.filiereId || !formData.teacherId) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (editingSubject) {
      updateSubject(editingSubject.id, formData);
      toast.success('Matière mise à jour avec succès');
    } else {
      const newSubject: Subject = {
        id: `sub-${Date.now()}`,
        ...formData,
      };
      addSubject(newSubject);
      toast.success('Matière créée avec succès');
    }

    setIsDialogOpen(false);
    resetForm();
    loadData();
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette matière ?')) {
      deleteSubject(id);
      toast.success('Matière supprimée');
      loadData();
    }
  };

  const filteredSubjects = filterFiliere === 'all'
    ? subjects
    : subjects.filter((s) => s.filiereId === filterFiliere);

  const getFiliereName = (filiereId: string) => {
    return filieres.find((f) => f.id === filiereId)?.name || 'N/A';
  };

  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find((t) => t.id === teacherId);
    return teacher ? `Prof. ${teacher.lastName}` : 'N/A';
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
                    <Label htmlFor="filiereId">Filière *</Label>
                    <Select
                      value={formData.filiereId}
                      onValueChange={(value) => setFormData({ ...formData, filiereId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une filière" />
                      </SelectTrigger>
                      <SelectContent>
                        {filieres.map((filiere) => (
                          <SelectItem key={filiere.id} value={filiere.id}>
                            {filiere.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="teacherId">Enseignant *</Label>
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
                            Prof. {teacher.firstName} {teacher.lastName}
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
                    <div className="space-y-2">
                      <Label htmlFor="semester">Semestre</Label>
                      <Select
                        value={String(formData.semester)}
                        onValueChange={(value) => setFormData({ ...formData, semester: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6].map((sem) => (
                            <SelectItem key={sem} value={String(sem)}>
                              Semestre {sem}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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

        {/* Filter */}
        {/* Filter */}
        <Card className="border-0 shadow-institutional bg-white/80 backdrop-blur-sm rounded-2xl">
          <CardContent className="py-5">
            <div className="flex flex-col md:flex-row gap-6">
              <Select value={filterFiliere} onValueChange={setFilterFiliere}>
                <SelectTrigger className="w-full md:w-[280px] py-5 text-base rounded-xl border-2 border-slate-100 bg-slate-50 shadow-inner">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground font-medium">Filière:</span>
                    <SelectValue placeholder="Filtrer" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl border-2 border-slate-100 shadow-2xl">
                  <SelectItem value="all" className="py-2 text-base rounded-lg">Toutes les filières</SelectItem>
                  {filieres.map((filiere) => (
                    <SelectItem key={filiere.id} value={filiere.id} className="py-2 text-base rounded-lg">
                      {filiere.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

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
                  {filteredSubjects.length} matière(s) définie(s)
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredSubjects.length === 0 ? (
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
                    <TableHead className="py-3.5 px-6 font-bold text-primary uppercase tracking-widest text-[10px]">Filière</TableHead>
                    <TableHead className="py-3.5 px-6 font-bold text-primary uppercase tracking-widest text-[10px]">Enseignant</TableHead>
                    <TableHead className="py-3.5 px-6 font-bold text-primary uppercase tracking-widest text-[10px] text-center">Coef.</TableHead>
                    <TableHead className="py-3.5 px-6 font-bold text-primary uppercase tracking-widest text-[10px] text-center">Semestre</TableHead>
                    <TableHead className="py-3.5 px-10 text-right font-bold text-primary uppercase tracking-widest text-[10px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubjects.map((subject) => (
                    <TableRow key={subject.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-50 group">
                      <TableCell className="py-3 px-10 font-mono font-black text-primary text-sm">
                        {subject.code}
                      </TableCell>
                      <TableCell className="py-3 px-6">
                        <div className="font-bold text-base text-slate-700 group-hover:text-primary transition-colors">
                          {subject.name}
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-6">
                        <Badge variant="outline" className="border-slate-200 text-slate-600 px-3 py-1 rounded-full font-bold text-[10px]">
                          {getFiliereName(subject.filiereId)}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 px-6 font-medium text-slate-600 text-sm">
                        {getTeacherName(subject.teacherId)}
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
