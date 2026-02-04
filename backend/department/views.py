from rest_framework import viewsets
from .models import Departement, Filiere, FiliereUniteEnseignement
from .serializer import DepartmentSerializer, FiliereSerializer, FiliereUniteEnseignementSerializer
from rest_framework.permissions import AllowAny

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Departement.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [AllowAny]

class FiliereViewSet(viewsets.ModelViewSet):
    queryset = Filiere.objects.all()
    serializer_class = FiliereSerializer
    permission_classes = [AllowAny]

class FiliereUniteEnseignementViewSet(viewsets.ModelViewSet):
    queryset = FiliereUniteEnseignement.objects.all()
    serializer_class = FiliereUniteEnseignementSerializer
    permission_classes = [AllowAny]
