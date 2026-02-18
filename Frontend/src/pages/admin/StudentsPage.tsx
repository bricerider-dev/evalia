import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getFilieres } from '@/api/filiere';
import { getEtudiants, getEtudiant, createEtudiant, updateEtudiant, deleteEtudiant } from '@/api/etudiant';
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
import { Student, Filiere } from '@/lib/types';
import { Plus, Pencil, Trash2, Users, Search } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [filieres, setFilieres] = useState<Filiere[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFiliere, setFilterFiliere] = useState<string>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    studentId: '',
    filiereId: '',
    matricule: '',
    phone: '',
    enrollmentYear: new Date().getFullYear(),
    level: 'L1',
    cycle: 'ING',
  });

  const loadData = async () => {
    try {
      const studentsData = await getEtudiants();
      const filieresData = await getFilieres();
      console.log(studentsData);

      const mappedStudents = studentsData.map((s: any) => ({
        ...s,
        firstName: s.user.firstName,
        lastName: s.user.lastName,
        email: s.user.email,
        role: s.user.role,
        studentId: s.user.username,
        user: s.user
      }));

      setStudents(mappedStudents);
      setFilieres(filieresData);
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
      firstName: '',
      lastName: '',
      email: '',
      password: 'etud123',
      studentId: '',
      filiereId: '',
      matricule: '',
      phone: '',
      enrollmentYear: new Date().getFullYear(),
      level: 'L1',
      cycle: 'ING',
    });
    setEditingStudent(null);
  };

  const handleOpenDialog = (student?: any) => {
    if (student) {
      setEditingStudent(student);
      setFormData({
        firstName: student.user.firstName,
        lastName: student.user.lastName,
        email: student.user.email,
        password: '', // Password excluded during edit
        studentId: student.id,
        filiereId: student.filiere,
        matricule: student.studentId,
        phone: student.user.phone || '',
        enrollmentYear: student.enrollmentYear || new Date().getFullYear(),
        level: student.level || 'L1',
        cycle: student.cycle || 'ING',
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.matricule || !formData.filiereId) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const payload: any = {
      user: {
        role: 'student',
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        username: formData.matricule,
        phone: formData.phone,
        is_active: true
      },
      filiere: formData.filiereId,
      level: formData.level,
      cycle: formData.cycle,
      status: 'active',
    };

    if (formData.password) {
      payload.user.password = formData.password;
    }

    try {
      if (editingStudent) {
        await updateEtudiant(editingStudent.id, payload);
        toast.success('Étudiant mis à jour avec succès');
      } else {
        await createEtudiant(payload);
        toast.success('Étudiant inscrit avec succès');
      }
      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      console.error('Full error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      const errorMessage = error.response?.data?.detail || error.response?.data?.user || error.response?.data || 'Une erreur est survenue';
      toast.error(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet étudiant ?')) {
      try {
        await deleteEtudiant(id);
        toast.success('Étudiant supprimé');
        loadData();
      } catch (error) {
        console.error(error);
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFiliere = filterFiliere === 'all' || String(student.filiere) === String(filterFiliere);
    const matchesLevel = filterLevel === 'all' || student.level === filterLevel;
    return matchesSearch && matchesFiliere && matchesLevel;
  });

  const getFiliereName = (filiereId: any) => {
    return filieres.find((f) => String(f.id) === String(filiereId))?.code || 'N/A';
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
              <Users className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-primary tracking-tight">Gestion des Étudiants</h2>
              <p className="text-sm text-muted-foreground font-medium">
                Inscrivez et gérez les futurs talents d'excellence
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
                  Nouvel Étudiant
                </Button>
              </motion.div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] border-none shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/10">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black text-primary">
                    {editingStudent ? 'Modifier l\'Étudiant' : 'Nouvel Étudiant'}
                  </DialogTitle>
                  <DialogDescription className="text-base dark:text-slate-400">
                    {editingStudent
                      ? 'Modifiez les informations de l\'étudiant'
                      : 'Inscrivez un nouvel étudiant d\'excellence'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-5 py-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-bold uppercase tracking-wide text-muted-foreground dark:text-slate-500">Prénom *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="h-12 text-lg bg-muted/50 dark:bg-slate-800/50 border-transparent focus:border-primary/50 focus:bg-white dark:focus:bg-slate-800 transition-all rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-bold uppercase tracking-wide text-muted-foreground dark:text-slate-500">Nom *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="h-12 text-lg bg-muted/50 dark:bg-slate-800/50 border-transparent focus:border-primary/50 focus:bg-white dark:focus:bg-slate-800 transition-all rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="matricule" className="text-sm font-bold uppercase tracking-wide text-muted-foreground dark:text-slate-500">Matricule *</Label>
                      <Input
                        id="matricule"
                        value={formData.matricule}
                        onChange={(e) => setFormData({ ...formData, matricule: e.target.value.toUpperCase() })}
                        placeholder="ex: S2024001"
                        className="h-12 text-lg font-mono bg-muted/50 dark:bg-slate-800/50 border-transparent focus:border-primary/50 focus:bg-white dark:focus:bg-slate-800 transition-all rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-bold uppercase tracking-wide text-muted-foreground dark:text-slate-500">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="h-12 text-base bg-muted/50 dark:bg-slate-800/50 border-transparent focus:border-primary/50 focus:bg-white dark:focus:bg-slate-800 transition-all rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-bold uppercase tracking-wide text-muted-foreground dark:text-slate-500">Téléphone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+237 ..."
                        className="h-12 text-base bg-muted/50 dark:bg-slate-800/50 border-transparent focus:border-primary/50 focus:bg-white dark:focus:bg-slate-800 transition-all rounded-xl shadow-inner"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="enrollmentYear" className="text-sm font-bold uppercase tracking-wide text-muted-foreground dark:text-slate-500">Année d'inscription</Label>
                      <Input
                        id="enrollmentYear"
                        type="number"
                        value={formData.enrollmentYear}
                        onChange={(e) => setFormData({ ...formData, enrollmentYear: parseInt(e.target.value) })}
                        className="h-12 text-lg bg-muted/50 dark:bg-slate-800/50 border-transparent focus:border-primary/50 focus:bg-white dark:focus:bg-slate-800 transition-all rounded-xl shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="filiereId" className="text-sm font-bold uppercase tracking-wide text-muted-foreground dark:text-slate-500">Filière *</Label>
                      <Select
                        value={formData.filiereId}
                        onValueChange={(value) => setFormData({ ...formData, filiereId: value })}
                      >
                        <SelectTrigger className="h-12 text-base bg-muted/50 dark:bg-slate-800/50 border-transparent focus:border-primary/50 focus:bg-white dark:focus:bg-slate-800 transition-all rounded-xl shadow-inner">
                          <SelectValue placeholder="Sélectionner une filière" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-none shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
                          {filieres.map((filiere) => (
                            <SelectItem key={filiere.id} value={String(filiere.id)}>
                              {filiere.name} ({filiere.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="level" className="text-sm font-bold uppercase tracking-wide text-muted-foreground dark:text-slate-500">Niveau *</Label>
                      <Select
                        value={formData.level}
                        onValueChange={(value) => setFormData({ ...formData, level: value })}
                      >
                        <SelectTrigger className="h-12 text-base bg-muted/50 dark:bg-slate-800/50 border-transparent focus:border-primary/50 focus:bg-white dark:focus:bg-slate-800 transition-all rounded-xl shadow-inner">
                          <SelectValue placeholder="Sélectionner un niveau" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-none shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
                          {['L1', 'L2', 'L3', 'M1', 'M2'].map((level) => (
                            <SelectItem key={level} value={level}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cycle" className="text-sm font-bold uppercase tracking-wide text-muted-foreground dark:text-slate-500">Cycle</Label>
                    <Select
                      value={formData.cycle}
                      onValueChange={(value) => setFormData({ ...formData, cycle: value })}
                    >
                      <SelectTrigger className="h-12 text-base bg-muted/50 dark:bg-slate-800/50 border-transparent focus:border-primary/50 focus:bg-white dark:focus:bg-slate-800 transition-all rounded-xl shadow-inner">
                        <SelectValue placeholder="Sélectionner un cycle" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-none shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
                        <SelectItem value="ING">Ingénieur</SelectItem>
                        <SelectItem value="M">Master</SelectItem>
                        <SelectItem value="D">Doctorat</SelectItem>
                        <SelectItem value="SCGI">Science de l'ingénieur</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {!editingStudent && (
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-bold uppercase tracking-wide text-muted-foreground dark:text-slate-500">Mot de passe initial</Label>
                      <Input
                        id="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="h-12 text-base bg-muted/50 dark:bg-slate-800/50 border-transparent focus:border-primary/50 focus:bg-white dark:focus:bg-slate-800 transition-all rounded-xl"
                      />
                    </div>
                  )}
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="h-12 rounded-xl text-muted-foreground hover:text-foreground dark:hover:bg-slate-800 transition-colors">
                    Annuler
                  </Button>
                  <Button type="submit" className="h-12 rounded-xl gradient-institutional text-white font-bold shadow-lg hover:shadow-primary/25">
                    {editingStudent ? 'Enregistrer les modifications' : 'Inscrire l\'étudiant'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Filters */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-institutional bg-white/60 dark:bg-card/60 backdrop-blur-xl rounded-2xl border border-white/5 ring-1 ring-black/5">
            <CardContent className="py-5">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-14 text-base rounded-xl border-transparent bg-muted/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 focus:border-primary/20 transition-all shadow-inner"
                  />
                </div>
                <Select value={filterFiliere} onValueChange={setFilterFiliere}>
                  <SelectTrigger className="w-full md:w-[280px] h-14 text-base rounded-xl border-transparent bg-muted/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 focus:border-primary/20 transition-all shadow-inner">
                    <SelectValue placeholder="Filières" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-none shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
                    <SelectItem value="all" className="py-3 text-base rounded-lg cursor-pointer">Toutes les filières</SelectItem>
                    {filieres.map((filiere) => (
                      <SelectItem key={filiere.id} value={String(filiere.id)} className="py-3 text-base rounded-lg cursor-pointer">
                        {filiere.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterLevel} onValueChange={setFilterLevel}>
                  <SelectTrigger className="w-full md:w-[150px] h-14 text-base rounded-xl border-transparent bg-muted/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 focus:border-primary/20 transition-all shadow-inner">
                    <SelectValue placeholder="Niveau" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-none shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
                    <SelectItem value="all" className="py-3 text-base rounded-lg cursor-pointer">Tout niveau</SelectItem>
                    {['L1', 'L2', 'L3', 'M1', 'M2'].map((level) => (
                      <SelectItem key={level} value={level} className="py-3 text-base rounded-lg cursor-pointer">
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-2xl rounded-[2rem] overflow-hidden bg-white/60 dark:bg-card/60 backdrop-blur-xl border-white/20 ring-1 ring-black/5">
            <CardHeader className="bg-muted/30 border-b border-white/5 py-8 px-8">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-3 text-xl font-black text-primary">
                    <span className="p-2 bg-primary/10 rounded-xl text-primary ring-1 ring-primary/20">
                      <Users className="h-5 w-5" />
                    </span>
                    Liste des Étudiants
                  </CardTitle>
                  <CardDescription className="text-base font-bold text-muted-foreground mt-2 pl-1">
                    {filteredStudents.length} talent(s) inscrit(s)
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {filteredStudents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <div className="p-4 bg-muted/50 rounded-full mb-4">
                    <Users className="h-12 w-12 opacity-50" />
                  </div>
                  <p className="text-lg font-medium">Aucun étudiant trouvé.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow className="hover:bg-transparent border-none">
                        <TableHead className="py-5 px-8 font-bold text-primary uppercase tracking-widest text-xs">Matricule</TableHead>
                        <TableHead className="py-5 px-6 font-bold text-primary uppercase tracking-widest text-xs">Nom Complet</TableHead>
                        <TableHead className="py-5 px-6 font-bold text-primary uppercase tracking-widest text-xs">Email</TableHead>
                        <TableHead className="py-5 px-6 font-bold text-primary uppercase tracking-widest text-xs">Filière</TableHead>
                        <TableHead className="py-5 px-6 font-bold text-primary uppercase tracking-widest text-xs">Année</TableHead>
                        <TableHead className="py-5 px-8 text-right font-bold text-primary uppercase tracking-widest text-xs">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {filteredStudents.map((student, index) => (
                          <motion.tr
                            key={student.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: index * 0.05 }}
                            className="group hover:bg-primary/5 transition-colors border-b border-white/5 last:border-0"
                          >
                            <TableCell className="py-5 px-8">
                              <span className="px-3 py-1 rounded-lg bg-white dark:bg-muted font-mono font-black text-primary text-sm shadow-sm ring-1 ring-black/5">
                                {student.studentId}
                              </span>
                            </TableCell>
                            <TableCell className="py-5 px-6">
                              <div className="font-bold text-base text-foreground/90 group-hover:text-primary transition-colors">
                                {student.firstName} {student.lastName}
                              </div>
                            </TableCell>
                            <TableCell className="py-5 px-6 text-muted-foreground font-medium text-sm">
                              {student.email}
                            </TableCell>
                            <TableCell className="py-5 px-6">
                              <Badge variant="secondary" className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/20 px-3 py-1 rounded-full font-bold text-[10px]">
                                {getFiliereName(student.filiere)}
                              </Badge>
                              {student.level && (
                                <Badge variant="outline" className="ml-2 border-primary/20 text-primary font-bold text-[10px]">
                                  {student.level}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="py-5 px-6 font-bold text-slate-500 text-sm">
                              {new Date(student.createdAt).getFullYear()}
                            </TableCell>
                            <TableCell className="py-5 px-8 text-right">
                              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-2 group-hover:translate-x-0">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleOpenDialog(student)}
                                  className="h-9 w-9 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(student.id)}
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
