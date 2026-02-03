import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getSubjectsByFiliere, getFilieres } from '@/lib/storage';
import { getSubjectResultForStudent, calculateWeightedAverage, getMention } from '@/lib/gradeCalculator';
import { Student, SubjectResult } from '@/lib/types';
import { BookOpen, Award, TrendingUp, AlertTriangle, CheckCircle, GraduationCap } from 'lucide-react';

export function StudentDashboard() {
  const { user } = useAuth();
  const [results, setResults] = useState<SubjectResult[]>([]);
  const [average, setAverage] = useState<number | null>(null);
  const [filiereName, setFiliereName] = useState('');

  useEffect(() => {
    if (user && 'filiere' in user) {
      const student = user as Student;
      const filiere = getFilieres().find((f) => f.id === student.filiere);
      setFiliereName(filiere?.name || '');

      const subjects = getSubjectsByFiliere(student.filiere);
      const subjectResults = subjects.map((subject) =>
        getSubjectResultForStudent(student.id, subject.id, subject.name, subject.coefficient)
      );
      setResults(subjectResults);

      const weightedAvg = calculateWeightedAverage(subjectResults);
      setAverage(weightedAvg);
    }
  }, [user]);

  const validatedCount = results.filter((r) => r.decision === 'Validé').length;
  const rattrapageCount = results.filter((r) => r.decision === 'Rattrapage').length;

  const getDecisionBadge = (decision: string) => {
    switch (decision) {
      case 'Validé':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Validé</Badge>;
      case 'Rattrapage':
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Rattrapage</Badge>;
      case 'Non Validé':
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Non Validé</Badge>;
      default:
        return <Badge variant="outline">{decision}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Welcome Banner */}
      <Card className="gradient-institutional text-primary-foreground border-0 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-700 group-hover:scale-125"></div>
        <CardHeader className="relative z-10 py-8 px-8">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-2xl font-black tracking-tight">
              Bienvenue, {user?.firstName} {user?.lastName}
            </CardTitle>
            <CardDescription className="text-base text-primary-foreground/90 font-medium flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              {filiereName} • {new Date().getFullYear()}
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      {/* Stats & Average */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Moyenne Générale"
          value={average !== null ? average.toFixed(2) : '—'}
          icon={Award}
          description={average !== null ? getMention(average) : 'En attente'}
          color="bg-primary/10 text-primary"
          index={1}
        />

        <StatCard
          title="Validées"
          value={validatedCount}
          icon={CheckCircle}
          description={`sur ${results.length} matières`}
          color="bg-green-500/10 text-green-600"
          index={2}
        />

        <StatCard
          title="Rattrapages"
          value={rattrapageCount}
          icon={AlertTriangle}
          description="Examens à repasser"
          color="bg-yellow-500/10 text-yellow-600"
          index={3}
        />

        <Card className="hover-lift border-0 shadow-institutional bg-white animate-fade-in-up stagger-4">
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-xs font-black text-muted-foreground uppercase tracking-widest">
              Progression
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 shadow-inner">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-primary">
              {results.length > 0 ? Math.round((validatedCount / results.length) * 100) : 0}%
            </div>
            <Progress
              value={results.length > 0 ? (validatedCount / results.length) * 100 : 0}
              className="mt-2 h-1.5 bg-slate-100"
            />
          </CardContent>
        </Card>
      </div>

      {/* Grades Table */}
      <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden bg-white">
        <CardHeader className="bg-slate-50 border-b border-slate-100 py-6 px-10">
          <CardTitle className="flex items-center gap-2 text-xl font-black text-primary">
            <BookOpen className="h-5 w-5" />
            Mes Notes
          </CardTitle>
          <CardDescription className="text-sm font-bold text-muted-foreground mt-1">
            Résultats par matière - Formule: (CC × 30%) + (SN × 70%)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {results.length === 0 ? (
            <p className="text-muted-foreground text-center py-20 font-bold text-xl">
              Aucune note disponible pour le moment
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50/50">
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-4 px-10 font-black text-primary uppercase tracking-widest text-[10px]">Matière</th>
                    <th className="text-center py-4 px-6 font-black text-primary uppercase tracking-widest text-[10px]">CC</th>
                    <th className="text-center py-4 px-6 font-black text-primary uppercase tracking-widest text-[10px]">SN</th>
                    <th className="text-center py-4 px-6 font-black text-primary uppercase tracking-widest text-[10px]">RA</th>
                    <th className="text-center py-4 px-6 font-black text-primary uppercase tracking-widest text-[10px]">Final</th>
                    <th className="text-center py-4 px-6 font-black text-primary uppercase tracking-widest text-[10px]">Coef.</th>
                    <th className="text-center py-4 px-10 font-black text-primary uppercase tracking-widest text-[10px]">Décision</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result) => (
                    <tr key={result.subjectId} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/80 transition-colors group">
                      <td className="py-4 px-10 font-bold text-slate-700 group-hover:text-primary transition-colors text-sm">{result.subjectName}</td>
                      <td className="py-4 px-6 text-center font-semibold text-slate-500 text-sm">
                        {result.ccScore !== null ? result.ccScore.toFixed(1) : '—'}
                      </td>
                      <td className="py-4 px-6 text-center font-semibold text-slate-500 text-sm">
                        {result.snScore !== null ? result.snScore.toFixed(1) : '—'}
                      </td>
                      <td className="py-4 px-6 text-center font-semibold text-slate-500 text-sm">
                        {result.raScore !== null ? result.raScore.toFixed(1) : '—'}
                      </td>
                      <td className="py-4 px-6 text-center font-black text-primary">
                        {result.finalScore !== null ? result.finalScore.toFixed(2) : '—'}
                      </td>
                      <td className="py-4 px-6 text-center font-bold text-slate-400 text-xs">{result.coefficient}</td>
                      <td className="py-4 px-10 text-center">
                        {getDecisionBadge(result.decision)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  color,
  index,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  color: string;
  index: number;
}) {
  return (
    <Card className={`hover-lift border-0 shadow-institutional bg-white transition-all duration-300 stagger-${index}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-1">
        <CardTitle className="text-xs font-black text-muted-foreground uppercase tracking-widest">
          {title}
        </CardTitle>
        <div className={`p-2.5 rounded-xl ${color} shadow-inner`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-black text-primary">{value}</div>
        <p className="text-xs text-muted-foreground font-semibold mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}
