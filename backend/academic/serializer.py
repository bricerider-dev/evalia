# FICHIER 4: backend/academic/serializers.py - NOUVEAU
from rest_framework import serializers
from academic.models.matiere import UniteEnseignement
from academic.models.planning import AnneeAcademique, Semestre
from academic.models.evaluation import ControleContinu, SessionNormale, Rattrapage


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
            'credit', 'filiere', 'createdAt'
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
    evaluationStatus = serializers.CharField(source='statut', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        fields = [
            'id', 'subjectId', 'title', 'description', 'evaluationDate',
            'startTime', 'endTime', 'room', 'coefficient', 'evaluationStatus',
            'createdAt'
        ]
        read_only_fields = ['id', 'createdAt', 'evaluationStatus']


class ControleContenuSerializer(EvaluationSerializer):
    """Serializer pour Contrôle Continu"""
    numberOfActivities = serializers.IntegerField(source='nombre_activites', required=False)
    ccType = serializers.CharField(source='type_cc')
    
    class Meta(EvaluationSerializer.Meta):
        model = ControleContinu
        fields = EvaluationSerializer.Meta.fields + [
            'numberOfActivities', 'ccType'
        ]


class NormalSessionSerializer(EvaluationSerializer):
    """Serializer pour Session Normale"""
    revisionsDay = serializers.IntegerField(source='duree_revision', required=False)
    examType = serializers.CharField(source='type_examen')
    
    class Meta(EvaluationSerializer.Meta):
        model = SessionNormale
        fields = EvaluationSerializer.Meta.fields + [
            'revisionsDay', 'examType'
        ]


class MakeupSerializer(EvaluationSerializer):
    """Serializer pour Rattrapage"""
    normalSessionId = serializers.PrimaryKeyRelatedField(
        source='session_normale', 
        queryset=SessionNormale.objects.all()
    )
    
    class Meta(EvaluationSerializer.Meta):
        model = Rattrapage
        fields = EvaluationSerializer.Meta.fields + [
            'normalSessionId'
        ]
