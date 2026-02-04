from rest_framework import serializers
from .models import Departement, Filiere, FiliereUniteEnseignement


class DepartmentSerializer(serializers.ModelSerializer):
    """Serializer pour Département"""
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    
    class Meta:
        model = Departement
        fields = [
            'id', 'code', 'nom', 'description', 'directeur',
            'email', 'telephone', 'adresse', 'createdAt'
        ]
        read_only_fields = ['id', 'createdAt']


class FiliereSerializer(serializers.ModelSerializer):
    """Serializer pour Filière"""
    department = serializers.PrimaryKeyRelatedField(queryset=Departement.objects.all(), source='departement')
    name = serializers.CharField(source='nom')
    code = serializers.CharField()
    description = serializers.CharField()
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    
    class Meta:
        model = Filiere
        fields = [
            'id', 'code', 'name', 'description', 'department',
            'createdAt'
        ]
        read_only_fields = ['id', 'createdAt']

class FiliereUniteEnseignementSerializer(serializers.ModelSerializer):
    """Serializer pour la relation Filière - Unité d'Enseignement"""
    filiereId = serializers.PrimaryKeyRelatedField(source='filiere', queryset=Filiere.objects.all())
    ueId = serializers.PrimaryKeyRelatedField(source='unite_enseignement', queryset=FiliereUniteEnseignement._meta.get_field('unite_enseignement').remote_field.model.objects.all())
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    
    class Meta:
        model = FiliereUniteEnseignement
        fields = ['id', 'filiereId', 'ueId', 'createdAt']
        read_only_fields = ['id', 'createdAt']