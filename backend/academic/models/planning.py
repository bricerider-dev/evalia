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

class Inscription(TimeStampedModel):
    """Modèle Inscription d'un étudiant à une matière"""
    etudiant = models.ForeignKey(
        'users.Etudiant',
        on_delete=models.CASCADE,
        related_name='inscriptions'
    )
    matiere = models.ForeignKey(
        'academic.Matiere',
        on_delete=models.CASCADE,
        related_name='inscriptions'
    )
    semestre = models.ForeignKey(
        Semestre,
        on_delete=models.CASCADE,
        related_name='inscriptions'
    )
    date_inscription = models.DateField(auto_now_add=True)
    
    class StatutInscription(models.TextChoices):
        ACTIVE = 'active', 'Active'
        ABANDON = 'abandon', 'Abandon'
        VALIDEE = 'validee', 'Validée'
        REFUSEE = 'refusee', 'Refusée'
    
    statut = models.CharField(
        max_length=10,
        choices=StatutInscription.choices,
        default=StatutInscription.ACTIVE
    )
    note_finale = models.FloatField(
        null=True,
        blank=True,
        help_text="Note finale calculée"
    )
    decision = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        choices=[
            ('ADMIS', 'Admis'),
            ('RATTRAPAGE', 'Doit passer le rattrapage'),
            ('REDOUBLE', 'Redouble la matière'),
            ('VALIDEE', 'Matière validée'),
        ]
    )
    
    class Meta:
        verbose_name = "Inscription"
        verbose_name_plural = "Inscriptions"
        unique_together = ['etudiant', 'matiere', 'semestre']
        ordering = ['etudiant', 'matiere']
    
    def __str__(self):
        return f"{self.etudiant.matricule} - {self.matiere.nom}"