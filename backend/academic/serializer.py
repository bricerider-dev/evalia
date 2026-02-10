from rest_framework import serializers
from academic.models.matiere import UniteEnseignement
from academic.models.planning import AnneeAcademique, Semestre
from academic.models.evaluation import Evaluation



class UniteSerialization(serializers.ModelSerializer):
    """Serializer pour Unité d'Enseignement"""
    name = serializers.CharField(source='nom')
    level = serializers.IntegerField(source='niveau')
    semester = serializers.IntegerField(source='semestre')    
    filiere = serializers.PrimaryKeyRelatedField(
        queryset=UniteEnseignement._meta.get_field('filiere').remote_field.model.objects.all(),
        required=False,
        allow_null=True
    )
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)    
    class Meta:
        model = UniteEnseignement
        fields = [
            'id', 'code', 'name', 'description', 'level', 'semester',
            'credit', 'filiere', 'createdAt', 'enseignant'
        ]
        read_only_fields = ['id', 'createdAt']


class AcademicYearSerializer(serializers.ModelSerializer):
    """Serializer pour Année Académique"""
    code = serializers.CharField()
    startDate = serializers.DateField(source='date_debut')
    endDate = serializers.DateField(source='date_fin')
    academicStatus = serializers.CharField(source='statut')
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    
    class Meta:
        model = AnneeAcademique
        fields = [
            'id', 'code', 'startDate', 'endDate', 'academicStatus', 'createdAt'
        ]
        read_only_fields = ['id', 'createdAt']


class SemesterSerializer(serializers.ModelSerializer):
    """Serializer pour Semestre"""
    academicYearId = serializers.PrimaryKeyRelatedField(
        source='annee_academique',
        queryset=AnneeAcademique.objects.all()
    )
    number = serializers.IntegerField(source='numero')
    startDate = serializers.DateField(source='date_debut')
    endDate = serializers.DateField(source='date_fin')
    semesterStatus = serializers.CharField(source='statut')
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    
    class Meta:
        model = Semestre
        fields = [
            'id', 'academicYearId', 'number', 'startDate', 'endDate',
            'semesterStatus', 'createdAt'
        ]
        read_only_fields = ['id', 'createdAt']


class EvaluationSerializer(serializers.ModelSerializer):
    """Base model serializer for common evaluation fields"""
    subjectId = serializers.PrimaryKeyRelatedField(
        source='ue', 
        queryset=UniteEnseignement.objects.all()
    )
    title = serializers.CharField(source='intitule')
    evaluationDate = serializers.DateField(source='date_evaluation')
    startTime = serializers.TimeField(source='heure_debut')
    endTime = serializers.TimeField(source='heure_fin', default="12:00")
    room = serializers.CharField(source='salle', allow_blank=True, required=False)
    evaluationStatus = serializers.CharField(source='statut_time', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    evaluationType = serializers.CharField(source='type_evaluation')

    def to_representation(self, instance):
        from django.utils import timezone
        from datetime import datetime
        
        data = super().to_representation(instance)
        
        if instance.date_evaluation and instance.heure_fin:
            eval_end = timezone.make_aware(datetime.combine(instance.date_evaluation, instance.heure_fin))
            if timezone.now() > eval_end:
                data['evaluationStatus'] = 'TERMINE'
                
        return data
    

    class Meta:
        model = Evaluation
        fields = [
            'id', 'subjectId', 'title', 'description', 'evaluationDate',
            'startTime', 'endTime', 'room', 'evaluationStatus',
            'createdAt', 'evaluationType'
        ]
        read_only_fields = ['id', 'createdAt', 'evaluationStatus']


