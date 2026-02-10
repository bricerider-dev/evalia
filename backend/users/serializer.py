# users/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Etudiant, Enseignant
from department.models import Filiere
from django.contrib.auth import authenticate
User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """Serializer unifié pour User avec correspondance frontend"""
    password = serializers.CharField(write_only=True, min_length=4, required=False)
    firstName = serializers.CharField(source='first_name')
    lastName = serializers.CharField(source='last_name')
    is_active = serializers.BooleanField(default=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'firstName', 'lastName',
            'role', 'phone', 'password', 'is_active', 'createdAt'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
        }
    
    def validate(self, data):
        # Validation de l'email
        email = data.get('email')
        instance = self.instance
        if email:
            existing = User.objects.filter(email=email)
            if instance:
                existing = existing.exclude(pk=instance.pk)
            if existing.exists():
                raise serializers.ValidationError({
                    'email': 'Un utilisateur avec cet email existe déjà.'
                })
        
        # Validation du username
        username = data.get('username')
        if username:
            existing = User.objects.filter(username=username)
            if instance:
                existing = existing.exclude(pk=instance.pk)
            if existing.exists():
                raise serializers.ValidationError({
                    'username': 'Ce nom d\'utilisateur est déjà pris.'
                })
        
        return data

class EtudiantSerializer(serializers.ModelSerializer):
    """Serializer pour Étudiant avec correspondance frontend"""
    user = UserSerializer()
    filiere = serializers.PrimaryKeyRelatedField(queryset=Filiere.objects.all())    
    status = serializers.CharField(source='statut')
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    level = serializers.CharField(source='niveau')

    class Meta:
        model = Etudiant
        fields = [
            'id', 'user', 'filiere', 'status', 'createdAt', 'level','cycle'
        ]
        read_only_fields = ['id', 'createdAt']

    def __init__(self, *args, **kwargs):
        super(EtudiantSerializer, self).__init__(*args, **kwargs)
        # Propager l'instance utilisateur au serializer imbriqué pour la validation d'unicité
        if self.instance and hasattr(self.instance, 'user'):
            self.fields['user'].instance = self.instance.user

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        password = user_data.pop('password', None)
        if not password:
            raise serializers.ValidationError({'password': 'Le mot de passe est obligatoire.'})
        
        # S'assurer que le rôle est étudiant
        user_data['role'] = User.UserType.STUDENT
        user = User.objects.create_user(password=password, **user_data)
            
        etudiant = Etudiant.objects.create(user=user, **validated_data)
        return etudiant

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', None)
        
        # Mettre à jour les données de l'étudiant
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Mettre à jour les données de l'utilisateur si fournies
        if user_data:
            user = instance.user
            # Utiliser le UserSerializer pour valider et mettre à jour
            user_serializer = UserSerializer(user, data=user_data, partial=True)
            if user_serializer.is_valid(raise_exception=True):
                # Ne mettre à jour le mot de passe que s'il est fourni
                password = user_data.pop('password', None)
                user_serializer.save()
                if password:
                    user.set_password(password)
                    user.save()
        
        return instance

class EnseignantSerializer(serializers.ModelSerializer):
    """Serializer pour Enseignant avec correspondance frontend"""
    user = UserSerializer()    
    status = serializers.CharField(source='statut')    
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    
    class Meta:
        model = Enseignant
        fields = [
            'id', 'user', 'grade', 'status', 'createdAt'
        ]
        read_only_fields = ['id', 'createdAt']
    
    def create(self, validated_data):
        user_data = validated_data.pop('user')
        password = user_data.pop('password', None)
        if not password:
            raise serializers.ValidationError({'password': 'Le mot de passe est obligatoire.'})
        
        # S'assurer que le rôle est enseignant
        user_data['role'] = User.UserType.TEACHER
        user = User.objects.create_user(password=password, **user_data)
            
        enseignant = Enseignant.objects.create(user=user, **validated_data)
        return enseignant


class UserLoginSerializer(serializers.Serializer):
    matricule = serializers.CharField(source='username')
    password = serializers.CharField()    
    def validate(self, data):
        user = authenticate(**data)        
        if user and user.is_active:

            return user
        raise serializers.ValidationError("Invalid credentials")


class UserLogoutSerializer(serializers.Serializer):
    pass


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer pour changer le mot de passe"""
    oldPassword = serializers.CharField(required=True)
    newPassword = serializers.CharField(required=True, min_length=8)
    newPasswordConfirm = serializers.CharField(required=True, min_length=8)
    
    def validate(self, data):
        if data['newPassword'] != data['newPasswordConfirm']:
            raise serializers.ValidationError({
                'newPasswordConfirm': 'Les mots de passe ne correspondent pas.'
            })
        return data