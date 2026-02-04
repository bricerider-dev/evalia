from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from core.models import TimeStampedModel

class Note(TimeStampedModel):
    """Modèle Note d'un étudiant pour une évaluation"""
    
    class TypeNote(models.TextChoices):
        CC = 'CC', 'Contrôle Continu'
        SN = 'SN', 'Session Normale'
        RA = 'RA', 'Rattrapage'
    
    type_note = models.CharField(
        max_length=2,
        choices=TypeNote.choices
    )
    
    # Relations séparées pour chaque type d'évaluation
    controle_continu = models.ForeignKey(
        'academic.ControleContinu',
        on_delete=models.CASCADE,
        related_name='notes',
        null=True,
        blank=True
    )
    session_normale = models.ForeignKey(
        'academic.SessionNormale',
        on_delete=models.CASCADE,
        related_name='notes',
        null=True,
        blank=True
    )
    rattrapage = models.ForeignKey(
        'academic.Rattrapage',
        on_delete=models.CASCADE,
        related_name='notes',
        null=True,
        blank=True
    )
    
    etudiant = models.ForeignKey(
        'users.Etudiant',
        on_delete=models.CASCADE,
        related_name='notes'
    )
    valeur = models.FloatField(
        validators=[
            MinValueValidator(0.0),
            MaxValueValidator(20.0)
        ],
        help_text="Note sur 20"
    )
    saisie_par = models.ForeignKey(
        'users.Enseignant',
        on_delete=models.SET_NULL,
        null=True,
        related_name='notes_saisies'
    )
    date_saisie = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)
    commentaire = models.TextField(blank=True, null=True)
    est_validee = models.BooleanField(
        default=False,
        help_text="La note a été validée par le responsable"
    )
    date_validation = models.DateTimeField(null=True, blank=True)
    validee_par = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='notes_validees'
    )
    
    class Meta:
        verbose_name = "Note"
        verbose_name_plural = "Notes"
        # Contraintes uniques selon le type de note
        constraints = [
            models.UniqueConstraint(
                fields=['controle_continu', 'etudiant'],
                condition=models.Q(controle_continu__isnull=False),
                name='unique_note_cc'
            ),
            models.UniqueConstraint(
                fields=['session_normale', 'etudiant'],
                condition=models.Q(session_normale__isnull=False),
                name='unique_note_sn'
            ),
            models.UniqueConstraint(
                fields=['rattrapage', 'etudiant'],
                condition=models.Q(rattrapage__isnull=False),
                name='unique_note_ra'
            ),
        ]
        ordering = ['-date_saisie']
    
    def __str__(self):
        matiere = self.get_matiere()
        return f"{self.etudiant.matricule} - {matiere} - {self.valeur}/20"
    
    def get_matiere(self):
        """Retourne la matière associée à la note"""
        if self.controle_continu:
            return self.controle_continu.matiere
        elif self.session_normale:
            return self.session_normale.matiere
        elif self.rattrapage:
            return self.rattrapage.matiere
        return None
    
    def save(self, *args, **kwargs):
        # Validation: une note doit avoir exactement un type d'évaluation
        types = [self.controle_continu, self.session_normale, self.rattrapage]
        if sum(1 for t in types if t is not None) != 1:
            raise ValueError("Une note doit être associée à exactement un type d'évaluation")
        
        # Déterminer le type de note automatiquement
        if self.controle_continu:
            self.type_note = self.TypeNote.CC
        elif self.session_normale:
            self.type_note = self.TypeNote.SN
        elif self.rattrapage:
            self.type_note = self.TypeNote.RA
        
        super().save(*args, **kwargs)

class HistoriqueNote(TimeStampedModel):
    """Modèle Historique des modifications de notes"""
    note = models.ForeignKey(
        Note,
        on_delete=models.CASCADE,
        related_name='historique'
    )
    ancienne_valeur = models.FloatField()
    nouvelle_valeur = models.FloatField()
    modifie_par = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True
    )
    raison = models.TextField()
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    class Meta:
        verbose_name = "Historique Note"
        verbose_name_plural = "Historiques Notes"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Modification note {self.note.id}"

class DecisionFinale(TimeStampedModel):
    """Modèle Décision finale pour un étudiant dans une matière"""
    note_cc = models.FloatField(
        null=True,
        blank=True,
        help_text="Note de contrôle continu (30%)"
    )
    note_sn = models.FloatField(
        null=True,
        blank=True,
        help_text="Note de session normale (70%)"
    )
    note_ra = models.FloatField(
        null=True,
        blank=True,
        help_text="Note de rattrapage si applicable"
    )
    note_finale = models.FloatField(
        validators=[
            MinValueValidator(0.0),
            MaxValueValidator(20.0)
        ]
    )
    
    class Decision(models.TextChoices):
        ADMIS = 'admis', 'Admis'
        RATTRAPAGE = 'rattrapage', 'Doit passer le rattrapage'
        ADMIS_RATTRAPAGE = 'admis_ra', 'Admis après rattrapage'
        REDOUBLE = 'redouble', 'Redouble la matière'
        VALIDE = 'valide', 'Matière validée'
    
    decision = models.CharField(
        max_length=15,
        choices=Decision.choices
    )
    
    class Mention(models.TextChoices):
        TRES_BIEN = 'TB', 'Très Bien'
        BIEN = 'B', 'Bien'
        ASSEZ_BIEN = 'AB', 'Assez Bien'
        PASSABLE = 'P', 'Passable'
        INSUFFISANT = 'I', 'Insuffisant'
    
    mention = models.CharField(
        max_length=2,
        choices=Mention.choices,
        blank=True,
        null=True
    )
    
    date_decision = models.DateField(auto_now_add=True)
    prise_par = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='decisions_prises'
    )
    commentaire = models.TextField(blank=True, null=True)
    
    class Meta:
        verbose_name = "Décision Finale"
        verbose_name_plural = "Décisions Finales"
        ordering = ['-date_decision']
    
    def __str__(self):
        return f"{self.inscription.etudiant.matricule} - {self.decision}"
    
    def calculer_note_finale(self):
        """Calcule la note finale selon la formule"""
        if self.note_cc is None or self.note_sn is None:
            return None
        
        note_finale = (self.note_cc * 0.3) + (self.note_sn * 0.7)
        
        # Si rattrapage et note après rattrapage > note session normale
        if self.note_ra is not None:
            note_finale = max(self.note_sn, self.note_ra)
        
        return round(note_finale, 2)
    
    def determiner_decision(self):
        """Détermine la décision finale"""
        if self.note_finale is None:
            return None
        
        if self.note_finale >= 10:
            if self.note_ra is not None:
                return self.Decision.ADMIS_RATTRAPAGE
            return self.Decision.ADMIS
        elif self.note_finale >= 7:
            return self.Decision.RATTRAPAGE
        else:
            return self.Decision.REDOUBLE
    
    def determiner_mention(self):
        """Détermine la mention selon la note finale"""
        if self.note_finale is None:
            return None
        
        if self.note_finale >= 16:
            return self.Mention.TRES_BIEN
        elif self.note_finale >= 14:
            return self.Mention.BIEN
        elif self.note_finale >= 12:
            return self.Mention.ASSEZ_BIEN
        elif self.note_finale >= 10:
            return self.Mention.PASSABLE
        else:
            return self.Mention.INSUFFISANT