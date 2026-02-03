import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getSubjectsByFiliere, getFilieres } from '@/lib/storage';
import { getSubjectResultForStudent, calculateWeightedAverage, getMention } from '@/lib/gradeCalculator';
import { Student, SubjectResult } from '@/lib/types';
import { FileText, Download, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function StudentGradesPage() {
  const { user } = useAuth();
  const [results, setResults] = useState<SubjectResult[]>([]);
  const [average, setAverage] = useState<number | null>(null);
  const [filiereName, setFiliereName] = useState('');

  useEffect(() => {
    if (user && 'filiere' in user) {
      const student = user as unknown as Student;
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

  const getScoreColor = (score: number | null) => {
    if (score === null) return '';
    if (score >= 14) return 'text-green-600 font-bold';
    if (score >= 10) return 'text-foreground';
    return 'text-red-600';
  };

  return (
    <DashboardLayout>
      <div className="space-y-5 animate-fade-in-up">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Mes Notes</h2>
            <p className="text-sm text-muted-foreground">
              {filiereName} • Année universitaire 2024-2025
            </p>
          </div>
        </div>

        {/* Summary Card */}
        <Card className="gradient-institutional text-primary-foreground border-0 shadow-lg">
          <CardContent className="py-4 px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-full bg-accent/20">
                  <Award className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-primary-foreground/80 text-xs">Moyenne Générale</p>
                  <p className="text-2xl font-black">
                    {average !== null ? average.toFixed(2) : '—'} / 20
                  </p>
                  <p className="text-primary-foreground/70 text-xs mt-0.5">
                    {average !== null ? getMention(average) : 'En attente de notes'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-primary-foreground/80 text-xs">Matières validées</p>
                <p className="text-2xl font-black">
                  {results.filter((r) => r.decision === 'Validé').length} / {results.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grades Table */}
        <Card>
          <CardHeader className="py-4 px-6">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" />
              Détail des Notes
            </CardTitle>
            <CardDescription className="text-xs">
              Formule: Note Finale = (CC × 30%) + (SN × 70%)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucune note disponible pour le moment.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-2.5 px-4 font-black uppercase text-[10px] tracking-wider text-primary">Matière</th>
                      <th className="text-center py-2.5 px-4 font-black uppercase text-[10px] tracking-wider text-primary">
                        <div>CC</div>
                        <div className="text-[9px] font-normal text-muted-foreground">(30%)</div>
                      </th>
                      <th className="text-center py-2.5 px-4 font-black uppercase text-[10px] tracking-wider text-primary">
                        <div>SN</div>
                        <div className="text-[9px] font-normal text-muted-foreground">(70%)</div>
                      </th>
                      <th className="text-center py-2.5 px-4 font-black uppercase text-[10px] tracking-wider text-primary">
                        <div>RA</div>
                        <div className="text-[9px] font-normal text-muted-foreground">(ratt.)</div>
                      </th>
                      <th className="text-center py-2.5 px-4 font-black uppercase text-[10px] tracking-wider text-primary">Final</th>
                      <th className="text-center py-2.5 px-4 font-black uppercase text-[10px] tracking-wider text-primary">Coef.</th>
                      <th className="text-center py-2.5 px-4 font-black uppercase text-[10px] tracking-wider text-primary">Décision</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result) => (
                      <tr key={result.subjectId} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="py-2.5 px-4 font-bold text-sm">{result.subjectName}</td>
                        <td className="py-2.5 px-4 text-center text-sm">
                          <span className={getScoreColor(result.ccScore)}>
                            {result.ccScore !== null ? result.ccScore.toFixed(1) : '—'}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-center text-sm">
                          <span className={getScoreColor(result.snScore)}>
                            {result.snScore !== null ? result.snScore.toFixed(1) : '—'}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-center text-sm">
                          <span className={getScoreColor(result.raScore)}>
                            {result.raScore !== null ? result.raScore.toFixed(1) : '—'}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <span className={`text-base font-black ${getScoreColor(result.finalScore)}`}>
                            {result.finalScore !== null ? result.finalScore.toFixed(2) : '—'}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <Badge variant="outline" className="text-[10px] font-bold h-5 px-1.5">{result.coefficient}</Badge>
                        </td>
                        <td className="py-2.5 px-4 text-center">
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

        {/* Legend */}
        <Card>
          <CardContent className="py-3 px-6">
            <div className="flex flex-wrap gap-4 text-[10px] font-bold uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Validé (≥10)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span>Rattrapage (&lt;10, en attente)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>Non Validé</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
