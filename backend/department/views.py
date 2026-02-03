from rest_framework import viewsets
from .models import Departement, Filiere
from .serializer import DepartmentSerializer, FiliereSerializer
from rest_framework.permissions import AllowAny
class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Departement.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [AllowAny]

class FiliereViewSet(viewsets.ModelViewSet):
    queryset = Filiere.objects.all()
    serializer_class = FiliereSerializer
    permission_classes = [AllowAny]
