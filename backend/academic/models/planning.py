from django.db import models
from core.models import TimeStampedModel

class AnneeAcademique(TimeStampedModel):
    """Modèle Année Académique"""
    code = models.CharField(
        max_length=9,
        unique=True,
        help_text="Format: 2023-2024"
    )
    date_debut = models.DateField()
    date_fin = models.DateField()
    
    class StatutAnnee(models.TextChoices):
        EN_PREPARATION = 'preparation', 'En préparation'
        EN_COURS = 'cours', 'En cours'
        TERMINEE = 'terminee', 'Terminée'
        ARCHIVEE = 'archivee', 'Archivée'
    
    statut = models.CharField(
        max_length=12,
        choices=StatutAnnee.choices,
        default=StatutAnnee.EN_PREPARATION
    )
    
    class Meta:
        verbose_name = "Année Académique"
        verbose_name_plural = "Années Académiques"
        ordering = ['-date_debut']
    
    def __str__(self):
        return self.code

class Semestre(TimeStampedModel):
    """Modèle Semestre"""
    annee_academique = models.ForeignKey(
        AnneeAcademique,
        on_delete=models.CASCADE,
        related_name='semestres'
    )
    numero = models.IntegerField(choices=[(1, 'Semestre 1'), (2, 'Semestre 2')])
    date_debut = models.DateField()
    date_fin = models.DateField()
    
    class StatutSemestre(models.TextChoices):
        EN_PREPARATION = 'preparation', 'En préparation'
        EN_COURS = 'cours', 'En cours'
        EVALUATION = 'evaluation', 'Période d\'évaluation'
        TERMINE = 'termine', 'Terminé'
    
    statut = models.CharField(
        max_length=12,
        choices=StatutSemestre.choices,
        default=StatutSemestre.EN_PREPARATION
    )
    
    class Meta:
        verbose_name = "Semestre"
        verbose_name_plural = "Semestres"
        unique_together = ['annee_academique', 'numero']
        ordering = ['annee_academique', 'numero']
    
    def __str__(self):
        return f"{self.annee_academique.code} - S{self.numero}"
