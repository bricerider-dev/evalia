from django.db import models
from core.models import TimeStampedModel

class Evaluation(TimeStampedModel):
    """Modèle abstrait Evaluation"""
    class TypeEvaluation(models.TextChoices):
        CONTROLE_CONTINU = 'CC', 'Contrôle Continu'
        SESSION_NORMALE = 'SN', 'Session Normale'
        RATTRAPAGE = 'RA', 'Rattrapage'
    
    type_evaluation = models.CharField(
        max_length=2,
        choices=TypeEvaluation.choices
    )
    intitule = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    date_evaluation = models.DateField()
    heure_debut = models.TimeField()
    duree = models.IntegerField(
        help_text="Durée en minutes",
        default=120
    )
    coefficient = models.FloatField(
        default=1.0,
        help_text="Coefficient de l'évaluation"
    )
    salle = models.CharField(max_length=50, blank=True, null=True)
    
    class StatutEvaluation(models.TextChoices):
        PLANIFIEE = 'planifiee', 'Planifiée'
        EN_COURS = 'en_cours', 'En cours'
        TERMINEE = 'terminee', 'Terminée'
        ANNULEE = 'annulee', 'Annulée'
    
    statut = models.CharField(
        max_length=10,
        choices=StatutEvaluation.choices,
        default=StatutEvaluation.PLANIFIEE
    )
    
    class Meta:
        abstract = True
        ordering = ['date_evaluation', 'heure_debut']
    
    def __str__(self):
        return f"{self.type_evaluation} - {self.intitule} - {self.date_evaluation}"

class ControleContinu(Evaluation):
    """Modèle Contrôle Continu (30% de la note finale)"""
    matiere = models.ForeignKey(
        'academic.Matiere',
        on_delete=models.CASCADE,
        related_name='controles_continus'  # CHANGÉ
    )
    nombre_activites = models.IntegerField(
        default=3,
        help_text="Nombre d'activités de contrôle continu"
    )
    est_obligatoire = models.BooleanField(default=True)
    
    class TypeCC(models.TextChoices):
        DEVOIR = 'devoir', 'Devoir Surveillé'
        TP = 'tp', 'Travail Pratique'
        PROJET = 'projet', 'Projet'
        ORAL = 'oral', 'Interrogation Orale'
        QCM = 'qcm', 'QCM'
    
    type_cc = models.CharField(
        max_length=10,
        choices=TypeCC.choices,
        default=TypeCC.DEVOIR
    )
    
    class Meta:
        verbose_name = "Contrôle Continu"
        verbose_name_plural = "Contrôles Continus"
    
    def save(self, *args, **kwargs):
        self.type_evaluation = Evaluation.TypeEvaluation.CONTROLE_CONTINU
        self.coefficient = 0.3  # 30% de la note finale
        super().save(*args, **kwargs)

class SessionNormale(Evaluation):
    """Modèle Session Normale (70% de la note finale)"""
    matiere = models.ForeignKey(
        'academic.Matiere',
        on_delete=models.CASCADE,
        related_name='sessions_normales'  # CHANGÉ
    )
    duree_revision = models.IntegerField(
        default=7,
        help_text="Durée de révision en jours avant l'examen"
    )
    
    class TypeExamen(models.TextChoices):
        ECRIT = 'ecrit', 'Examen Écrit'
        ORAL = 'oral', 'Examen Oral'
        PRATIQUE = 'pratique', 'Examen Pratique'
        COMBINE = 'combine', 'Examen Combiné'
    
    type_examen = models.CharField(
        max_length=10,
        choices=TypeExamen.choices,
        default=TypeExamen.ECRIT
    )
    
    class Meta:
        verbose_name = "Session Normale"
        verbose_name_plural = "Sessions Normales"
    
    def save(self, *args, **kwargs):
        self.type_evaluation = Evaluation.TypeEvaluation.SESSION_NORMALE
        self.coefficient = 0.7  # 70% de la note finale
        super().save(*args, **kwargs)

class Rattrapage(Evaluation):
    """Modèle Rattrapage (seulement si note < 10)"""
    matiere = models.ForeignKey(
        'academic.Matiere',
        on_delete=models.CASCADE,
        related_name='rattrapages'  # CHANGÉ
    )
    session_normale = models.ForeignKey(
        'SessionNormale',
        on_delete=models.CASCADE,
        related_name='rattrapages'
    )
    date_limite_inscription = models.DateField()
    frais_rattrapage = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00,
        help_text="Frais de rattrapage en FCFA"
    )
    
    class TypeRattrapage(models.TextChoices):
        ECRIT = 'ecrit', 'Rattrapage Écrit'
        ORAL = 'oral', 'Rattrapage Oral'
        PRATIQUE = 'pratique', 'Rattrapage Pratique'
    
    type_rattrapage = models.CharField(
        max_length=10,
        choices=TypeRattrapage.choices,
        default=TypeRattrapage.ECRIT
    )
    
    class Meta:
        verbose_name = "Rattrapage"
        verbose_name_plural = "Rattrapages"
        unique_together = ['session_normale', 'matiere']
    
    def save(self, *args, **kwargs):
        self.type_evaluation = Evaluation.TypeEvaluation.RATTRAPAGE
        super().save(*args, **kwargs)