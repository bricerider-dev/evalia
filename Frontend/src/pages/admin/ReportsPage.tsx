import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, BarChart2, PieChart, Users, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getFilieres } from '@/api/filiere';
import { getEtudiants } from '@/api/etudiant';
import { getGrades } from '@/api/grade';
import { getSubjects } from '@/api/subject';
import { calculateWeightedAverage, getSubjectResultForStudent } from '@/lib/gradeCalculator';
import { getEvaluationsCC, getEvaluationsSN, getEvaluationsRA } from '@/api/evaluation';

export default function ReportsPage() {
    const [stats, setStats] = useState({
        totalStudents: 0,
        average: 0,
        passRate: 0,
        filiereStats: [] as any[]
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                const [filieres, etudiants, grades, subjects, cc, sn, ra] = await Promise.all([
                    getFilieres(),
                    getEtudiants(),
                    getGrades(),
                    getSubjects(),
                    getEvaluationsCC(),
                    getEvaluationsSN(),
                    getEvaluationsRA()
                ]);

                const allEvals = [
                    ...cc.map((e: any) => ({ ...e, type: 'CC' })),
                    ...sn.map((e: any) => ({ ...e, type: 'SN' })),
                    ...ra.map((e: any) => ({ ...e, type: 'RA' }))
                ];

                // Calculate Filiere Stats
                const fStats = filieres.map((f: any) => {
                    const fStudents = etudiants.filter((s: any) => s.filiere === f.id);
                    const fSubjects = subjects.filter((s: any) => s.filiereId === f.id || true); // Simplified

                    if (fStudents.length === 0) return { label: f.name, progress: 0, average: "0.00" };

                    // Calculate average for these students
                    let totalAvg = 0;
                    let validStudents = 0;

                    fStudents.forEach((stud: any) => {
                        const results = fSubjects.map((sub: any) =>
                            getSubjectResultForStudent(stud.id, sub.id, sub.name, sub.coefficient, allEvals, grades)
                        );
                        const avg = calculateWeightedAverage(results);
                        if (avg !== null) {
                            totalAvg += avg;
                            validStudents++;
                        }
                    });

                    const finalAvg = validStudents > 0 ? totalAvg / validStudents : 0;
                    return {
                        label: f.name,
                        progress: (finalAvg / 20) * 100,
                        average: finalAvg.toFixed(2)
                    };
                });

                // Overall stats
                const passRate = fStats.length > 0 ? fStats.reduce((acc, curr) => acc + (parseFloat(curr.average) >= 10 ? 1 : 0), 0) / fStats.length * 100 : 0;
                const overallAvg = fStats.length > 0 ? fStats.reduce((acc, curr) => acc + parseFloat(curr.average), 0) / fStats.length : 0;

                setStats({
                    totalStudents: etudiants.length,
                    average: overallAvg,
                    passRate: passRate,
                    filiereStats: fStats
                });

            } catch (error) {
                console.error("Error loading reports data:", error);
            }
        };
        loadData();
    }, []);

    return (
        <DashboardLayout>
            <div className="space-y-6 animate-fade-in-up">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-institutional border border-black/5">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-xl text-primary">
                            <FileText className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-primary tracking-tight">Rapports & Statistiques</h2>
                            <p className="text-sm text-muted-foreground font-medium">
                                Générez des rapports académiques détaillés
                            </p>
                        </div>
                    </div>
                    <Button className="gradient-institutional text-white shadow-lg hover:scale-105 transition-all duration-300 py-3 px-6 rounded-xl text-base font-bold">
                        <Download className="mr-2 h-5 w-5" />
                        Exporter Tout
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <StatsCard
                        title="Étudiants Inscrits"
                        value={stats.totalStudents.toString()}
                        icon={<Users className="h-5 w-5" />}
                        trend="Inscrits ce semestre"
                    />
                    <StatsCard
                        title="Moyenne Générale"
                        value={stats.average.toFixed(1)}
                        icon={<BarChart2 className="h-5 w-5" />}
                        trend="Moyenne de l'école"
                    />
                    <StatsCard
                        title="Taux de Réussite"
                        value={`${Math.round(stats.passRate)}%`}
                        icon={<PieChart className="h-5 w-5" />}
                        trend="Matières validées"
                    />
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card className="border-0 shadow-institutional">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">Performance par Filière</CardTitle>
                            <CardDescription>Moyennes académiques par département</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {stats.filiereStats.map((fs, idx) => (
                                    <FiliereProgress key={idx} label={fs.label} progress={fs.progress} average={fs.average} />
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-institutional">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-bold">Rapports Instantanés</CardTitle>
                                <CardDescription>Prêts à être téléchargés</CardDescription>
                            </div>
                            <BookOpen className="h-6 w-6 text-primary/20" />
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <ReportLink title="Relevé de notes global S1" type="PDF" />
                            <ReportLink title="Liste des étudiants" type="Excel" />
                            <ReportLink title="Performance par Enseignant" type="PDF" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}

function StatsCard({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend: string }) {
    return (
        <Card className="border-0 shadow-institutional overflow-hidden group hover:shadow-2xl transition-all duration-500">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-slate-50 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                        {icon}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{trend}</span>
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-bold text-muted-foreground">{title}</p>
                    <p className="text-3xl font-black text-primary tracking-tighter">{value}</p>
                </div>
            </CardContent>
        </Card>
    );
}

function FiliereProgress({ label, progress, average }: { label: string, progress: number, average: string }) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-sm">
                <span className="font-bold text-slate-700">{label}</span>
                <span className="font-black text-primary">{average} / 20</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                    className="h-full bg-primary transition-all duration-1000"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}

function ReportLink({ title, type }: { title: string, type: string }) {
    return (
        <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                    <FileText className="h-4 w-4 text-primary" />
                </div>
                <p className="text-sm font-bold text-slate-700">{title}</p>
            </div>
            <Badge variant="outline" className="text-[10px] font-black uppercase tracking-wider">{type}</Badge>
        </div>
    );
}
