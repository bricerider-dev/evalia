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
                const teacherSubjects = allSubjects.filter((s: any) => s.enseignant === user?.id);
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
                {/* Header Banner */}
                <div className="relative overflow-hidden rounded-3xl gradient-deep-blue shadow-2xl group mb-8">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -mr-32 -mt-32 animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-[60px] -ml-24 -mb-24 animate-pulse delay-1000"></div>

                    <div className="relative z-10 p-8 flex items-center justify-between">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-sm animate-fade-in">
                                <BookOpen className="h-4 w-4 text-white" />
                                <span className="text-xs font-bold text-white uppercase tracking-wider">Programme Académique</span>
                            </div>
                            <h2 className="text-3xl font-black text-white tracking-tight animate-fade-up">Mes Matières</h2>
                            <p className="text-white/80 font-medium max-w-lg animate-fade-up delay-100">
                                Liste des enseignements dont vous êtes responsable pour cette année académique.
                            </p>
                        </div>
                        <div className="hidden md:block animate-float">
                            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
                                <GraduationCap className="h-8 w-8 text-white" />
                            </div>
                        </div>
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
                        {subjects.map((subject, index) => (
                            <Card key={subject.id} className={`border-0 shadow-institutional hover:shadow-2xl transition-all duration-500 group overflow-hidden animate-fade-in-up stagger-${index % 5 + 1}`}>
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
