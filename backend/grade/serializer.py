from rest_framework import serializers
from .models import Note, HistoriqueNote, DecisionFinale


class GradeSerializer(serializers.ModelSerializer):
    """Serializer unifié pour Note/Grade avec correspondance frontend"""
    studentId = serializers.PrimaryKeyRelatedField(source='etudiant', queryset=Note._meta.get_field('etudiant').remote_field.model.objects.all())
    score = serializers.FloatField(source='valeur')
    enteredBy = serializers.PrimaryKeyRelatedField(source='saisie_par', queryset=Note._meta.get_field('saisie_par').remote_field.model.objects.all(), required=False)
    
    # Prise en charge des différents types d'évaluations
    controle_continu = serializers.PrimaryKeyRelatedField(queryset=Note._meta.get_field('controle_continu').remote_field.model.objects.all(), required=False, allow_null=True)
    session_normale = serializers.PrimaryKeyRelatedField(queryset=Note._meta.get_field('session_normale').remote_field.model.objects.all(), required=False, allow_null=True)
    rattrapage = serializers.PrimaryKeyRelatedField(queryset=Note._meta.get_field('rattrapage').remote_field.model.objects.all(), required=False, allow_null=True)

    enteredAt = serializers.DateTimeField(source='date_saisie', read_only=True)
    updatedAt = serializers.DateTimeField(source='date_modification', read_only=True)
    isValidated = serializers.BooleanField(source='est_validee', default=False)
    validationDate = serializers.DateTimeField(source='date_validation', read_only=True)
    evaluationType = serializers.CharField(source='type_note', read_only=True)
    
    class Meta:
        model = Note
        fields = [
            'id', 'studentId', 'score', 'enteredBy', 'enteredAt', 'updatedAt', 
            'isValidated', 'validationDate', 'commentaire', 'evaluationType',
            'controle_continu', 'session_normale', 'rattrapage'
        ]
        read_only_fields = ['id', 'enteredAt', 'updatedAt', 'validationDate', 'evaluationType']


class HistoriqueNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = HistoriqueNote
        fields = '__all__'


class DecisionFinaleSerializer(serializers.ModelSerializer):
    class Meta:
        model = DecisionFinale
        fields = '__all__'