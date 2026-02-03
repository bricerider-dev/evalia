# FICHIER 3: backend/department/serializer.py - NOUVEAU
from rest_framework import serializers
from .models import Departement, Filiere


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