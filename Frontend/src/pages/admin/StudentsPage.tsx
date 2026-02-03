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


export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [filieres, setFilieres] = useState<Filiere[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFiliere, setFilterFiliere] = useState<string>('all');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    studentId: '',
    filiereId: '',
    matricule: '',
    enrollmentYear: new Date().getFullYear(),
  });

  const loadData = async () => {
    try {
      const studentsData = await getEtudiants();
      const filieresData = await getFilieres();

      const mappedStudents = studentsData.map((s: any) => ({
        ...s,
        firstName: s.user.first_name,
        lastName: s.user.last_name,
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
      enrollmentYear: new Date().getFullYear(),
    });
    setEditingStudent(null);
  };

  const handleOpenDialog = (student?: any) => {
    if (student) {
      setEditingStudent(student);
      setFormData({
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        password: '', // Password excluded during edit
        studentId: student.id,
        filiereId: student.filiere,
        matricule: student.studentId,
        enrollmentYear: student.enrollmentYear || new Date().getFullYear(),
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
        phone: '',
        is_active: true
      },
      filiere: formData.filiereId,
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
    } catch (error) {
      console.error(error);
      toast.error('Une erreur est survenue');
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
    const matchesFiliere = filterFiliere === 'all' || student.filiere === filterFiliere;
    return matchesSearch && matchesFiliere;
  });

  const getFiliereName = (filiereId: string) => {
    return filieres.find((f) => f.id === filiereId)?.code || 'N/A';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Gestion des Étudiants</h2>
            <p className="text-muted-foreground">
              Inscrivez et gérez les étudiants du département
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Nouvel Étudiant
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingStudent ? 'Modifier l\'Étudiant' : 'Nouvel Étudiant'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingStudent
                      ? 'Modifiez les informations de l\'étudiant'
                      : 'Inscrivez un nouvel étudiant'}
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
                    <Label htmlFor="matricule">Matricule *</Label>
                    <Input
                      id="matricule"
                      value={formData.matricule}
                      onChange={(e) => setFormData({ ...formData, matricule: e.target.value })}
                      placeholder="ex: S2024001"
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
                            {filiere.name} ({filiere.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="enrollmentYear">Année d'inscription</Label>
                    <Input
                      id="enrollmentYear"
                      type="number"
                      value={formData.enrollmentYear}
                      onChange={(e) => setFormData({ ...formData, enrollmentYear: parseInt(e.target.value) })}
                    />
                  </div>
                  {!editingStudent && (
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
                    {editingStudent ? 'Enregistrer' : 'Inscrire'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom, matricule ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterFiliere} onValueChange={setFilterFiliere}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Toutes les filières" />
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
              <Users className="h-5 w-5" />
              Liste des Étudiants
            </CardTitle>
            <CardDescription>
              {filteredStudents.length} étudiant(s) trouvé(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredStudents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucun étudiant trouvé.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Matricule</TableHead>
                    <TableHead>Nom Complet</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Filière</TableHead>
                    <TableHead>Année</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-mono font-medium">
                        {student.user.username}
                      </TableCell>
                      <TableCell className="font-medium">
                        {student.user.firstName} {student.user.lastName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {student.user.email}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {getFiliereName(student.filiere)}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(student.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(student)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(student.id)}
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
