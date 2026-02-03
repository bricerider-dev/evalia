from rest_framework import serializers
from .models import Note, HistoriqueNote, DecisionFinale

class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = '__all__'

class HistoriqueNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = HistoriqueNote
        fields = '__all__'

class DecisionFinaleSerializer(serializers.ModelSerializer):
    class Meta:
        model = DecisionFinale
        fields = '__all__'