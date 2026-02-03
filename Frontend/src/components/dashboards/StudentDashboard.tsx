import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getSubjectsByFiliere, getFilieres, getGradesByStudent, getEvaluations, getSubjects } from '@/lib/storage';
import { getSubjectResultForStudent, calculateWeightedAverage, getMention } from '@/lib/gradeCalculator';
import { Student, SubjectResult } from '@/lib/types';
import { BookOpen, Award, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

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
  const failedCount = results.filter((r) => r.decision === 'Non Validé').length;

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
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card className="gradient-institutional text-primary-foreground border-0">
        <CardHeader>
          <CardTitle className="text-2xl">
            Bienvenue, {user?.firstName} {user?.lastName}
          </CardTitle>
          <CardDescription className="text-primary-foreground/80">
            {filiereName} • {new Date().getFullYear()}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Stats & Average */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Moyenne Générale
            </CardTitle>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Award className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {average !== null ? average.toFixed(2) : '—'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {average !== null ? getMention(average) : 'En attente'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Validées
            </CardTitle>
            <div className="p-2 rounded-lg bg-green-500/10 text-green-600">
              <CheckCircle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{validatedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              sur {results.length} matières
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rattrapages
            </CardTitle>
            <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-600">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{rattrapageCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Examens à repasser
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Progression
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {results.length > 0 ? Math.round((validatedCount / results.length) * 100) : 0}%
            </div>
            <Progress
              value={results.length > 0 ? (validatedCount / results.length) * 100 : 0}
              className="mt-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* Grades Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Mes Notes
          </CardTitle>
          <CardDescription>
            Résultats par matière - Formule: (CC × 30%) + (SN × 70%)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Aucune note disponible pour le moment
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Matière</th>
                    <th className="text-center py-3 px-2 font-medium text-muted-foreground">CC</th>
                    <th className="text-center py-3 px-2 font-medium text-muted-foreground">SN</th>
                    <th className="text-center py-3 px-2 font-medium text-muted-foreground">RA</th>
                    <th className="text-center py-3 px-2 font-medium text-muted-foreground">Final</th>
                    <th className="text-center py-3 px-2 font-medium text-muted-foreground">Coef.</th>
                    <th className="text-center py-3 px-2 font-medium text-muted-foreground">Décision</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result) => (
                    <tr key={result.subjectId} className="border-b last:border-0">
                      <td className="py-3 px-2 font-medium">{result.subjectName}</td>
                      <td className="py-3 px-2 text-center">
                        {result.ccScore !== null ? result.ccScore.toFixed(1) : '—'}
                      </td>
                      <td className="py-3 px-2 text-center">
                        {result.snScore !== null ? result.snScore.toFixed(1) : '—'}
                      </td>
                      <td className="py-3 px-2 text-center">
                        {result.raScore !== null ? result.raScore.toFixed(1) : '—'}
                      </td>
                      <td className="py-3 px-2 text-center font-bold">
                        {result.finalScore !== null ? result.finalScore.toFixed(2) : '—'}
                      </td>
                      <td className="py-3 px-2 text-center">{result.coefficient}</td>
                      <td className="py-3 px-2 text-center">
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
