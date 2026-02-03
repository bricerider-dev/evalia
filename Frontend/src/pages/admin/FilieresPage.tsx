import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getFilieres, createFiliere } from '@/api/filiere';
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
import { updateFiliere, deleteFiliere, getStudentsByFiliere } from '@/lib/storage';
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
      const filieres = await getFilieres();
      setFilieres(filieres);
    } catch (error) {
      console.error('Error loading filieres:', error);
    }
  };

  useEffect(() => {
    loadFilieres();
    console.log(filieres);
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

    if (editingFiliere) {
      await updateFiliere(editingFiliere.id, formData);
      toast.success('Filière mise à jour avec succès');
    } else {
      const newFiliere: Filiere = {
        id: `fil-${Date.now()}`,
        ...formData,
        createdAt: new Date().toISOString(),
        department: "1"
      };
      await createFiliere(newFiliere);
      toast.success('Filière créée avec succès');
    }

    setIsDialogOpen(false);
    resetForm();
    loadFilieres();
  };

  const handleDelete = (id: string) => {
    const students = getStudentsByFiliere(id);
    if (students.length > 0) {
      toast.error('Impossible de supprimer: des étudiants sont inscrits dans cette filière');
      return;
    }
    deleteFiliere(id);
    toast.success('Filière supprimée');
    loadFilieres();
  };

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Gestion des Filières</h2>
            <p className="text-sm text-muted-foreground">
              Créez et gérez les programmes d'études
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Liste des Filières
            </CardTitle>
            <CardDescription>
              {filieres.length} filière(s) enregistrée(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filieres.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucune filière créée. Cliquez sur "Nouvelle Filière" pour commencer.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Étudiants</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filieres.map((filiere) => {
                    const studentCount = getStudentsByFiliere(filiere.id).length;
                    return (
                      <TableRow key={filiere.id}>
                        <TableCell className="font-mono font-medium">
                          {filiere.code}
                        </TableCell>
                        <TableCell className="font-medium">{filiere.name}</TableCell>
                        <TableCell className="text-muted-foreground max-w-xs truncate">
                          {filiere.description || '—'}
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            {studentCount}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDialog(filiere)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(filiere.id)}
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
