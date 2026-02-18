import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart2, TrendingUp, Users, PieChart } from 'lucide-react';
import { getSubjects } from '@/api/subject';
import { getGrades } from '@/api/grade';
import { getEvaluations } from '@/api/evaluation';
import { getSubjectResultForStudent } from '@/lib/gradeCalculator';
import { getEtudiants } from '@/api/etudiant';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function TeacherStatsPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [allSubjects, allGrades, allEvals, etudiants] = await Promise.all([
                    getSubjects(),
                    getGrades(),
                    getEvaluations(),
                    getEtudiants()
                ]);
            
                const teacherSubjects = allSubjects.filter((s: any) => s.responsibleTeacherId === user?.id);

                const subjectStats = teacherSubjects.map(subject => {
                    const subjectStudents = etudiants.filter((s: any) => s.filiere === subject.filiereId || true); // Assuming all students for now or filter by filiere

                    let totalAvg = 0;
                    let passCount = 0;
                    let count = 0;

                    subjectStudents.forEach(student => {
                        const result = getSubjectResultForStudent(student.id, subject.id, subject.name, subject.credit || 1, allEvals, allGrades);
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
                {/* Header Banner */}
                <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[2.5rem] gradient-deep-blue shadow-2xl group mb-8 border border-white/10">
                    <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-white/10 rounded-full blur-[100px] -mr-40 -mt-40 animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-[20rem] h-[20rem] bg-black/20 rounded-full blur-[80px] -ml-32 -mb-32 animate-pulse delay-1000"></div>

                    <div className="relative z-10 p-10 flex items-center justify-between">
                        <div className="space-y-4 max-w-2xl">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg"
                            >
                                <TrendingUp className="h-4 w-4 text-white" />
                                <span className="text-xs font-black text-white uppercase tracking-wider">Analyses & Rapports</span>
                            </motion.div>
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight"
                            >
                                Statistiques de Performance
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="text-lg text-blue-100 font-medium leading-relaxed"
                            >
                                Visualisez la progression de vos étudiants et la réussite par matière avec des indicateurs précis.
                            </motion.p>
                        </div>
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            transition={{ delay: 0.6, type: "spring" }}
                            className="hidden lg:block relative"
                        >
                            <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full transform translate-y-4"></div>
                            <div className="relative p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl skew-y-3 transform hover:skew-y-0 transition-transform duration-700">
                                <PieChart className="h-16 w-16 text-white drop-shadow-lg" />
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                {isLoading ? (
                    <div className="grid gap-6 md:grid-cols-2">
                        {[1, 2].map(i => <div key={i} className="h-64 bg-muted/50 animate-pulse rounded-3xl" />)}
                    </div>
                ) : stats.length === 0 ? (
                    <motion.div variants={itemVariants}>
                        <Card className="border-0 shadow-lg bg-white/50 backdrop-blur-sm">
                            <CardContent className="py-16 text-center text-muted-foreground">
                                <PieChart className="h-16 w-16 mx-auto mb-4 opacity-20" />
                                <p className="text-lg font-bold">Aucune donnée statistique disponible.</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ) : (
                    <motion.div
                        variants={containerVariants}
                        className="grid gap-6 md:grid-cols-2"
                    >
                        {stats.map((s, index) => (
                            <motion.div key={s.id} variants={itemVariants}>
                                <Card className="border-0 shadow-institutional overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 bg-white/70 dark:bg-card/70 backdrop-blur-xl border-white/20 ring-1 ring-black/5 rounded-[2rem]">
                                    <div className={`h-1.5 w-full bg-gradient-to-r ${s.passRate >= 50 ? 'from-green-400 to-green-600' : 'from-red-400 to-red-600'}`} />
                                    <CardHeader className="bg-white/40 border-b border-white/10 pb-6">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-xl font-black text-primary mb-1">{s.name}</CardTitle>
                                                <CardDescription className="font-mono text-xs bg-primary/5 text-primary px-2 py-1 rounded-md inline-block font-bold">
                                                    {s.code}
                                                </CardDescription>
                                            </div>
                                            <div className="p-3 rounded-xl bg-white shadow-sm ring-1 ring-black/5 group-hover:scale-110 transition-transform duration-500">
                                                <BarChart2 className="h-6 w-6 text-primary" />
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-8">
                                        <div className="grid grid-cols-2 gap-8 mb-8">
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Moyenne</p>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-5xl font-black text-primary tracking-tighter">{s.average}</span>
                                                    <span className="text-sm font-bold text-muted-foreground">/ 20</span>
                                                </div>
                                            </div>
                                            <div className="space-y-2 text-right">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Taux Réussite</p>
                                                <div className="flex items-baseline justify-end gap-2">
                                                    <span className={`text-5xl font-black tracking-tighter ${s.passRate >= 70 ? 'text-green-600' : s.passRate >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                                                        {s.passRate}<span className="text-2xl">%</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                                <span>Progression</span>
                                                <span>{s.passRate}% validé</span>
                                            </div>
                                            <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner p-1">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    whileInView={{ width: `${s.passRate}%` }}
                                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                                    className={`h-full rounded-full shadow-sm ${s.passRate >= 70 ? 'bg-gradient-to-r from-green-400 to-green-600' : s.passRate >= 50 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : 'bg-gradient-to-r from-red-400 to-red-600'}`}
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-8 pt-6 border-t border-dashed border-slate-200 flex justify-between items-center">
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                                <Users className="h-4 w-4" />
                                                {s.studentCount} Étudiants évalués
                                            </div>
                                            <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/5 -mr-3 rounded-xl font-bold">
                                                Voir Détails <TrendingUp className="ml-2 h-3 w-3" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </motion.div>
        </DashboardLayout>
    );
}
