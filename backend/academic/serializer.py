# FICHIER 4: backend/academic/serializers.py - NOUVEAU
from rest_framework import serializers
from academic.models.matiere import Matiere, UniteEnseignement
from academic.models.planning import AnneeAcademique, Semestre, Inscription
from academic.models.evaluation import ControleContinu, SessionNormale, Rattrapage


class SubjectSerializer(serializers.ModelSerializer):
    """Serializer pour Matière/Subject"""
    name = serializers.CharField(source='nom')
    uniteEnseignementId = serializers.CharField(source='unite_enseignement.id')
    responsibleTeacherId = serializers.CharField(source='responsable.id', allow_null=True)
    typeSubject = serializers.CharField(source='type_matiere')
    semester = serializers.IntegerField(source='unite_enseignement.semestre')
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    
    class Meta:
        model = Matiere
        fields = [
            'id', 'code', 'name', 'description', 'uniteEnseignementId',
            'volumeHoraire', 'credit', 'coefficient', 'responsibleTeacherId',
            'typeSubject', 'semester', 'createdAt'
        ]
        read_only_fields = ['id', 'createdAt']


class UniteSerialization(serializers.ModelSerializer):
    """Serializer pour Unité d'Enseignement"""
    name = serializers.CharField(source='nom')
    level = serializers.IntegerField(source='niveau')
    semester = serializers.IntegerField(source='semestre')
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    
    class Meta:
        model = UniteEnseignement
        fields = [
            'id', 'code', 'name', 'description', 'level', 'semester',
            'credit', 'createdAt'
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
    academicYearId = serializers.CharField(source='annee_academique.id')
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


class EnrollmentSerializer(serializers.ModelSerializer):
    """Serializer pour Inscription"""
    studentId = serializers.CharField(source='etudiant.id')
    subjectId = serializers.CharField(source='matiere.id')
    semesterId = serializers.CharField(source='semestre.id')
    enrollmentDate = serializers.DateField(source='date_inscription', read_only=True)
    enrollmentStatus = serializers.CharField(source='statut')
    finalGrade = serializers.FloatField(source='note_finale', allow_null=True)
    juryDecision = serializers.CharField(source='decision', allow_null=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    
    class Meta:
        model = Inscription
        fields = [
            'id', 'studentId', 'subjectId', 'semesterId', 'enrollmentDate',
            'enrollmentStatus', 'finalGrade', 'juryDecision', 'createdAt'
        ]
        read_only_fields = ['id', 'enrollmentDate', 'createdAt']


class EvaluationSerializer(serializers.ModelSerializer):
    """Serializer pour les évaluations (CC, SN, RA)"""
    subjectId = serializers.CharField(source='matiere.id')
    title = serializers.CharField(source='intitule')
    evaluationDate = serializers.DateField(source='date_evaluation')
    startTime = serializers.TimeField(source='heure_debut')
    duration = serializers.IntegerField()  # en minutes
    coefficient = serializers.FloatField()
    room = serializers.CharField(source='salle', allow_blank=True)
    evaluationStatus = serializers.CharField(source='statut')
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    
    class Meta:
        fields = [
            'id', 'subjectId', 'title', 'description', 'evaluationDate',
            'startTime', 'duration', 'coefficient', 'room', 'evaluationStatus',
            'createdAt'
        ]
        read_only_fields = ['id', 'createdAt']


class ControleContenuSerializer(EvaluationSerializer):
    """Serializer pour Contrôle Continu"""
    numberOfActivities = serializers.IntegerField(source='nombre_activites')
    isMandatory = serializers.BooleanField(source='est_obligatoire')
    ccType = serializers.CharField(source='type_cc')
    
    class Meta(EvaluationSerializer.Meta):
        model = ControleContinu
        fields = EvaluationSerializer.Meta.fields + [
            'numberOfActivities', 'isMandatory', 'ccType'
        ]


class NormalSessionSerializer(EvaluationSerializer):
    """Serializer pour Session Normale"""
    revisionsDay = serializers.IntegerField(source='duree_revision')
    examType = serializers.CharField(source='type_examen')
    
    class Meta(EvaluationSerializer.Meta):
        model = SessionNormale
        fields = EvaluationSerializer.Meta.fields + [
            'revisionsDay', 'examType'
        ]


class MakeupSerializer(EvaluationSerializer):
    """Serializer pour Rattrapage"""
    registrationDeadline = serializers.DateField(source='date_limite_inscription')
    makeupFees = serializers.DecimalField(
        source='frais_rattrapage', max_digits=10, decimal_places=2
    )
    makeupType = serializers.CharField(source='type_rattrapage')
    
    class Meta(EvaluationSerializer.Meta):
        model = Rattrapage
        fields = EvaluationSerializer.Meta.fields + [
            'registrationDeadline', 'makeupFees', 'makeupType'
        ]