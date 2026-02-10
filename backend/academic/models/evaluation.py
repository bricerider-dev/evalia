from django.db import models
from core.models import TimeStampedModel

class Evaluation(TimeStampedModel):
    """Modèle abstrait Evaluation"""
    ue = models.ForeignKey(
        'academic.UniteEnseignement',
        on_delete=models.CASCADE,
        related_name='evaluations'
    )
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
    heure_fin = models.TimeField(default="12:00")  # Corrigé : remplacé duree par heure_fin
    salle = models.CharField(max_length=50, blank=True, null=True)
 

    class StatutTime(models.TextChoices):
        PLANIFIEE = 'planifiee', 'Planifiée'
        EN_COURS = 'en_cours', 'En cours'
        TERMINEE = 'terminee', 'Terminée'
        ANNULEE = 'annulee', 'Annulée'
    
    statut_time = models.CharField(
        max_length=10,
        choices=StatutTime.choices,
        default=StatutTime.PLANIFIEE
    )


    def get_status(self):
        return self.statut

    def get_type_evaluation(self):
        return self.type_evaluation
        
    class Meta:        
        ordering = ['date_evaluation', 'heure_debut']
    
    def __str__(self):
        return f"{self.type_evaluation} - {self.intitule} - {self.date_evaluation}"

