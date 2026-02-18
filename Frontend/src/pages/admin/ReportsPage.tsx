import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, BarChart2, PieChart, Users, BookOpen, TrendingUp, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getFilieres } from '@/api/filiere';
import { getEtudiants } from '@/api/etudiant';
import { getGrades } from '@/api/grade';
import { getSubjects } from '@/api/subject';
import { calculateWeightedAverage, getSubjectResultForStudent } from '@/lib/gradeCalculator';
import { getEvaluations } from '@/api/evaluation';
import { GeneratePVDialog } from '@/components/grade/GeneratePVDialog';
import { motion } from 'framer-motion';

export default function ReportsPage() {
    const [stats, setStats] = useState({
        totalStudents: 0,
        average: 0,
        passRate: 0,
        filiereStats: [] as any[]
    });
    const [selectedPV, setSelectedPV] = useState<'CC' | 'SN' | 'RA' | 'Final' | null>(null);
    const [openDialog, setOpenDialog] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [filieres, etudiants, grades, allEvals] = await Promise.all([
                    getFilieres(),
                    getEtudiants(),
                    getGrades(),
                    getEvaluations(),
                ]);
                

                // Calculate Filiere Stats - simplified calculation without subjects
                const fStats = filieres.map((f: any) => {
                    const fStudents = etudiants.filter((s: any) => s.filiere === f.id);

                    if (fStudents.length === 0) return { label: f.name, progress: 0, average: "0.00" };

                    // Calculate average for these students from grades
                    let totalAvg = 0;
                    let validStudents = 0;

                    fStudents.forEach((stud: any) => {
                        const studentGrades = grades.filter((g: any) => g.etudiant === stud.id);
                        if (studentGrades.length > 0) {
                            const avg = studentGrades.reduce((sum: number, g: any) => sum + (g.grade || 0), 0) / studentGrades.length;
                            if (avg !== null) {
                                totalAvg += avg;
                                validStudents++;
                            }
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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1
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
                            <FileText className="h-8 w-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-primary tracking-tight">Rapports & Statistiques</h2>
                            <p className="text-sm text-muted-foreground font-medium">
                                Générez des rapports académiques détaillés et visualisez les performances
                            </p>
                        </div>
                    </div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button className="relative overflow-hidden gradient-institutional text-white shadow-lg shadow-primary/20 hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all duration-300 py-6 px-6 rounded-xl text-base font-bold group">
                            <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 blur-md" />
                            <Download className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                            Exporter Tout
                        </Button>
                    </motion.div>
                </motion.div>

                <motion.div variants={containerVariants} className="grid gap-6 md:grid-cols-3">
                    <motion.div variants={itemVariants}>
                        <StatsCard
                            title="Étudiants Inscrits"
                            value={stats.totalStudents.toString()}
                            icon={<Users className="h-5 w-5" />}
                            trend="Inscrits ce semestre"
                        />
                    </motion.div>
                    <motion.div variants={itemVariants}>
                        <StatsCard
                            title="Moyenne Générale"
                            value={stats.average.toFixed(1)}
                            icon={<BarChart2 className="h-5 w-5" />}
                            trend="Moyenne de l'école"
                        />
                    </motion.div>
                    <motion.div variants={itemVariants}>
                        <StatsCard
                            title="Taux de Réussite"
                            value={`${Math.round(stats.passRate)}%`}
                            icon={<PieChart className="h-5 w-5" />}
                            trend="Matières validées"
                        />
                    </motion.div>
                </motion.div>

                <motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-2">
                    <Card className="border-0 shadow-2xl rounded-[2rem] overflow-hidden bg-white/60 dark:bg-card/60 backdrop-blur-xl border-white/20 ring-1 ring-black/5">
                        <CardHeader className="bg-muted/30 border-b border-white/5 py-8 px-8">
                            <CardTitle className="flex items-center gap-3 text-xl font-black text-primary">
                                <span className="p-2 bg-primary/10 rounded-xl text-primary ring-1 ring-primary/20">
                                    <TrendingUp className="h-5 w-5" />
                                </span>
                                Performance par Filière
                            </CardTitle>
                            <CardDescription className="text-base font-bold text-muted-foreground mt-2 pl-1">
                                Moyennes académiques par département
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="space-y-6">
                                {stats.filiereStats.map((fs, idx) => (
                                    <FiliereProgress key={idx} label={fs.label} progress={fs.progress} average={fs.average} delay={idx} />
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-2xl rounded-[2rem] overflow-hidden bg-white/60 dark:bg-card/60 backdrop-blur-xl border-white/20 ring-1 ring-black/5">
                        <CardHeader className="bg-muted/30 border-b border-white/5 py-8 px-8">
                            <div className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-3 text-xl font-black text-primary">
                                        <span className="p-2 bg-primary/10 rounded-xl text-primary ring-1 ring-primary/20">
                                            <BookOpen className="h-5 w-5" />
                                        </span>
                                        Rapports Instantanés
                                    </CardTitle>
                                    <CardDescription className="text-base font-bold text-muted-foreground mt-2 pl-1">
                                        Documents prêts à être téléchargés
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 space-y-4">
                            <ReportLink title="Relevé de notes global S1" type="PDF" delay={0} />
                            <ReportLink title="Liste des étudiants" type="Excel" delay={1} />
                            <ReportLink title="Performance par Enseignant" type="PDF" delay={2} />
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Procès-Verbaux Section */}
                <motion.div variants={itemVariants}>
                    <Card className="border-0 shadow-institutional rounded-[2rem] bg-white/60 dark:bg-card/60 backdrop-blur-xl">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-3 text-lg">
                                <FileDown className="h-5 w-5 text-blue-600" />
                                Procès-Verbaux des Évaluations
                            </CardTitle>
                            <CardDescription>
                                Générez et téléchargez les procès-verbaux des évaluations
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <motion.div variants={containerVariants} className="grid gap-4 md:grid-cols-2">
                                {[
                                    { type: 'CC' as const, label: 'Contrôle Continu', icon: '📋' },
                                    { type: 'SN' as const, label: 'Session Normale', icon: '📊' },
                                    { type: 'RA' as const, label: 'Rattrapage', icon: '🔄' },
                                    { type: 'Final' as const, label: 'Notes Finales', icon: '✅' }
                                ].map((pv) => (
                                    <motion.div key={pv.type} variants={itemVariants}>
                                        <Button
                                            onClick={() => {
                                                setSelectedPV(pv.type);
                                                setOpenDialog(true);
                                            }}
                                            className="w-full justify-start h-auto py-4 px-4 bg-gradient-to-br from-slate-50 to-slate-100 hover:from-primary/5 hover:to-primary/10 text-foreground border border-slate-200 hover:border-primary/50 transition-all"
                                        >
                                            <div className="text-2xl mr-3">{pv.icon}</div>
                                            <div className="text-left flex-1">
                                                <div className="font-semibold">{pv.label}</div>
                                                <div className="text-xs text-muted-foreground">PV {pv.type}</div>
                                            </div>
                                            <Download className="h-4 w-4 opacity-50" />
                                        </Button>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>

            {/* PV Dialog */}
            {selectedPV && (
                <GeneratePVDialog
                    open={openDialog}
                    onOpenChange={setOpenDialog}
                    evaluationType={selectedPV}
                />
            )}
        </DashboardLayout>
    );
}

function StatsCard({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend: string }) {
    return (
        <Card className="border-0 shadow-institutional overflow-hidden group hover:shadow-2xl transition-all duration-500 bg-white/60 dark:bg-card/60 backdrop-blur-xl border-white/20 ring-1 ring-black/5 rounded-2xl">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 ring-1 ring-primary/20">
                        {icon}
                    </div>
                    <Badge variant="secondary" className="bg-primary/5 text-[10px] font-black uppercase tracking-widest text-primary/70">{trend}</Badge>
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-bold text-muted-foreground">{title}</p>
                    <p className="text-4xl font-black text-primary tracking-tighter">{value}</p>
                </div>
            </CardContent>
        </Card>
    );
}

function FiliereProgress({ label, progress, average, delay }: { label: string, progress: number, average: string, delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay * 0.1 + 0.5 }}
            className="space-y-2 group"
        >
            <div className="flex justify-between text-base">
                <span className="font-bold text-foreground/80 group-hover:text-primary transition-colors">{label}</span>
                <span className="font-black text-primary">{average} / 20</span>
            </div>
            <div className="h-3 w-full bg-muted rounded-full overflow-hidden shadow-inner">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: delay * 0.1 + 0.5 }}
                    className="h-full gradient-institutional shadow-lg"
                />
            </div>
        </motion.div>
    );
}

function ReportLink({ title, type, delay }: { title: string, type: string, delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay * 0.1 + 0.6 }}
            className="flex items-center justify-between p-4 rounded-xl hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-primary/10 group cursor-pointer bg-white/40"
        >
            <div className="flex items-center gap-4">
                <div className="p-2.5 bg-white rounded-lg shadow-sm border border-slate-100 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <FileText className="h-5 w-5 text-primary" />
                </div>
                <p className="text-base font-bold text-foreground/80 group-hover:text-primary transition-colors">{title}</p>
            </div>
            <Badge variant="outline" className={`text-[10px] font-black uppercase tracking-wider border-2 ${type === 'PDF' ? 'border-red-100 text-red-600 bg-red-50' : 'border-green-100 text-green-600 bg-green-50'}`}>
                {type}
            </Badge>
        </motion.div>
    );
}
