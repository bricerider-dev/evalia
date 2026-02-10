import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { Plus, Pencil, Trash2, User, BookOpen, Search } from 'lucide-react';
import { toast } from 'sonner';
import { fi, id } from 'date-fns/locale';

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<any>(null);
  const [formData, setFormData] = useState({
    matricule: '',
    role: 'teacher',
    phone: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    id: '',
    teacherId: '',
    grade: '',
    is_active: true,
    status: 'actif',
  });

  const loadTeachers = async () => {
    try {
      const data = await getEnseignants();
      // Map backend data to match frontend expectations if necessary
      const mappedTeachers = data.map((t: any) => ({
        ...t,
        firstName: t.user.firstName,
        lastName: t.user.lastName,
        email: t.user.email,
        matricule: t.user.username,
        phone: t.user.phone,
        is_active: t.user.is_active,
        teacherId: t.id,
        status: t.status,
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
      phone: '+237 6',
      grade: 'PA',
      is_active: true,
      id: '',      
      status: 'actif',
      role: 'teacher',
      matricule: ''      
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
        teacherId: teacher.id,
        phone: teacher.phone || '',
        grade: teacher.grade || 'PA',
        is_active: teacher.is_active,
        status: teacher.status,
        role: teacher.role,
        matricule: teacher.matricule || '',
        id: teacher.id,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.matricule) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const payload: any = {
      user: {
        role: 'teacher',
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        username: formData.matricule,
        is_active: true,
        phone: formData.phone || '',
      },
      grade: formData.grade || 'PA', // Default grade
      status: 'actif'
    };

    if (formData.password) {
      payload.user.password = formData.password;
    }

    try {
      if (editingTeacher) {
        console.log('Updating teacher with payload:', payload);
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50 dark:bg-card/40 backdrop-blur-3xl p-6 rounded-3xl shadow-institutional border border-white/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
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
              <Button
                onClick={() => handleOpenDialog()}
                className="relative overflow-hidden gradient-institutional text-white shadow-lg hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] hover:-translate-y-1 hover:scale-105 transition-all duration-300 py-3 px-6 rounded-xl text-base font-bold group before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-700"
              >
                <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 group-hover:scale-110 transition-all duration-300" />
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="matricule">Matricule *</Label>
                      <Input
                        id="matricule"
                        value={formData.matricule}
                        onChange={(e) => setFormData({ ...formData, matricule: e.target.value.toUpperCase() })}
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
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="grade">Grade</Label>
                      <Select
                        onValueChange={(value) => setFormData({ ...formData, grade: value as any })}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sélectionnez le grade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PA">PA (Professeur Assistant)</SelectItem>
                          <SelectItem value="PH">PH (Professeur)</SelectItem>
                          <SelectItem value="DR">DR (Docteur)</SelectItem>
                          <SelectItem value="PR">PR (Professeur)</SelectItem>
                          <SelectItem value="MC">MC (Maître de Conférences)</SelectItem>
                          <SelectItem value="AS">AS (Assistant)</SelectItem>
                          <SelectItem value="VAC">VAC (Vacataire)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>

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
        {/**  filtres by name */}
        <Card>
          <CardContent className='py-5'>            
              <div className="relative flex items-center gap-4">
                <Search className="absolute left-4 top-5 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Rechercher par nom ou matricule..."
                  className="pl-12 py-5 text-base rounded-xl border-2 border-white/10 dark:border-white/5 focus:border-primary/20 bg-muted/30 shadow-inner"
                  onChange={(e) => {
                    const query = e.target.value.toLowerCase();
                    setTeachers((prev) =>
                      prev.filter(
                        (t) =>
                          t.firstName.toLowerCase().includes(query) ||
                          t.lastName.toLowerCase().includes(query) ||
                          t.matricule.toLowerCase().includes(query)
                      )
                    );
                  }}
                />
                <Button
                  variant="outline"
                  onClick={() => loadTeachers()}
                >
                  Réinitialiser
                </Button>
              </div>            
          </CardContent>
        </Card>

        <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden bg-card/60 backdrop-blur-xl border border-white/5">
          <CardHeader className="bg-muted/30 border-b border-white/5 py-6 px-10">
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
                <TableHeader className="bg-muted/50">
                  <TableRow className="hover:bg-transparent border-0">
                    <TableHead className="py-3.5 px-10 font-bold text-primary uppercase tracking-widest text-[10px]">Matricule</TableHead>
                    <TableHead className="py-3.5 px-6 font-bold text-primary uppercase tracking-widest text-[10px]">Nom Complet</TableHead>
                    <TableHead className="py-3.5 px-6 font-bold text-primary uppercase tracking-widest text-[10px]">Email</TableHead>
                    <TableHead className="py-3.5 px-6 font-bold text-primary uppercase tracking-widest text-[10px]">Telephone</TableHead>
                    <TableHead className="py-3.5 px-10 text-right font-bold text-primary uppercase tracking-widest text-[10px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teachers.map((teacher) => (
                    <TableRow key={teacher.id} className="hover:bg-primary/5 transition-colors border-b border-white/5 group">
                      <TableCell className="py-4 px-10 font-mono font-black text-primary text-sm">
                        {teacher.matricule}
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <div className="font-bold text-base group-hover:text-primary transition-colors text-foreground">
                          {teacher.grade}. {teacher.firstName} {teacher.lastName}
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-6 text-muted-foreground font-medium text-sm">
                        {teacher.email}
                      </TableCell>
                      <TableCell className="py-3 px-6">
                        <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 px-3 py-1 rounded-full font-bold text-[10px]">
                          {teacher.phone || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 px-10 text-right">
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(teacher)}
                            className="h-10 w-10 rounded-xl hover:bg-card hover:shadow-lg text-primary transition-all"
                          >
                            <Pencil className="h-5 w-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(teacher.id)}
                            className="h-10 w-10 rounded-xl hover:bg-card hover:shadow-lg text-destructive transition-all"
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
