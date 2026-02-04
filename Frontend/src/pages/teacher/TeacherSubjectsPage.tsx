import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, Clock, GraduationCap } from 'lucide-react';
import { getSubjects } from '@/api/subject';
import { getFilieres } from '@/api/filiere';
import { getEtudiants } from '@/api/etudiant';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function TeacherSubjectsPage() {
    const { user } = useAuth();
    const [subjects, setSubjects] = useState<any[]>([]);
    const [filieres, setFilieres] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [allSubjects, allFilieres, allStudents] = await Promise.all([
                    getSubjects(),
                    getFilieres(),
                    getEtudiants()
                ]);

                const teacherSubjects = allSubjects.filter((s: any) => s.responsibleTeacherId === user?.id);
                setSubjects(teacherSubjects);
                setFilieres(allFilieres);
                setStudents(allStudents);
            } catch (error) {
                toast.error('Erreur lors du chargement des matières');
            } finally {
                setIsLoading(false);
            }
        };

        if (user) loadData();
    }, [user]);

    const getFiliereName = (filiereId: string) => {
        return filieres.find(f => f.id === filiereId)?.name || 'Inconnue';
    };

    const getStudentCount = (filiereId: string) => {
        return students.filter(s => s.filiere === filiereId).length;
    };

    return (
        <DashboardLayout>
            <div className="space-y-6 animate-fade-in-up">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-primary tracking-tight">Mes Matières</h2>
                        <p className="text-sm text-muted-foreground font-medium">
                            Liste des enseignements dont vous êtes responsable
                        </p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map(i => (
                            <Card key={i} className="animate-pulse">
                                <CardHeader className="h-24 bg-muted/50" />
                                <CardContent className="h-32" />
                            </Card>
                        ))}
                    </div>
                ) : subjects.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                            <p className="text-lg font-bold text-muted-foreground">Aucune matière assignée</p>
                            <p className="text-sm text-muted-foreground">Contactez l'administration si cela est une erreur.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {subjects.map((subject) => (
                            <Card key={subject.id} className="border-0 shadow-institutional hover:shadow-2xl transition-all duration-500 group overflow-hidden">
                                <div className="h-2 bg-primary group-hover:h-3 transition-all duration-500" />
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <Badge variant="outline" className="font-mono text-[10px]">{subject.code}</Badge>
                                        <Badge className="bg-primary/10 text-primary border-0 text-[10px] font-bold">Semestre {subject.semester}</Badge>
                                    </div>
                                    <CardTitle className="text-lg font-bold mt-2 leading-tight group-hover:text-primary transition-colors">
                                        {subject.name}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                                        <GraduationCap className="h-4 w-4 text-primary/60" />
                                        <span>{getFiliereName(subject.filiereId)}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                                        <Users className="h-4 w-4 text-primary/60" />
                                        <span>{getStudentCount(subject.filiereId)} Étudiants inscrits</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                                        <Clock className="h-4 w-4 text-primary/60" />
                                        <span>Coefficient: {subject.coefficient}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
