from rest_framework import serializers
from .models import Note, HistoriqueNote, DecisionFinale


class GradeSerializer(serializers.ModelSerializer):
    """Serializer unifié pour Note/Grade avec correspondance frontend"""
    studentId = serializers.CharField(source='etudiant.id', read_only=True)
    subjectId = serializers.CharField(source='controle_continu.matiere.id', allow_null=True, read_only=True)
    score = serializers.FloatField(source='valeur')
    enteredBy = serializers.CharField(source='saisie_par.id', read_only=True)
    enteredAt = serializers.DateTimeField(source='date_saisie', read_only=True)
    updatedAt = serializers.DateTimeField(source='date_modification', read_only=True)
    isValidated = serializers.BooleanField(source='est_validee')
    validationDate = serializers.DateTimeField(source='date_validation', read_only=True)
    evaluationType = serializers.CharField(source='type_note')
    
    class Meta:
        model = Note
        fields = [
            'id', 'studentId', 'subjectId', 'evaluationType', 'score',
            'enteredBy', 'enteredAt', 'updatedAt', 'isValidated',
            'validationDate', 'commentaire'
        ]
        read_only_fields = ['id', 'enteredAt', 'updatedAt', 'validationDate']


class HistoriqueNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = HistoriqueNote
        fields = '__all__'


class DecisionFinaleSerializer(serializers.ModelSerializer):
    class Meta:
        model = DecisionFinale
        fields = '__all__'