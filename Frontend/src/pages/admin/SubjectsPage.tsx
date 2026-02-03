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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Gestion des Matières</h2>
            <p className="text-muted-foreground">
              Créez et assignez les matières aux enseignants
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
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
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Select value={filterFiliere} onValueChange={setFilterFiliere}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Filtrer par filière" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les filières</SelectItem>
                  {filieres.map((filiere) => (
                    <SelectItem key={filiere.id} value={filiere.id}>
                      {filiere.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Liste des Matières
            </CardTitle>
            <CardDescription>
              {filteredSubjects.length} matière(s) trouvée(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredSubjects.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucune matière trouvée.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Matière</TableHead>
                    <TableHead>Filière</TableHead>
                    <TableHead>Enseignant</TableHead>
                    <TableHead>Coef.</TableHead>
                    <TableHead>Semestre</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubjects.map((subject) => (
                    <TableRow key={subject.id}>
                      <TableCell className="font-mono font-medium">
                        {subject.code}
                      </TableCell>
                      <TableCell className="font-medium">{subject.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getFiliereName(subject.filiereId)}
                        </Badge>
                      </TableCell>
                      <TableCell>{getTeacherName(subject.teacherId)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{subject.coefficient}</Badge>
                      </TableCell>
                      <TableCell>S{subject.semester}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(subject)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(subject.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
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
