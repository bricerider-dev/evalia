from rest_framework import viewsets
from .models import Note, HistoriqueNote, DecisionFinale
from .serializer import GradeSerializer, HistoriqueNoteSerializer, DecisionFinaleSerializer

class NoteViewSet(viewsets.ModelViewSet):
    queryset = Note.objects.all()
    serializer_class = GradeSerializer
    
class HistoriqueNoteViewSet(viewsets.ModelViewSet):
    queryset = HistoriqueNote.objects.all()
    serializer_class = HistoriqueNoteSerializer

class DecisionFinaleViewSet(viewsets.ModelViewSet):
    queryset = DecisionFinale.objects.all()
    serializer_class = DecisionFinaleSerializer