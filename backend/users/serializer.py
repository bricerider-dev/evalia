# users/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Etudiant, Enseignant
import re

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'user_type', 'phone', 'password', 'password_confirm',
            'is_active', 'date_joined'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'password_confirm': {'write_only': True},
            'is_active': {'read_only': True},
            'date_joined': {'read_only': True},
        }
    
    def validate(self, data):
        # Validation du mot de passe
        if data.get('password') != data.get('password_confirm'):
            raise serializers.ValidationError({
                'password_confirm': 'Les mots de passe ne correspondent pas.'
            })
        
        # Validation de l'email
        email = data.get('email')
        if email and User.objects.filter(email=email).exists():
            raise serializers.ValidationError({
                'email': 'Un utilisateur avec cet email existe déjà.'
            })
        
        # Validation du username
        username = data.get('username')
        if username and User.objects.filter(username=username).exists():
            raise serializers.ValidationError({
                'username': 'Ce nom d\'utilisateur est déjà pris.'
            })
        
        # Validation du numéro de téléphone
        phone = data.get('phone')
        if phone:
            # Format validation simple
            if not re.match(r'^\+?[0-9\s\-\(\)]{10,}$', phone):
                raise serializers.ValidationError({
                    'phone': 'Format de numéro de téléphone invalide.'
                })
        
        return data
    
    def create(self, validated_data):
        # Retirer les champs qu'on ne passe pas à create_user
        password_confirm = validated_data.pop('password_confirm', None)
        password = validated_data.pop('password')
        
        # S'assurer que user_type est défini
        if 'user_type' not in validated_data:
            validated_data['user_type'] = User.UserType.STUDENT
        
        # Créer l'utilisateur
        user = User.objects.create_user(
            password=password,
            **validated_data
        )
        
        return user
    
    def update(self, instance, validated_data):
        # Gestion de la mise à jour du mot de passe
        password = validated_data.pop('password', None)
        password_confirm = validated_data.pop('password_confirm', None)
        
        if password:
            if password != password_confirm:
                raise serializers.ValidationError({
                    'password_confirm': 'Les mots de passe ne correspondent pas.'
                })
            instance.set_password(password)
        
        # Mettre à jour les autres champs
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance

class EtudiantSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    
    class Meta:
        model = Etudiant
        fields = [
            'id', 'user', 'matricule', 'date_naissance', 'lieu_naissance',
            'nationalite', 'adresse', 'statut', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user_data['user_type'] = User.UserType.STUDENT
        user_serializer = UserSerializer(data=user_data)
        
        if user_serializer.is_valid():
            user = user_serializer.save()
            etudiant = Etudiant.objects.create(user=user, **validated_data)
            return etudiant
        else:
            raise serializers.ValidationError(user_serializer.errors)

class EnseignantSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    
    class Meta:
        model = Enseignant
        fields = [
            'id', 'user', 'matricule', 'grade', 'specialite',
            'date_embauche', 'bureau', 'telephone_bureau', 'statut',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user_data['user_type'] = User.UserType.TEACHER
        user_serializer = UserSerializer(data=user_data)
        
        if user_serializer.is_valid():
            user = user_serializer.save()
            enseignant = Enseignant.objects.create(user=user, **validated_data)
            return enseignant
        else:
            raise serializers.ValidationError(user_serializer.errors)

class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer pour la mise à jour du profil utilisateur"""
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'phone', 'user_type', 'date_joined', 'last_login'
        ]
        read_only_fields = ['user_type', 'date_joined', 'last_login']

class ChangePasswordSerializer(serializers.Serializer):
    """Serializer pour changer le mot de passe"""
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)
    new_password_confirm = serializers.CharField(required=True, min_length=8)
    
    def validate(self, data):
        if data['new_password'] != data['new_password_confirm']:
            raise serializers.ValidationError({
                'new_password_confirm': 'Les mots de passe ne correspondent pas.'
            })
        return data

class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

class UserLogoutSerializer(serializers.Serializer):
    pass