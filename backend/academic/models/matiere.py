from django.db import models
from core.models import TimeStampedModel

class UniteEnseignement(TimeStampedModel):
    """Modèle Unité d'Enseignement (UE)"""
    code = models.CharField(max_length=10, unique=True)
    nom = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    # Removed IntegerField for semestre; only ForeignKey remains
    enseignant = models.ForeignKey(
        'users.Enseignant',
        on_delete=models.CASCADE,
        related_name='enseignements',
        default=None,
        null=True,
        blank=True
    )
    niveau = models.IntegerField(
        choices=[(1, 'Niveau 1'), (2, 'Niveau 2'), (3, 'Niveau 3')]
    )
    credit = models.IntegerField(default=6)
    filiere = models.ForeignKey(
        'department.Filiere',
        on_delete=models.CASCADE,
        related_name='unites_enseignement',
        default=None,
        null=True,
        blank=True
    )
    
    semestre = models.ForeignKey(
        'academic.Semestre',
        on_delete=models.CASCADE,
        related_name='unites_enseignement',
        null=True,
        blank=True
    )
    class Meta:
        verbose_name = "Unité d'Enseignement"
        verbose_name_plural = "Unités d'Enseignement"
        ordering = ['niveau', 'semestre', 'code']
    
    def __str__(self):
        return f"{self.code} - {self.nom}"
