# departement/models.py
from django.db import models
from core.models import TimeStampedModel

class Departement(TimeStampedModel):
    """Modèle Département"""
    code = models.CharField(
        max_length=10,
        unique=True,
        help_text="Code unique du département (ex: INFO, MATH)"
    )
    nom = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    directeur = models.ForeignKey(
        'users.Enseignant',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='departements_diriges'
    )
    email = models.EmailField(blank=True, null=True)
    telephone = models.CharField(max_length=15, blank=True, null=True)
    adresse = models.TextField(blank=True, null=True)
    
    class Meta:
        verbose_name = "Département"
        verbose_name_plural = "Départements"
        ordering = ['code']
    
    def __str__(self):
        return f"{self.code} - {self.nom}"

class Filiere(TimeStampedModel):
    """Modèle Filière"""
    departement = models.ForeignKey(
        Departement,
        on_delete=models.CASCADE,
        related_name='filieres'
    )
    code = models.CharField(
        max_length=10,
        unique=True,
        help_text="Code unique de la filière"
    )
    nom = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    duree_annees = models.IntegerField(
        default=3,
        help_text="Durée de la formation en années"
    )
    credit_total = models.IntegerField(
        default=180,
        help_text="Nombre total de crédits nécessaires"
    )
    chef_filiere = models.ForeignKey(
        'users.Enseignant',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='filieres_dirigees'
    )
    date_creation = models.DateField()
    est_actif = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = "Filière"
        verbose_name_plural = "Filières"
        ordering = ['departement', 'code']
        unique_together = ['departement', 'code']
    
    def __str__(self):
        return f"{self.code} - {self.nom}"

# Dans academic/models/matiere.py, ajouter:
# Ajouter cette classe dans academic/models/matiere.py après UniteEnseignement

class FiliereUniteEnseignement(TimeStampedModel):
    """Relation entre Filière et Unité d'Enseignement"""
    filiere = models.ForeignKey(
        'department.Filiere',
        on_delete=models.CASCADE,
        related_name='unites_enseignement_filiere'
    )
    unite_enseignement = models.ForeignKey(
        'academic.UniteEnseignement',
        on_delete=models.CASCADE,
        related_name='filieres_associees'
    )
    
    class Meta:
        unique_together = ['filiere', 'unite_enseignement']
        verbose_name = "Filière - Unité d'Enseignement"
        verbose_name_plural = "Filières - Unités d'Enseignement"
    
    def __str__(self):
        return f"{self.filiere.code} - {self.unite_enseignement.code}"