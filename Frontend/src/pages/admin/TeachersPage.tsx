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
import { motion, AnimatePresence } from 'framer-motion';

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 100 }
    }
  };

  return (
    <DashboardLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-6"
      >
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50 dark:bg-card/40 backdrop-blur-3xl p-6 rounded-3xl shadow-institutional border border-white/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl text-primary ring-1 ring-primary/20">
              <User className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-primary tracking-tight">Gestion des Enseignants</h2>
              <p className="text-sm text-muted-foreground font-medium">
                Gérez le corps professoral d'excellence
              </p>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => handleOpenDialog()}
                  className="relative overflow-hidden gradient-institutional text-white shadow-lg shadow-primary/20 hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all duration-300 py-6 px-6 rounded-xl text-base font-bold group"
                >
                  <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 blur-md" />
                  <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                  Nouvel Enseignant
                </Button>
              </motion.div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] border-none shadow-2xl bg-white/95 backdrop-blur-xl">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black text-primary">
                    {editingTeacher ? 'Modifier l\'Enseignant' : 'Nouvel Enseignant'}
                  </DialogTitle>
                  <DialogDescription className="text-base">
                    {editingTeacher
                      ? 'Modifiez les informations de l\'enseignant'
                      : 'Ajoutez un nouvel enseignant'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-5 py-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Prénom *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="h-12 text-lg bg-muted/50 border-transparent focus:border-primary/50 focus:bg-white transition-all rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Nom *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="h-12 text-lg bg-muted/50 border-transparent focus:border-primary/50 focus:bg-white transition-all rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="teacherId" className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Matricule *</Label>
                    <Input
                      id="teacherId"
                      value={formData.teacherId}
                      onChange={(e) => setFormData({ ...formData, teacherId: e.target.value.toUpperCase() })}
                      placeholder="ex: T001"
                      className="h-12 text-lg font-mono bg-muted/50 border-transparent focus:border-primary/50 focus:bg-white transition-all rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="h-12 text-base bg-muted/50 border-transparent focus:border-primary/50 focus:bg-white transition-all rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department" className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Département</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="ex: Informatique"
                      className="h-12 text-base bg-muted/50 border-transparent focus:border-primary/50 focus:bg-white transition-all rounded-xl"
                    />
                  </div>
                  {!editingTeacher && (
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Mot de passe initial</Label>
                      <Input
                        id="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="h-12 text-base bg-muted/50 border-transparent focus:border-primary/50 focus:bg-white transition-all rounded-xl"
                      />
                    </div>
                  )}
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="h-12 rounded-xl text-muted-foreground hover:text-foreground">
                    Annuler
                  </Button>
                  <Button type="submit" className="h-12 rounded-xl gradient-institutional text-white font-bold shadow-lg hover:shadow-primary/25">
                    {editingTeacher ? 'Enregistrer les modifications' : 'Ajouter l\'enseignant'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-2xl rounded-[2rem] overflow-hidden bg-white/60 dark:bg-card/60 backdrop-blur-xl border-white/20 ring-1 ring-black/5">
            <CardHeader className="bg-muted/30 border-b border-white/5 py-8 px-8">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-3 text-xl font-black text-primary">
                    <span className="p-2 bg-primary/10 rounded-xl text-primary ring-1 ring-primary/20">
                      <User className="h-5 w-5" />
                    </span>
                    Liste des Enseignants
                  </CardTitle>
                  <CardDescription className="text-base font-bold text-muted-foreground mt-2 pl-1">
                    {teachers.length} expert(s) enregistré(s)
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {teachers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <div className="p-4 bg-muted/50 rounded-full mb-4">
                    <User className="h-12 w-12 opacity-50" />
                  </div>
                  <p className="text-lg font-medium">Aucun enseignant enregistré.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow className="hover:bg-transparent border-none">
                        <TableHead className="py-5 px-8 font-bold text-primary uppercase tracking-widest text-xs">Matricule</TableHead>
                        <TableHead className="py-5 px-6 font-bold text-primary uppercase tracking-widest text-xs">Nom Complet</TableHead>
                        <TableHead className="py-5 px-6 font-bold text-primary uppercase tracking-widest text-xs">Email</TableHead>
                        <TableHead className="py-5 px-6 font-bold text-primary uppercase tracking-widest text-xs">Département</TableHead>
                        <TableHead className="py-5 px-8 text-right font-bold text-primary uppercase tracking-widest text-xs">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {teachers.map((teacher, index) => (
                          <motion.tr
                            key={teacher.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: index * 0.05 }}
                            className="group hover:bg-primary/5 transition-colors border-b border-white/5 last:border-0"
                          >
                            <TableCell className="py-5 px-8">
                              <span className="px-3 py-1 rounded-lg bg-white dark:bg-muted font-mono font-black text-primary text-sm shadow-sm ring-1 ring-black/5">
                                {teacher.teacherId}
                              </span>
                            </TableCell>
                            <TableCell className="py-5 px-6">
                              <div className="font-bold text-base text-foreground/90 group-hover:text-primary transition-colors">
                                Prof. {teacher.firstName} {teacher.lastName}
                              </div>
                            </TableCell>
                            <TableCell className="py-5 px-6 text-muted-foreground font-medium text-sm">
                              {teacher.email}
                            </TableCell>
                            <TableCell className="py-5 px-6">
                              <Badge variant="secondary" className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/20 px-3 py-1 rounded-full font-bold text-[10px]">
                                {teacher.department || 'N/A'}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-5 px-8 text-right">
                              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-2 group-hover:translate-x-0">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleOpenDialog(teacher)}
                                  className="h-9 w-9 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(teacher.id)}
                                  className="h-9 w-9 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
