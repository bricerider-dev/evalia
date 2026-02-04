from rest_framework import viewsets
from academic.models.matiere import  UniteEnseignement
from academic.models.evaluation import ControleContinu, SessionNormale, Rattrapage
from academic.serializer import (
     UniteSerialization, 
    ControleContenuSerializer, NormalSessionSerializer, MakeupSerializer
)



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
