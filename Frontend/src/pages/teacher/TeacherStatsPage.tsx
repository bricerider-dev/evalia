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
                <div>
                    <h2 className="text-2xl font-black text-primary tracking-tight">Statistiques de Performance</h2>
                    <p className="text-sm text-muted-foreground font-medium">
                        Analyse des résultats pour vos matières
                    </p>
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
                        {stats.map((s) => (
                            <Card key={s.id} className="border-0 shadow-institutional overflow-hidden group">
                                <CardHeader className="bg-slate-50/50 border-b border-black/5">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <CardTitle className="text-lg font-bold text-primary">{s.name}</CardTitle>
                                            <CardDescription className="text-xs font-mono">{s.code}</CardDescription>
                                        </div>
                                        <BarChart2 className="h-5 w-5 text-primary/20" />
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Moyenne de Classe</p>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-3xl font-black text-primary">{s.average}</span>
                                                <span className="text-sm font-bold text-muted-foreground">/ 20</span>
                                            </div>
                                        </div>
                                        <div className="space-y-1 text-right">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Taux de Réussite</p>
                                            <div className="flex items-baseline justify-end gap-2">
                                                <span className="text-3xl font-black text-primary">{s.passRate}%</span>
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
                                                className="h-full bg-primary transition-all duration-1000 ease-out"
                                                style={{ width: `${s.passRate}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-black/5 flex justify-between items-center">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                            <Users className="h-4 w-4" />
                                            {s.studentCount} Étudiants évalués
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] font-black text-green-600 uppercase tracking-tighter bg-green-50 px-2 py-1 rounded-md">
                                            <TrendingUp className="h-3 w-3" />
                                            Stable
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
