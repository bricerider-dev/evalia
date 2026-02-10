from rest_framework import viewsets
from academic.models.matiere import  UniteEnseignement
from academic.models.evaluation import Evaluation
from academic.models.planning import AnneeAcademique, Semestre
from academic.serializer import (
     UniteSerialization, 
    AcademicYearSerializer, SemesterSerializer,EvaluationSerializer
)

class EvaluationViewSet(viewsets.ModelViewSet):
    queryset = Evaluation.objects.all()
    serializer_class = EvaluationSerializer

class AcademicYearViewSet(viewsets.ModelViewSet):
    queryset = AnneeAcademique.objects.all()
    serializer_class = AcademicYearSerializer

class SemesterViewSet(viewsets.ModelViewSet):
    queryset = Semestre.objects.all()
    serializer_class = SemesterSerializer

class UniteEnseignementViewSet(viewsets.ModelViewSet):
    queryset = UniteEnseignement.objects.all()
    serializer_class = UniteSerialization
