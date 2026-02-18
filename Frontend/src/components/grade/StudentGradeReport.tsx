import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getStudentGradeReport } from '@/api/grade';
import { AlertCircle, CheckCircle2, BookOpen } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface StudentGradeReportProps {
  studentId: string | number;
  isLoading?: boolean;
}

export function StudentGradeReport({ studentId, isLoading: externalLoading }: StudentGradeReportProps) {
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReport = async () => {
      if (!studentId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await getStudentGradeReport(studentId);
        setReport(data);
      } catch (err) {
        setError('Impossible de charger le rapport de notes');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadReport();
  }, [studentId]);

  if (isLoading || externalLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-96 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error || !report) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error || 'Aucune donnée disponible'}</AlertDescription>
      </Alert>
    );
  }

  const getStatusColor = (status: string) => {
    if (status === 'Valide' || status === 'Admis') return 'bg-green-100 text-green-800';
    if (status === 'Non Valide' || status === 'Ajourné') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Student Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {report.student.nom}
          </CardTitle>
          <CardDescription>
            Matricule: <span className="font-mono">{report.student.matricule}</span>
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{report.overall_average}</div>
              <p className="text-sm text-muted-foreground">Moyenne Générale</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{report.passed_courses}</div>
              <p className="text-sm text-muted-foreground">Matières Validées</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{report.total_courses}</div>
              <p className="text-sm text-muted-foreground">Total Matières</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Badge className={getStatusColor(report.overall_status)}>
                {report.overall_status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses Details */}
      <Card>
        <CardHeader>
          <CardTitle>Détail des Notes par Matière</CardTitle>
          <CardDescription>{report.courses.length} matière(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {report.courses.map((course: any, idx: number) => (
              <div
                key={idx}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{course.ue.nom}</h4>
                    <p className="text-sm text-muted-foreground">
                      Code: {course.ue.code} • Crédit: {course.ue.credit}
                    </p>
                  </div>
                  <Badge className={getStatusColor(course.status)}>
                    {course.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">CC (30%)</p>
                    <p className="font-semibold">{course.cc !== null ? course.cc.toFixed(2) : '-'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">SN (70%)</p>
                    <p className="font-semibold">{course.sn !== null ? course.sn.toFixed(2) : '-'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Rattrapage</p>
                    <p className="font-semibold">{course.ra !== null ? course.ra.toFixed(2) : '-'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Finale</p>
                    <p className="font-semibold text-lg">
                      {course.final !== null ? course.final.toFixed(2) : '-'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="text-xs text-muted-foreground text-center">
        Généré le: {new Date(report.generated_at).toLocaleDateString('fr-FR')}
      </div>
    </div>
  );
}
