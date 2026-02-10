import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, Clock, GraduationCap, ChevronRight } from 'lucide-react';
import { getMySubjects } from '@/api/enseignant';
import { getEtudiants } from '@/api/etudiant';
import { getFilieres } from '@/api/filiere';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function TeacherSubjectsPage() {
    let user = localStorage.getItem('auth_user');
    const [subjects, setSubjects] = useState<any[]>([]);
    const [filieres, setFilieres] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [allSubjects, allFilieres, allStudents] = await Promise.all([
                    getMySubjects(user),
                    getFilieres(),
                    getEtudiants()
                ]);
                const teacherSubjects = allSubjects.filter((s: any) => s.enseignant_id == user);
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

    const getFiliereName = (id: number) => {
        const filiere = filieres.find(f => f.id === id);
        return filiere ? filiere.name : 'N/A';
    };

    const getStudentCount = (filiereId: number) => {
        return students.filter((s: any) => s.filiere === filiereId).length;
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
                className="space-y-8"
            >
                {/* Header Banner */}
                <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[2.5rem] gradient-deep-blue shadow-2xl group border border-white/10">
                    <div className="absolute top-0 right-0 w-[35rem] h-[35rem] bg-indigo-500/30 rounded-full blur-[100px] -mr-32 -mt-32 animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-blue-500/20 rounded-full blur-[80px] -ml-24 -mb-24 animate-pulse delay-1000"></div>

                    <div className="relative z-10 p-10 flex items-center justify-between">
                        <div className="space-y-4 max-w-2xl">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg"
                            >
                                <BookOpen className="h-4 w-4 text-white" />
                                <span className="text-xs font-black text-white uppercase tracking-wider">Programme Académique</span>
                            </motion.div>
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight"
                            >
                                Mes Matières
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="text-lg text-blue-100 font-medium leading-relaxed"
                            >
                                Consultez et gérez les enseignements dont vous êtes responsable pour cette année académique.
                            </motion.p>
                        </div>
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0, rotate: 10 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            transition={{ delay: 0.6, type: "spring" }}
                            className="hidden lg:block relative"
                        >
                            <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full transform translate-y-4"></div>
                            <div className="relative p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl hover:scale-105 transition-transform duration-500">
                                <GraduationCap className="h-20 w-20 text-white drop-shadow-xl" />
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                {isLoading ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map(i => (
                            <Card key={i} className="rounded-3xl border-0 bg-muted/20 animate-pulse">
                                <CardHeader className="h-32 bg-muted/40 rounded-t-3xl" />
                                <CardContent className="h-40 p-6" />
                            </Card>
                        ))}
                    </div>
                ) : subjects.length === 0 ? (
                    <motion.div variants={itemVariants}>
                        <Card className="border-0 shadow-lg rounded-[2rem] bg-white/60 dark:bg-card/60 backdrop-blur-xl">
                            <CardContent className="py-20 text-center">
                                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <BookOpen className="h-10 w-10 text-slate-300" />
                                </div>
                                <p className="text-xl font-bold text-foreground mb-2">Aucune matière assignée</p>
                                <p className="text-muted-foreground">Contactez l'administration si cela est une erreur.</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ) : (
                    <motion.div
                        variants={containerVariants}
                        className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
                    >
                        {subjects.map((subject, index) => (
                            <motion.div key={subject.id} variants={itemVariants}>
                                <Card className="border-0 shadow-institutional hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-2 transition-all duration-500 group overflow-hidden bg-white dark:bg-card rounded-[2rem] ring-1 ring-black/5 h-full flex flex-col">
                                    <div className="h-2 bg-gradient-to-r from-primary to-blue-400 group-hover:h-3 transition-all duration-500" />
                                    <CardHeader className="pt-8 px-8 pb-4">
                                        <div className="flex justify-between items-start mb-4">
                                            <Badge variant="outline" className="font-mono text-[10px] dark:bg-muted/30 uppercase tracking-widest border-slate-200 bg-slate-50">{subject.code}</Badge>
                                            <Badge className="bg-primary/10 text-primary border-0 text-[10px] font-black uppercase tracking-wider hover:bg-primary/20">Semestre {subject.semestre}</Badge>
                                        </div>
                                        <CardTitle className="text-2xl font-black leading-tight text-foreground group-hover:text-primary transition-colors duration-300">
                                            {subject.nom}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="px-8 pb-8 space-y-6 flex-1 flex flex-col justify-end">
                                        <div className="space-y-4">
                                            <div className="flex items-center dark:bg-muted/30 gap-3 text-sm text-slate-600 font-bold group-hover:text-slate-900 transition-colors p-3 rounded-xl bg-slate-50 group-hover:bg-primary/5">
                                                <GraduationCap className="h-4 w-4 dark:bg-muted/30text-primary/70" />
                                                <span className="truncate ">{getFiliereName(subject.filiere_id)}</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                                    <Users className="h-3.5 w-3.5" />
                                                    <span>{getStudentCount(subject.filiere_id)} Étudiants</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 justify-end">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    <span>Coeff: {subject.credit}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-6 mt-2 border-t border-slate-100 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                                            <span className="text-xs font-bold text-primary">Voir détails</span>
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                <ChevronRight className="h-4 w-4" />
                                            </div>
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
