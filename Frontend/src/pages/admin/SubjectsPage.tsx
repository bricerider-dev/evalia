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
import { Plus, Pencil, Trash2, BookOpen, Search } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [filieres, setFilieres] = useState<Filiere[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<any>(null);
  const [filterFiliere, setFilterFiliere] = useState<string>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterSemester, setFilterSemester] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    level: 1,
    semester: 1,
    credit: 1,
    // Keep these if necessary for creation, but they won't be in the listed items
    filiereId: '',
    teacherId: '',
    unitId: '',
  });

  const loadData = async () => {
    try {
      const subjectsData = await getSubjects();
      const filieresData = await getFilieres();
      // const teachersData = await getEnseignants();
      // const unitsData = await getUnits();

      setSubjects(subjectsData);
      setFilieres(filieresData);
      // setTeachers(teachersData);
      // setUnits(unitsData);
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
      description: '',
      level: 1,
      semester: 1,
      credit: 1,
      filiereId: '',
      teacherId: '',
      unitId: '',
    });
    setEditingSubject(null);
  };

  const handleOpenDialog = (subject?: any) => {
    if (subject) {
      setEditingSubject(subject);
      setFormData({
        name: subject.name,
        code: subject.code,
        description: subject.description || '',
        level: subject.level || 1,
        semester: subject.semester,
        credit: subject.credit,
        filiereId: '',
        teacherId: '',
        unitId: '',
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.code) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const payload = {
      name: formData.name,
      code: formData.code,
      description: formData.description,
      level: formData.level,
      semester: formData.semester,
      credit: formData.credit,
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

  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch =
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchTerm.toLowerCase());

    // In Subjects model, filiere is often linked via units or directly if your API returns it
    // For now, let's filter if filiere field exists or skip if 'all'
    const matchesFiliere = filterFiliere === 'all' ||
      (subject as any).filiere?.id === parseInt(filterFiliere) ||
      (subject as any).filiere_id === parseInt(filterFiliere);

    const matchesLevel = filterLevel === 'all' || String(subject.level) === filterLevel.replace('L', '').replace('M', '');
    const matchesSemester = filterSemester === 'all' || String(subject.semester) === filterSemester.replace('S', '');

    return matchesSearch && matchesFiliere && matchesLevel && matchesSemester;
  });

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
              <BookOpen className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-primary tracking-tight">Gestion des Matières</h2>
              <p className="text-sm text-muted-foreground font-medium">
                Structurez le programme académique d'excellence
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
                  Nouvelle Matière
                </Button>
              </motion.div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] border-none shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/10">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black text-primary">
                    {editingSubject ? 'Modifier la Matière' : 'Nouvelle Matière'}
                  </DialogTitle>
                  <DialogDescription className="text-base dark:text-slate-400">
                    {editingSubject
                      ? 'Modifiez les informations de la matière'
                      : 'Créez une nouvelle matière'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-5 py-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-bold uppercase tracking-wide text-muted-foreground dark:text-slate-500">Nom de la matière *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="ex: Programmation Java"
                      className="h-12 text-lg bg-muted/50 dark:bg-slate-800/50 border-transparent focus:border-primary/50 focus:bg-white dark:focus:bg-slate-800 transition-all rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code" className="text-sm font-bold uppercase tracking-wide text-muted-foreground dark:text-slate-500">Code *</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="ex: INFO101"
                      className="h-12 text-lg font-mono bg-muted/50 dark:bg-slate-800/50 border-transparent focus:border-primary/50 focus:bg-white dark:focus:bg-slate-800 transition-all rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-bold uppercase tracking-wide text-muted-foreground dark:text-slate-500">Description</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="h-12 text-base bg-muted/50 dark:bg-slate-800/50 border-transparent focus:border-primary/50 focus:bg-white dark:focus:bg-slate-800 transition-all rounded-xl shadow-inner"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="level" className="text-sm font-bold uppercase tracking-wide text-muted-foreground dark:text-slate-500">Niveau</Label>
                      <Input
                        id="level"
                        type="number"
                        min="1"
                        max="5"
                        value={formData.level}
                        onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) || 1 })}
                        className="h-12 text-lg bg-muted/50 dark:bg-slate-800/50 border-transparent focus:border-primary/50 focus:bg-white dark:focus:bg-slate-800 transition-all rounded-xl shadow-inner"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="semester" className="text-sm font-bold uppercase tracking-wide text-muted-foreground dark:text-slate-500">Semestre</Label>
                      <Input
                        id="semester"
                        type="number"
                        min="1"
                        max="2"
                        value={formData.semester}
                        onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) || 1 })}
                        className="h-12 text-lg bg-muted/50 dark:bg-slate-800/50 border-transparent focus:border-primary/50 focus:bg-white dark:focus:bg-slate-800 transition-all rounded-xl shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="credit" className="text-sm font-bold uppercase tracking-wide text-muted-foreground dark:text-slate-500">Crédits</Label>
                      <Input
                        id="credit"
                        type="number"
                        min="1"
                        max="30"
                        value={formData.credit}
                        onChange={(e) => setFormData({ ...formData, credit: parseInt(e.target.value) || 1 })}
                        className="h-12 text-lg bg-muted/50 dark:bg-slate-800/50 border-transparent focus:border-primary/50 focus:bg-white dark:focus:bg-slate-800 transition-all rounded-xl shadow-inner"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="h-12 rounded-xl text-muted-foreground hover:text-foreground dark:hover:bg-slate-800 transition-colors">
                    Annuler
                  </Button>
                  <Button type="submit" className="h-12 rounded-xl gradient-institutional text-white font-bold shadow-lg hover:shadow-primary/25">
                    {editingSubject ? 'Enregistrer les modifications' : 'Créer la matière'}
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
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    placeholder="Rechercher une matière ou un code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-14 text-base rounded-xl border-transparent bg-muted/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 focus:border-primary/20 transition-all shadow-inner"
                  />
                </div>

                <Select value={filterFiliere} onValueChange={setFilterFiliere}>
                  <SelectTrigger className="w-full md:w-[200px] h-14 text-base rounded-xl border-transparent bg-muted/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 focus:border-primary/20 transition-all shadow-inner text-muted-foreground hover:text-foreground">
                    <SelectValue placeholder="Filière" />
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
                  <SelectTrigger className="w-full md:w-[130px] h-14 text-base rounded-xl border-transparent bg-muted/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 focus:border-primary/20 transition-all shadow-inner text-muted-foreground hover:text-foreground">
                    <SelectValue placeholder="Niveau" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-none shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
                    <SelectItem value="all" className="py-3 text-base rounded-lg cursor-pointer">Tout Niveau</SelectItem>
                    {['L1', 'L2', 'L3', 'M1', 'M2'].map((level) => (
                      <SelectItem key={level} value={level} className="py-3 text-base rounded-lg cursor-pointer">
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterSemester} onValueChange={setFilterSemester}>
                  <SelectTrigger className="w-full md:w-[130px] h-14 text-base rounded-xl border-transparent bg-muted/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 focus:border-primary/20 transition-all shadow-inner text-muted-foreground hover:text-foreground">
                    <SelectValue placeholder="Semestre" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-none shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
                    <SelectItem value="all" className="py-3 text-base rounded-lg cursor-pointer">Tout Semestre</SelectItem>
                    {['S1', 'S2'].map((sem) => (
                      <SelectItem key={sem} value={sem} className="py-3 text-base rounded-lg cursor-pointer">
                        {sem}
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
                      <BookOpen className="h-5 w-5" />
                    </span>
                    Liste des Matières
                  </CardTitle>
                  <CardDescription className="text-base font-bold text-muted-foreground mt-2 pl-1">
                    {filteredSubjects.length} matière(s) trouvée(s)
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {subjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <div className="p-4 bg-muted/50 rounded-full mb-4">
                    <BookOpen className="h-12 w-12 opacity-50" />
                  </div>
                  <p className="text-lg font-medium">Aucune matière trouvée.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow className="hover:bg-transparent border-none">
                        <TableHead className="py-5 px-8 font-bold text-primary uppercase tracking-widest text-xs">Code</TableHead>
                        <TableHead className="py-5 px-6 font-bold text-primary uppercase tracking-widest text-xs">Matière</TableHead>
                        <TableHead className="py-5 px-6 font-bold text-primary uppercase tracking-widest text-xs text-center">Filière</TableHead>
                        <TableHead className="py-5 px-6 font-bold text-primary uppercase tracking-widest text-xs text-center">Niveau</TableHead>
                        <TableHead className="py-5 px-6 font-bold text-primary uppercase tracking-widest text-xs text-center">Crédits</TableHead>
                        <TableHead className="py-5 px-6 font-bold text-primary uppercase tracking-widest text-xs text-center">Semestre</TableHead>
                        <TableHead className="py-5 px-8 text-right font-bold text-primary uppercase tracking-widest text-xs">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {filteredSubjects.map((subject, index) => (
                          <motion.tr
                            key={subject.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: index * 0.05 }}
                            className="group hover:bg-primary/5 transition-colors border-b border-white/5 last:border-0"
                          >
                            <TableCell className="py-5 px-8">
                              <span className="px-3 py-1 rounded-lg bg-white dark:bg-muted font-mono font-black text-primary text-sm shadow-sm ring-1 ring-black/5">
                                {subject.code}
                              </span>
                            </TableCell>
                            <TableCell className="py-5 px-6">
                              <div className="font-bold text-base text-foreground/90 group-hover:text-primary transition-colors">
                                {subject.name}
                              </div>
                              {subject.description && (
                                <div className="text-xs text-muted-foreground mt-1 truncate max-w-[200px]">
                                  {subject.description}
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="py-5 px-6 text-center">
                              <span className="font-bold text-muted-foreground/80 text-sm">
                                {(subject as any).filiere?.name || (subject as any).filiere_name || '-'}
                              </span>
                            </TableCell>
                            <TableCell className="py-5 px-6 text-center">
                              <span className="font-bold text-muted-foreground/80 text-sm">L{subject.level}</span>
                            </TableCell>
                            <TableCell className="py-5 px-6 text-center">
                              <Badge variant="secondary" className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/20 px-2 py-0.5 rounded-full font-black text-[10px]">
                                {subject.credit}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-5 px-6 text-center">
                              <span className="font-bold text-muted-foreground/80 text-sm">S{subject.semester}</span>
                            </TableCell>
                            <TableCell className="py-5 px-8 text-right">
                              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-2 group-hover:translate-x-0">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleOpenDialog(subject)}
                                  className="h-9 w-9 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(String(subject.id))}
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
