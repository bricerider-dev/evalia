import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getFilieres, createFiliere, updateFiliere, deleteFiliere } from '@/api/filiere';
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
import { Filiere } from '@/lib/types';
import { Plus, Pencil, Trash2, GraduationCap, Users } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function FilieresPage() {
  const [filieres, setFilieres] = useState<Filiere[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFiliere, setEditingFiliere] = useState<Filiere | null>(null);
  const [formData, setFormData] = useState({ name: '', code: '', description: '' });

  const loadFilieres = async () => {
    try {
      const data = await getFilieres();
      setFilieres(data);
    } catch (error) {
      console.error('Error loading filieres:', error);
    }
  };

  useEffect(() => {
    loadFilieres();
  }, []);

  const resetForm = () => {
    setFormData({ name: '', code: '', description: '' });
    setEditingFiliere(null);
  };

  const handleOpenDialog = (filiere?: Filiere) => {
    if (filiere) {
      setEditingFiliere(filiere);
      setFormData({
        name: filiere.name,
        code: filiere.code,
        description: filiere.description,
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

    try {
      if (editingFiliere) {
        await updateFiliere(String(editingFiliere.id), formData);
        toast.success('Filière mise à jour avec succès');
      } else {
        const newFiliere = {
          ...formData,
          department: 1 // TODO: Dynamic department
        };
        await createFiliere(newFiliere);
        toast.success('Filière créée avec succès');
      }

      setIsDialogOpen(false);
      resetForm();
      loadFilieres();
    } catch (error) {
      console.error('Error saving filiere:', error);
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette filière ?')) {
      try {
        await deleteFiliere(String(id));
        toast.success('Filière supprimée');
        loadFilieres();
      } catch (error) {
        console.error('Error deleting filiere:', error);
        toast.error('Erreur lors de la suppression (vérifiez si des étudiants y sont inscrits)');
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
        className="space-y-5"
      >
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50 dark:bg-card/40 backdrop-blur-3xl p-6 rounded-3xl shadow-institutional border border-white/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl text-primary ring-1 ring-primary/20">
              <GraduationCap className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-primary tracking-tight">Gestion des Filières</h2>
              <p className="text-sm text-muted-foreground font-medium">
                Créez et gérez les programmes d'études d'excellence
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
                  Nouvelle Filière
                </Button>
              </motion.div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] border-none shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/10">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black text-primary">
                    {editingFiliere ? 'Modifier la Filière' : 'Nouvelle Filière'}
                  </DialogTitle>
                  <DialogDescription className="text-base dark:text-slate-400">
                    {editingFiliere
                      ? 'Modifiez les informations de la filière'
                      : 'Créez un nouveau programme d\'études'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-5 py-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-bold uppercase tracking-wide text-muted-foreground dark:text-slate-500">Nom de la filière *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="ex: Informatique"
                      className="h-12 text-lg bg-muted/50 dark:bg-slate-800/50 border-transparent focus:border-primary/50 focus:bg-white dark:focus:bg-slate-800 transition-all rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code" className="text-sm font-bold uppercase tracking-wide text-muted-foreground dark:text-slate-500">Code *</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="ex: INFO"
                      className="h-12 text-lg font-mono bg-muted/50 dark:bg-slate-800/50 border-transparent focus:border-primary/50 focus:bg-white dark:focus:bg-slate-800 transition-all rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-bold uppercase tracking-wide text-muted-foreground dark:text-slate-500">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Description du programme..."
                      className="min-h-[100px] text-base bg-muted/50 dark:bg-slate-800/50 border-transparent focus:border-primary/50 focus:bg-white dark:focus:bg-slate-800 transition-all rounded-xl resize-none shadow-inner"
                    />
                  </div>
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="h-12 rounded-xl text-muted-foreground hover:text-foreground dark:hover:bg-slate-800 transition-colors">
                    Annuler
                  </Button>
                  <Button type="submit" className="h-12 rounded-xl gradient-institutional text-white font-bold shadow-lg hover:shadow-primary/25">
                    {editingFiliere ? 'Enregistrer les modifications' : 'Créer la filière'}
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
                      <GraduationCap className="h-5 w-5" />
                    </span>
                    Liste des Filières
                  </CardTitle>
                  <CardDescription className="text-base font-bold text-muted-foreground mt-2 pl-1">
                    {filieres.length} filière(s) enregistrée(s)
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {filieres.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <div className="p-4 bg-muted/50 rounded-full mb-4">
                    <GraduationCap className="h-12 w-12 opacity-50" />
                  </div>
                  <p className="text-lg font-medium">Aucune filière créée</p>
                  <p className="text-sm">Cliquez sur "Nouvelle Filière" pour commencer.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow className="hover:bg-transparent border-none">
                        <TableHead className="py-5 px-8 font-bold text-primary uppercase tracking-widest text-xs">Code</TableHead>
                        <TableHead className="py-5 px-6 font-bold text-primary uppercase tracking-widest text-xs">Nom</TableHead>
                        <TableHead className="py-5 px-6 font-bold text-primary uppercase tracking-widest text-xs">Description</TableHead>
                        <TableHead className="py-5 px-8 text-right font-bold text-primary uppercase tracking-widest text-xs">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {filieres.map((filiere, index) => (
                          <motion.tr
                            key={filiere.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: index * 0.05 }}
                            className="group hover:bg-primary/5 transition-colors border-b border-white/5 last:border-0"
                          >
                            <TableCell className="py-5 px-8">
                              <span className="px-3 py-1 rounded-lg bg-white dark:bg-muted font-mono font-black text-primary text-sm shadow-sm ring-1 ring-black/5">
                                {filiere.code}
                              </span>
                            </TableCell>
                            <TableCell className="py-5 px-6">
                              <div className="font-bold text-base text-foreground/90 group-hover:text-primary transition-colors">
                                {filiere.name}
                              </div>
                            </TableCell>
                            <TableCell className="py-5 px-6 text-muted-foreground font-medium text-sm max-w-xs truncate">
                              {filiere.description || '—'}
                            </TableCell>
                            <TableCell className="py-5 px-8 text-right">
                              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-2 group-hover:translate-x-0">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleOpenDialog(filiere)}
                                  className="h-9 w-9 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(String(filiere.id))}
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
