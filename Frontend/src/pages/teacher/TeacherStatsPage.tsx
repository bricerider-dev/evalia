import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart2, TrendingUp, Users, Award, PieChart } from 'lucide-react';
import { getSubjects } from '@/api/subject';
import { getGrades } from '@/api/grade';
import { getEvaluationsCC, getEvaluationsSN, getEvaluationsRA } from '@/api/evaluation';
import { calculateWeightedAverage, getSubjectResultForStudent } from '@/lib/gradeCalculator';
import { getEtudiants } from '@/api/etudiant';
import { toast } from 'sonner';

export default function TeacherStatsPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [allSubjects, allGrades, cc, sn, ra, etudiants] = await Promise.all([
                    getSubjects(),
                    getGrades(),
                    getEvaluationsCC(),
                    getEvaluationsSN(),
                    getEvaluationsRA(),
                    getEtudiants()
                ]);

                const allEvals = [
                    ...cc.map((e: any) => ({ ...e, type: 'CC' })),
                    ...sn.map((e: any) => ({ ...e, type: 'SN' })),
                    ...ra.map((e: any) => ({ ...e, type: 'RA' }))
                ];

                const teacherSubjects = allSubjects.filter((s: any) => s.responsibleTeacherId === user?.id);

                const subjectStats = teacherSubjects.map(subject => {
                    const subjectStudents = etudiants.filter((s: any) => s.filiere === subject.filiereId || true); // Assuming all students for now or filter by filiere

                    let totalAvg = 0;
                    let passCount = 0;
                    let count = 0;

                    subjectStudents.forEach(student => {
                        const result = getSubjectResultForStudent(student.id, subject.id, subject.name, subject.coefficient, allEvals, allGrades);
                        if (result.finalScore !== null) {
                            totalAvg += result.finalScore;
                            if (result.finalScore >= 10) passCount++;
                            count++;
                        }
                    });

                    return {
                        id: subject.id,
                        name: subject.name,
                        code: subject.code,
                        average: count > 0 ? (totalAvg / count).toFixed(2) : '0.00',
                        passRate: count > 0 ? Math.round((passCount / count) * 100) : 0,
                        studentCount: count
                    };
                });

                setStats(subjectStats);
            } catch (error) {
                toast.error('Erreur lors du chargement des statistiques');
            } finally {
                setIsLoading(false);
            }
        };

        if (user) loadData();
    }, [user]);

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
                                <TrendingUp className="h-4 w-4 text-white" />
                                <span className="text-xs font-bold text-white uppercase tracking-wider">Analyses & Rapports</span>
                            </div>
                            <h2 className="text-3xl font-black text-white tracking-tight animate-fade-up">Statistiques de Performance</h2>
                            <p className="text-white/80 font-medium max-w-lg animate-fade-up delay-100">
                                Visualisez la progression de vos étudiants et la réussite par matière.
                            </p>
                        </div>
                        <div className="hidden md:block animate-float">
                            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
                                <PieChart className="h-8 w-8 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid gap-6 md:grid-cols-2">
                        {[1, 2].map(i => <div key={i} className="h-64 bg-muted animate-pulse rounded-2xl" />)}
                    </div>
                ) : stats.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                            Aucune donnée statistique disponible.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                        {stats.map((s, index) => (
                            <Card key={s.id} className={`border-0 shadow-institutional overflow-hidden group hover:shadow-2xl transition-all duration-300 animate-fade-in-up stagger-${index % 5 + 1}`}>
                                <CardHeader className="bg-slate-50/50 border-b border-black/5 group-hover:bg-primary/5 transition-colors">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <CardTitle className="text-lg font-bold text-primary">{s.name}</CardTitle>
                                            <CardDescription className="text-xs font-mono">{s.code}</CardDescription>
                                        </div>
                                        <div className="p-2 rounded-lg bg-white shadow-sm">
                                            <BarChart2 className="h-5 w-5 text-primary" />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Moyenne de Classe</p>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-4xl font-black text-primary">{s.average}</span>
                                                <span className="text-sm font-bold text-muted-foreground">/ 20</span>
                                            </div>
                                        </div>
                                        <div className="space-y-1 text-right">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Taux de Réussite</p>
                                            <div className="flex items-baseline justify-end gap-2">
                                                <span className={`text-4xl font-black ${s.passRate >= 70 ? 'text-green-600' : s.passRate >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                                                    {s.passRate}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 space-y-2">
                                        <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                            <span>Progression vers la validation</span>
                                            <span>{s.passRate}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-1000 ease-out ${s.passRate >= 70 ? 'bg-green-500' : s.passRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                style={{ width: `${s.passRate}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-black/5 flex justify-between items-center">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                            <Users className="h-4 w-4" />
                                            {s.studentCount} Étudiants évalués
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] font-black text-primary uppercase tracking-tighter bg-primary/10 px-2 py-1 rounded-md">
                                            <TrendingUp className="h-3 w-3" />
                                            Voir Détails
                                        </div>
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
