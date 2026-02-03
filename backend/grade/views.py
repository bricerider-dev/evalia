from rest_framework import viewsets
from .models import Note, HistoriqueNote, DecisionFinale
from .serializer import NoteSerializer, HistoriqueNoteSerializer, DecisionFinaleSerializer

class NoteViewSet(viewsets.ModelViewSet):
    queryset = Note.objects.all()
    serializer_class = NoteSerializer

class HistoriqueNoteViewSet(viewsets.ModelViewSet):
    queryset = HistoriqueNote.objects.all()
    serializer_class = HistoriqueNoteSerializer

class DecisionFinaleViewSet(viewsets.ModelViewSet):
    queryset = DecisionFinale.objects.all()
    serializer_class = DecisionFinaleSerializer