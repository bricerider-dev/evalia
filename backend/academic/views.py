from rest_framework import viewsets
from academic.models.matiere import  UniteEnseignement
from academic.models.planning import AnneeAcademique, Semestre
from academic.models.evaluation import ControleContinu, SessionNormale, Rattrapage
from academic.serializer import (
     UniteSerialization, 
    AcademicYearSerializer, SemesterSerializer,
    ControleContenuSerializer, NormalSessionSerializer, MakeupSerializer
)

class AcademicYearViewSet(viewsets.ModelViewSet):
    queryset = AnneeAcademique.objects.all()
    serializer_class = AcademicYearSerializer

class SemesterViewSet(viewsets.ModelViewSet):
    queryset = Semestre.objects.all()
    serializer_class = SemesterSerializer

class UniteEnseignementViewSet(viewsets.ModelViewSet):
    queryset = UniteEnseignement.objects.all()
    serializer_class = UniteSerialization

class ControleContinuViewSet(viewsets.ModelViewSet):
    queryset = ControleContinu.objects.all()
    serializer_class = ControleContenuSerializer

class SessionNormaleViewSet(viewsets.ModelViewSet):
    queryset = SessionNormale.objects.all()
    serializer_class = NormalSessionSerializer

class RattrapageViewSet(viewsets.ModelViewSet):
    queryset = Rattrapage.objects.all()
    serializer_class = MakeupSerializer
