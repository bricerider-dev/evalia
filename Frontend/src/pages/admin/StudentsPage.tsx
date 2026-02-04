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

<<<<<<< HEAD
      updateStudent(editingStudent.id, formData);
      toast.success('Étudiant mis à jour avec succès');
    } else {
      const newStudent: any = {
        user: {
          role: 'student',
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          username: formData.matricule,
          phone: '',
          is_active: true   // or false, depending on your logic
        },
        // Add required fields with default or empty values
        filiere: formData.filiereId,
        status: 'active', // or another default value as appropriate
      };
      try {
        await createEtudiant(newStudent);
        toast.success('Étudiant inscrit avec succès');
      } catch (error) {
        console.log(error);
        toast.error('Erreur lors de l\'inscription de l\'étudiant :', error);
      }
=======
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
>>>>>>> 3f3626c0fc03cd718c2e20f2a9ff434e1cdd17b2
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

        if (editingStudent) {
          updateStudent(editingStudent.id, formData);
          toast.success('Étudiant mis à jour avec succès');
        } else {
          const newStudent: any = {
            user: {
              role: 'student',
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              password: formData.password,
              username: formData.matricule,
              phone: '',
              is_active: true   // or false, depending on your logic
            },
            // Add required fields with default or empty values
            filiere: formData.filiereId,
            status: 'active', // or another default value as appropriate
          };
          try {
            await createEtudiant(newStudent);
            toast.success('Étudiant inscrit avec succès');
          } catch (error) {
            console.log(error);
            toast.error('Erreur lors de l\'inscription de l\'étudiant :', error);
          }
        }
        setIsDialogOpen(false);
        resetForm();
        loadData();
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
      <div className="space-y-6 animate-fade-in-up">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-institutional border border-black/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-primary tracking-tight">Gestion des Étudiants</h2>
              <p className="text-sm text-muted-foreground font-medium">
                Inscrivez et gérez les futurs talents
              </p>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} className="gradient-institutional text-white shadow-lg hover:scale-105 transition-all duration-300 py-3 px-6 rounded-xl text-base font-bold">
                <Plus className="mr-2 h-5 w-5" />
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
        <Card className="border-0 shadow-institutional bg-white/80 backdrop-blur-sm rounded-2xl">
          <CardContent className="py-5">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 py-5 text-base rounded-xl border-2 border-slate-100 focus:border-primary/20 bg-slate-50 shadow-inner"
                />
              </div>
              <Select value={filterFiliere} onValueChange={setFilterFiliere}>
                <SelectTrigger className="w-full md:w-[240px] py-5 text-base rounded-xl border-2 border-slate-100 bg-slate-50 shadow-inner">
                  <SelectValue placeholder="Filières" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-2 border-slate-100 shadow-2xl">
                  <SelectItem value="all" className="py-2 text-base rounded-lg">Toutes les filières</SelectItem>
                  {filieres.map((filiere) => (
                    <SelectItem key={filiere.id} value={filiere.id} className="py-2 text-base rounded-lg">
                      {filiere.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden bg-white">
          <CardHeader className="bg-slate-50 border-b border-slate-100 py-6 px-10">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-3 text-xl font-black text-primary">
                  <span className="p-1.5 bg-primary rounded-lg text-white">
                    <Users className="h-5 w-5" />
                  </span>
                  Liste des Étudiants
                </CardTitle>
                <CardDescription className="text-sm font-bold text-muted-foreground mt-1">
                  {filteredStudents.length} talent(s) inscrit(s)
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredStudents.length === 0 ? (
              <div className="text-center py-20">
                <Users className="h-20 w-20 mx-auto text-slate-200 mb-4" />
                <p className="text-2xl font-bold text-slate-400">Aucun étudiant trouvé.</p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent border-0">
                    <TableHead className="py-3.5 px-10 font-bold text-primary uppercase tracking-widest text-[10px]">Matricule</TableHead>
                    <TableHead className="py-3.5 px-6 font-bold text-primary uppercase tracking-widest text-[10px]">Nom Complet</TableHead>
                    <TableHead className="py-3.5 px-6 font-bold text-primary uppercase tracking-widest text-[10px]">Email</TableHead>
                    <TableHead className="py-3.5 px-6 font-bold text-primary uppercase tracking-widest text-[10px]">Filière</TableHead>
                    <TableHead className="py-3.5 px-6 font-bold text-primary uppercase tracking-widest text-[10px]">Année</TableHead>
                    <TableHead className="py-3.5 px-10 text-right font-bold text-primary uppercase tracking-widest text-[10px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-50 group">
                      <TableCell className="py-3 px-10 font-mono font-black text-primary text-sm">
                        {student.studentId}
                      </TableCell>
                      <TableCell className="py-3 px-6">
                        <div className="font-bold text-base text-slate-700 group-hover:text-primary transition-colors">
                          {student.firstName} {student.lastName}
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-6 text-muted-foreground font-medium text-sm">
                        {student.email}
=======
                    <TableRow key={student.id}>
                      <TableCell className="font-mono font-medium">
                        {student.user.username}
                      </TableCell>
                      <TableCell className="font-medium">
                        {student.user.firstName} {student.user.lastName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {student.user.email}
>>>>>>> 3f3626c0fc03cd718c2e20f2a9ff434e1cdd17b2
                    <TableRow key={student.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-50 group">
                      <TableCell className="py-3 px-10 font-mono font-black text-primary text-sm">
                        {student.studentId}
                      </TableCell>
                      <TableCell className="py-3 px-6">
                        <div className="font-bold text-base text-slate-700 group-hover:text-primary transition-colors">
                          {student.firstName} {student.lastName}
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-6 text-muted-foreground font-medium text-sm">
                        {student.email}
                      </TableCell>
                      <TableCell className="py-3 px-6">
                        <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 px-3 py-1 rounded-full font-bold text-[10px]">
                          {getFiliereName(student.filiere)}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 px-6 font-medium text-slate-500 text-sm">
                        {new Date(student.createdAt).getFullYear()}
                      </TableCell>
                      <TableCell className="py-3 px-10 text-right">
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(student)}
                            className="h-10 w-10 rounded-xl hover:bg-white hover:shadow-lg text-primary transition-all"
                          >
                            <Pencil className="h-5 w-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(student.id)}
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
