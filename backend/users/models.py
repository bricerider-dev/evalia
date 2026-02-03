from django.db import models
from core.models import TimeStampedModel, UUIDModel
from django.contrib.auth.models import AbstractUser
# Create your models here.

class User(AbstractUser, TimeStampedModel):
    """Utilisateur personnalisé avec rôles"""
    class UserType(models.TextChoices):
        STUDENT = 'student', 'Étudiant'
        TEACHER = 'teacher', 'Enseignant'
        DEPARTMENT_ADMIN = 'admin', 'Administrateur Département'
        SUPER_ADMIN = 'super_admin', 'Super Administrateur'
    
    role = models.CharField(max_length=20,choices=UserType.choices,default=UserType.STUDENT)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    
    
    # Surcharge des champs par défaut
    username = models.CharField(max_length=150, unique=True)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    
    class Meta:
        verbose_name = "Utilisateur"
        verbose_name_plural = "Utilisateurs"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.role})"
    
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

class Etudiant(TimeStampedModel):
    """Modèle Étudiant"""
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='etudiant_profile'
    )      
    filiere = models.ForeignKey('department.Filiere',on_delete=models.CASCADE,related_name='etudiants')
    date_naissance = models.DateField()
    lieu_naissance = models.CharField(max_length=100)
    nationalite = models.CharField(max_length=50, default="Camerounaise")
    adresse = models.TextField()
    #photo = models.ImageField(upload_to='etudiants/photos/',blank=True,null=True)
    
    class StatutEtudiant(models.TextChoices):
        ACTIF = 'actif', 'Actif'
        SUSPENDU = 'suspendu', 'Suspendu'
        GRADUE = 'gradue', 'Gradué'
        ABANDON = 'abandon', 'Abandon'
    
    statut = models.CharField(max_length=10,choices=StatutEtudiant.choices,default=StatutEtudiant.ACTIF)
    
    class Meta:
        verbose_name = "Étudiant"
        verbose_name_plural = "Étudiants"
        ordering = ['user__username']
    
    def __str__(self):
        return f"{self.user.username} - {self.user.get_full_name()}"

class Enseignant(TimeStampedModel):
    """Modèle Enseignant"""
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='enseignant_profile'
    )
    
    grade = models.CharField(max_length=50,choices=[
            ('PA', 'Professeur Agrégé'),
            ('PH', 'Professeur Hors Classe'),
            ('PC', 'Professeur de Classe'),
            ('MCF', 'Maître de Conférences'),
            ('MC', 'Maître Assistant'),
            ('ASS', 'Assistant'),
            ('VAC', 'Vacataire')
        ]
    )
    
    
    class StatutEnseignant(models.TextChoices):
        ACTIF = 'actif', 'Actif'
        CONGE = 'conge', 'En congé'
        RETRAITE = 'retraite', 'Retraité'
        DETACHE = 'detache', 'Détaché'
    
    statut = models.CharField( max_length=10,choices=StatutEnseignant.choices,default=StatutEnseignant.ACTIF)
    
    class Meta:
        verbose_name = "Enseignant"
        verbose_name_plural = "Enseignants"
        ordering = ['user__last_name']
    
    def __str__(self):
        return f"{self.user.username} - {self.user.get_full_name()}"

