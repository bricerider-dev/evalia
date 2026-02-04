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
import { getEnseignants, createEnseignant, updateEnseignant, deleteEnseignant } from '@/api/enseignant';
import { Teacher } from '@/lib/types';
import { Plus, Pencil, Trash2, User, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<any>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    teacherId: '',
    department: '',
  });

  const loadTeachers = async () => {
    try {
      const data = await getEnseignants();
      // Map backend data to match frontend expectations if necessary
      const mappedTeachers = data.map((t: any) => ({
        ...t,
        firstName: t.user?.first_name || t.firstName,
        lastName: t.user?.last_name || t.lastName,
        email: t.user?.email || t.email,
        teacherId: t.user?.username || t.teacherId,
      }));
      setTeachers(mappedTeachers);
    } catch (error) {
      console.error('Error loading teachers:', error);
      toast.error('Erreur lors du chargement des enseignants');
    }
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

  const handleOpenDialog = (teacher?: any) => {
    if (teacher) {
      setEditingTeacher(teacher);
      setFormData({
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        email: teacher.email,
        password: '', // Don't show password on edit
        teacherId: teacher.teacherId,
        department: teacher.department || '',
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.teacherId) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const payload: any = {
      user: {
        role: 'teacher',
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        username: formData.teacherId,
        is_active: true
      },
      grade: 'Assistant', // Default grade
      status: 'actif'
    };

    if (formData.password) {
      payload.user.password = formData.password;
    }

    try {
      if (editingTeacher) {
        await updateEnseignant(editingTeacher.id, payload);
        toast.success('Enseignant mis à jour avec succès');
      } else {
        await createEnseignant(payload);
        toast.success('Enseignant ajouté avec succès');
      }
      setIsDialogOpen(false);
      resetForm();
      loadTeachers();
    } catch (error) {
      console.error('Error saving teacher:', error);
      toast.error('Une erreur est survenue lors de l\'enregistrement');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet enseignant ?')) {
      try {
        await deleteEnseignant(id);
        toast.success('Enseignant supprimé');
        loadTeachers();
      } catch (error) {
        console.error('Error deleting teacher:', error);
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in-up">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-institutional border border-black/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-primary tracking-tight">Gestion des Enseignants</h2>
              <p className="text-sm text-muted-foreground font-medium">
                Gérez le corps professoral d'excellence
              </p>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} className="gradient-institutional text-white shadow-lg hover:scale-105 transition-all duration-300 py-3 px-6 rounded-xl text-base font-bold">
                <Plus className="mr-2 h-5 w-5" />
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

        <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden bg-white">
          <CardHeader className="bg-slate-50 border-b border-slate-100 py-6 px-10">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-3 text-xl font-black text-primary">
                  <span className="p-1.5 bg-primary rounded-lg text-white">
                    <User className="h-5 w-5" />
                  </span>
                  Liste des Enseignants
                </CardTitle>
                <CardDescription className="text-sm font-bold text-muted-foreground mt-1">
                  {teachers.length} expert(s) enregistré(s)
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {teachers.length === 0 ? (
              <div className="text-center py-20">
                <User className="h-20 w-20 mx-auto text-slate-200 mb-4" />
                <p className="text-2xl font-bold text-slate-400">Aucun enseignant enregistré.</p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent border-0">
                    <TableHead className="py-3.5 px-10 font-bold text-primary uppercase tracking-widest text-[10px]">Matricule</TableHead>
                    <TableHead className="py-3.5 px-6 font-bold text-primary uppercase tracking-widest text-[10px]">Nom Complet</TableHead>
                    <TableHead className="py-3.5 px-6 font-bold text-primary uppercase tracking-widest text-[10px]">Email</TableHead>
                    <TableHead className="py-3.5 px-6 font-bold text-primary uppercase tracking-widest text-[10px]">Département</TableHead>
                    <TableHead className="py-3.5 px-10 text-right font-bold text-primary uppercase tracking-widest text-[10px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teachers.map((teacher) => (
                    <TableRow key={teacher.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-50 group">
                      <TableCell className="py-3 px-10 font-mono font-black text-primary text-sm">
                        {teacher.teacherId}
                      </TableCell>
                      <TableCell className="py-3 px-6">
                        <div className="font-bold text-base text-slate-700 group-hover:text-primary transition-colors">
                          Prof. {teacher.firstName} {teacher.lastName}
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-6 text-muted-foreground font-medium text-sm">
                        {teacher.email}
                      </TableCell>
                      <TableCell className="py-3 px-6">
                        <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 px-3 py-1 rounded-full font-bold text-[10px]">
                          {teacher.department || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 px-10 text-right">
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(teacher)}
                            className="h-10 w-10 rounded-xl hover:bg-white hover:shadow-lg text-primary transition-all"
                          >
                            <Pencil className="h-5 w-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(teacher.id)}
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
