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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getTeachers, addTeacher, updateTeacher, deleteTeacher, getSubjectsByTeacher } from '@/lib/storage';
import { Teacher } from '@/lib/types';
import { Plus, Pencil, Trash2, User, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    teacherId: '',
    department: '',
  });

  const loadTeachers = () => {
    setTeachers(getTeachers());
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: 'prof123',
      teacherId: '',
      department: '',
    });
    setEditingTeacher(null);
  };

  const handleOpenDialog = (teacher?: Teacher) => {
    if (teacher) {
      setEditingTeacher(teacher);
      setFormData({
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        email: teacher.email,
        password: teacher.password,
        teacherId: teacher.teacherId,
        department: teacher.department,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.teacherId) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (editingTeacher) {
      updateTeacher(editingTeacher.id, formData);
      toast.success('Enseignant mis à jour avec succès');
    } else {
      const newTeacher: Teacher = {
        id: `teacher-${Date.now()}`,
        role: 'teacher',
        subjects: [],
        ...formData,
        createdAt: new Date().toISOString(),
      };
      addTeacher(newTeacher);
      toast.success('Enseignant ajouté avec succès');
    }

    setIsDialogOpen(false);
    resetForm();
    loadTeachers();
  };

  const handleDelete = (id: string) => {
    const subjects = getSubjectsByTeacher(id);
    if (subjects.length > 0) {
      toast.error('Impossible de supprimer: cet enseignant a des matières assignées');
      return;
    }
    if (confirm('Êtes-vous sûr de vouloir supprimer cet enseignant ?')) {
      deleteTeacher(id);
      toast.success('Enseignant supprimé');
      loadTeachers();
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Gestion des Enseignants</h2>
            <p className="text-muted-foreground">
              Gérez le corps professoral du département
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Nouvel Enseignant
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingTeacher ? 'Modifier l\'Enseignant' : 'Nouvel Enseignant'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingTeacher
                      ? 'Modifiez les informations de l\'enseignant'
                      : 'Ajoutez un nouvel enseignant'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="teacherId">Matricule *</Label>
                    <Input
                      id="teacherId"
                      value={formData.teacherId}
                      onChange={(e) => setFormData({ ...formData, teacherId: e.target.value.toUpperCase() })}
                      placeholder="ex: T001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Département</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="ex: Informatique"
                    />
                  </div>
                  {!editingTeacher && (
                    <div className="space-y-2">
                      <Label htmlFor="password">Mot de passe initial</Label>
                      <Input
                        id="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      />
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit">
                    {editingTeacher ? 'Enregistrer' : 'Ajouter'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Liste des Enseignants
            </CardTitle>
            <CardDescription>
              {teachers.length} enseignant(s) enregistré(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {teachers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucun enseignant enregistré.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Matricule</TableHead>
                    <TableHead>Nom Complet</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Département</TableHead>
                    <TableHead>Matières</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teachers.map((teacher) => {
                    const subjectCount = getSubjectsByTeacher(teacher.id).length;
                    return (
                      <TableRow key={teacher.id}>
                        <TableCell className="font-mono font-medium">
                          {teacher.teacherId}
                        </TableCell>
                        <TableCell className="font-medium">
                          Prof. {teacher.firstName} {teacher.lastName}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {teacher.email}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {teacher.department || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                            {subjectCount}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDialog(teacher)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(teacher.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
