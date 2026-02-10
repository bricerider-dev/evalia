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
import { getEvaluations,  createEvaluation, updateEvaluation } from '@/api/evaluation';
import { getSubjects } from '@/api/subject';
import { EvaluationType } from '@/lib/types';
import { Plus, Trash2, ClipboardList, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { title } from 'process';

export default function EvaluationsPage() {
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [formData, setFormData] = useState({
    subjectId: 1,
    title: '',
    description: '',
    evaluationDate: new Date(),
    startTime: '08:00',
    endTime: '10:00',
    room: '',
    evaluationStatus: 'planifiee',
    evaluationType: 'CC' as EvaluationType,
    createdAt: new Date().toISOString(),

  });

  const loadData = async () => {
    try {
      const [evaluationsData, subjectsData] = await Promise.all([
        getEvaluations(),       
        getSubjects()
      ]);      

      setEvaluations(evaluationsData);
      setSubjects(subjectsData);
    } catch (error) {
      console.error('Error loading evaluations:', error);
      toast.error('Erreur lors du chargement des données');
    }
  };
  const formatDate = (dateStr: Date) => {
    // format as YYYY-MM-DD
    return format(new Date(dateStr), 'yyyy-MM-dd');
  }

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setFormData({
    subjectId: 1,
    title: '',
    description: '',
    evaluationDate: new Date(),
    startTime: '08:00',
    endTime: '10:00',
    room: '',
    evaluationStatus: 'planifiee',
    evaluationType: 'CC' as EvaluationType,
    createdAt: new Date().toISOString(),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.subjectId || !formData.evaluationDate) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const payload = {
      subjectId: formData.subjectId,
      title: formData.title || `${formData.evaluationType} - ${subjects.find(s => s.id === formData.subjectId)?.name}`,
      description: formData.description,
      evaluationDate: formatDate(formData.evaluationDate),
      startTime: formData.startTime,
      endTime: formData.endTime,
      room: formData.room,
      evaluationType: formData.evaluationType,
      evaluationStatus: 'planifiee',      
    };

    try {
      await createEvaluation({
        ...payload
      });
      
    

      toast.success('Évaluation programmée avec succès');
      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error creating evaluation:', error);
      toast.error('Erreur lors de la programmation');
    }
  };

  // const handleDelete = async (type: EvaluationType, id: string) => {
  //   if (confirm('Êtes-vous sûr de vouloir supprimer cette évaluation ?')) {
  //     try {
  //       await deleteEvaluation(type, id);
  //       toast.success('Évaluation supprimée');
  //       loadData();
  //     } catch (error) {
  //       console.error('Error deleting evaluation:', error);
  //       toast.error('Erreur lors de la suppression');
  //     }
  //   }
  // };

  const filteredEvaluations = filterSubject === 'all'
    ? evaluations
    : evaluations.filter((e) => e.subjectId === filterSubject);

  const getTypeBadge = (type: EvaluationType) => {
    const styles = {
      CC: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      SN: 'bg-green-500/10 text-green-600 border-green-500/20',
      RA: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    };
    const labels = {
      CC: 'Contrôle Continu',
      SN: 'Session Normale',
      RA: 'Rattrapage',
    };
    return <Badge className={`${styles[type]} border px-2.5 py-0.5 rounded-full font-bold text-[10px]`}>{labels[type]}</Badge>;
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
              <Calendar className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-primary tracking-tight">Programmation des Évaluations</h2>
              <p className="text-sm text-muted-foreground font-medium">
                Planifiez les examens et contrôles d'excellence
              </p>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => resetForm()}
                  className="relative overflow-hidden gradient-institutional text-white shadow-lg shadow-primary/20 hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all duration-300 py-6 px-6 rounded-xl text-base font-bold group"
                >
                  <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 blur-md" />
                  <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                  Nouvelle Évaluation
                </Button>
              </motion.div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] border-none shadow-2xl bg-white/95 dark:bg-card/90 backdrop-blur-xl">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black text-primary">Programmer une Évaluation</DialogTitle>
                  <DialogDescription className="text-base">
                    Planifiez un examen ou contrôle continu
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-5 py-6">
                  <div className="space-y-2">
                    <Label htmlFor="subjectId" className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Matière *</Label>
                    <Select
                      value={String(formData.subjectId)}
                      onValueChange={(value) => setFormData({ ...formData, subjectId: parseInt(value) })}
                    >
                      <SelectTrigger className="h-12 text-base bg-muted/50 dark:bg-muted/50 border-transparent focus:border-primary/50 focus:bg-white transition-all rounded-xl">
                        <SelectValue placeholder="Sélectionner une matière" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-card dark:border-white/10">
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={String(subject.id)}>
                            {subject.code} - {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="evaluationType" className="text-sm  font-bold uppercase tracking-wide text-muted-foreground">Type d'évaluation *</Label>
                    <Select
                      
                      value={formData.evaluationType}
                      onValueChange={(value) => setFormData({ ...formData, evaluationType: value as EvaluationType })}
                    >
                      <SelectTrigger className="h-12 text-base bg-muted/50 dark:bg-muted/50 border-transparent focus:border-primary/50 focus:bg-white transition-all rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CC">Contrôle Continu (30%)</SelectItem>
                        <SelectItem value="SN">Session Normale (70%)</SelectItem>
                        <SelectItem value="RA">Rattrapage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date" className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Date *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.evaluationDate.toISOString().split('T')[0]}
                        onChange={(e) => setFormData({ ...formData, evaluationDate: new Date(e.target.value) })}
                        className="h-12 text-base bg-muted/50 dark:bg-muted/50 border-transparent focus:border-primary/50 focus:bg-white transition-all rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="startTime" className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Heure</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        className="h-12 text-base bg-muted/50 dark:bg-muted/50 border-transparent focus:border-primary/50 focus:bg-white transition-all rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="endTime" className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Heure de fin</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        className="h-12 text-base bg-muted/50 dark:bg-muted/50 border-transparent focus:border-primary/50 focus:bg-white transition-all rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="room" className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Salle</Label>
                      <Input
                        id="room"
                        value={formData.room}
                        onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                        className="h-12 text-base bg-muted/50 dark:bg-muted/50 border-transparent focus:border-primary/50 focus:bg-white transition-all rounded-xl"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="h-12 rounded-xl text-muted-foreground hover:text-foreground">
                    Annuler
                  </Button>
                  <Button type="submit" className="h-12 rounded-xl gradient-institutional text-white font-bold shadow-lg hover:shadow-primary/25">
                    Programmer l'évaluation
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-institutional bg-white/60 dark:bg-card/60 backdrop-blur-xl rounded-2xl border border-white/5 ring-1 ring-black/5">
            <CardContent className="py-5">
              <Select value={filterSubject} onValueChange={setFilterSubject}>
                <SelectTrigger className="w-full md:w-[320px] dark:bg-muted/50 h-14 text-base rounded-xl border-transparent bg-muted/50 focus:bg-white focus:border-primary/20 transition-all shadow-inner">
                  <SelectValue placeholder="Filtrer par matière" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-none shadow-2xl bg-white/95 dark:bg-muted/50 backdrop-blur-xl">
                  <SelectItem value="all" className="py-3 text-base rounded-lg cursor-pointer">Toutes les matières</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id} className="py-3 text-base rounded-lg cursor-pointer">
                      {subject.code} - {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                      <ClipboardList className="h-5 w-5" />
                    </span>
                    Calendrier des Évaluations
                  </CardTitle>
                  <CardDescription className="text-base font-bold text-muted-foreground mt-2 pl-1">
                    {filteredEvaluations.length} évaluation(s) programmée(s)
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {filteredEvaluations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <div className="p-4 bg-muted/50 rounded-full mb-4">
                    <Calendar className="h-12 w-12 opacity-50" />
                  </div>
                  <p className="text-lg font-medium">Aucune évaluation programmée.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow className="hover:bg-transparent border-none">
                        <TableHead className="py-5 px-8 font-bold text-primary uppercase tracking-widest text-xs">Matière</TableHead>
                        <TableHead className="py-5 px-6 font-bold text-primary uppercase tracking-widest text-xs">Type</TableHead>
                        <TableHead className="py-5 px-6 font-bold text-primary uppercase tracking-widest text-xs">Date & Heure</TableHead>
                        <TableHead className="py-5 px-6 font-bold text-primary uppercase tracking-widest text-xs">Salle</TableHead>
                        <TableHead className="py-5 px-8 text-right font-bold text-primary uppercase tracking-widest text-xs">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {filteredEvaluations
                          .sort((a, b) => new Date(a.evaluationDate).getTime() - new Date(b.evaluationDate).getTime())
                          .map((evaluation, index) => (
                            <motion.tr
                              key={evaluation.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              transition={{ delay: index * 0.05 }}
                              className="group hover:bg-primary/5 transition-colors border-b border-white/5 last:border-0"
                            >
                              <TableCell className="py-5 px-8 font-medium">
                                {subjects.find(s => s.id === evaluation.subjectId)?.name || '...'}
                              </TableCell>
                              <TableCell className="py-5 px-6">{getTypeBadge(evaluation.evaluationType)}</TableCell>
                              <TableCell className="py-5 px-6 font-medium text-slate-600">
                                {format(new Date(evaluation.evaluationDate), 'dd MMM yyyy', { locale: fr })} à {evaluation.startTime}
                              </TableCell>
                              <TableCell className="py-5 px-6 font-mono text-sm">{evaluation.room || '—'}</TableCell>
                              <TableCell className="py-5 px-8 text-right">
                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-2 group-hover:translate-x-0">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => alert('Edit functionality not implemented yet')}
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
