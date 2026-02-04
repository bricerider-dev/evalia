from django.db import models
from core.models import TimeStampedModel

class UniteEnseignement(TimeStampedModel):
    """Modèle Unité d'Enseignement (UE)"""
    code = models.CharField(max_length=10, unique=True)
    nom = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    semestre = models.IntegerField(
        choices=[(1, 'Semestre 1'), (2, 'Semestre 2')]
    )
    niveau = models.IntegerField(
        choices=[(1, 'Niveau 1'), (2, 'Niveau 2'), (3, 'Niveau 3')]
    )
    credit = models.IntegerField(default=6)
    filiere = models.ForeignKey(
        'department.Filiere',
        on_delete=models.CASCADE,
        related_name='unites_enseignement'
    )
    
    class Meta:
        verbose_name = "Unité d'Enseignement"
        verbose_name_plural = "Unités d'Enseignement"
        ordering = ['niveau', 'semestre', 'code']
    
    def __str__(self):
        return f"{self.code} - {self.nom}"

class Matiere(TimeStampedModel):
    """Modèle Matière"""
    unite_enseignement = models.ForeignKey(
        UniteEnseignement,
        on_delete=models.CASCADE,
        related_name='matieres'
    )
    code = models.CharField(max_length=10)
    nom = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    volume_horaire = models.IntegerField(
        help_text="Volume horaire total en heures"
    )
    credit = models.IntegerField(default=3)
    coefficient = models.IntegerField(default=1)
    enseignants = models.ManyToManyField(
        'users.Enseignant',
        related_name='matieres_enseignees',
        blank=True
    )
    responsable = models.ForeignKey(
        'users.Enseignant',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='matieres_responsables'
    )
    
    class TypeMatiere(models.TextChoices):
        FONDAMENTALE = 'fond', 'Fondamentale'
        METHODOLOGIQUE = 'meth', 'Méthodologique'
        TRANSVERSALE = 'trans', 'Transversale'
        OPTIONNELLE = 'opt', 'Optionnelle'
    
    type_matiere = models.CharField(
        max_length=10,
        choices=TypeMatiere.choices,
        default=TypeMatiere.FONDAMENTALE
    )
    
    class Meta:
        verbose_name = "Matière"
        verbose_name_plural = "Matières"
        ordering = ['unite_enseignement', 'code']
        unique_together = ['unite_enseignement', 'code']
    
    def __str__(self):
        return f"{self.code} - {self.nom}"