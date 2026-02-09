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

  return (
    <DashboardLayout>
      <div className="space-y-5 animate-fade-in-up">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50 dark:bg-card/40 backdrop-blur-3xl p-6 rounded-3xl shadow-institutional border border-white/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-primary tracking-tight">Gestion des Filières</h2>
              <p className="text-sm text-muted-foreground font-medium">
                Créez et gérez les programmes d'études d'excellence
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
                Nouvelle Filière
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingFiliere ? 'Modifier la Filière' : 'Nouvelle Filière'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingFiliere
                      ? 'Modifiez les informations de la filière'
                      : 'Créez un nouveau programme d\'études'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom de la filière *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="ex: Informatique"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Code *</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="ex: INFO"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Description du programme..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit">
                    {editingFiliere ? 'Enregistrer' : 'Créer'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden bg-card/60 backdrop-blur-xl border border-white/5">
          <CardHeader className="bg-muted/30 border-b border-white/5 py-6 px-10">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-3 text-xl font-black text-primary">
                  <span className="p-1.5 bg-primary rounded-lg text-white">
                    <GraduationCap className="h-5 w-5" />
                  </span>
                  Liste des Filières
                </CardTitle>
                <CardDescription className="text-sm font-bold text-muted-foreground mt-1">
                  {filieres.length} filière(s) enregistrée(s)
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filieres.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucune filière créée. Cliquez sur "Nouvelle Filière" pour commencer.
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="hover:bg-transparent border-0">
                    <TableHead className="py-3.5 px-10 font-bold text-primary uppercase tracking-widest text-[10px]">Code</TableHead>
                    <TableHead className="py-3.5 px-6 font-bold text-primary uppercase tracking-widest text-[10px]">Nom</TableHead>
                    <TableHead className="py-3.5 px-6 font-bold text-primary uppercase tracking-widest text-[10px]">Description</TableHead>
                    <TableHead className="py-3.5 px-10 text-right font-bold text-primary uppercase tracking-widest text-[10px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filieres.map((filiere) => (
                    <TableRow key={filiere.id} className="hover:bg-primary/5 transition-colors border-b border-white/5 group">
                      <TableCell className="py-4 px-10 font-mono font-black text-primary text-sm">
                        {filiere.code}
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <div className="font-bold text-base group-hover:text-primary transition-colors">
                          {filiere.name}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6 text-muted-foreground/80 font-medium text-sm max-w-xs truncate">
                        {filiere.description || '—'}
                      </TableCell>
                      <TableCell className="py-4 px-10 text-right">
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(filiere)}
                            className="h-10 w-10 rounded-xl hover:bg-card hover:shadow-lg text-primary transition-all"
                          >
                            <Pencil className="h-5 w-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(String(filiere.id))}
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
