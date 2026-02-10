from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from core.models import TimeStampedModel

class Grade(TimeStampedModel):
    """Modèle Grade d'un étudiant pour une évaluation"""
    evaluation = models.ForeignKey(
        'academic.Evaluation',
        on_delete=models.CASCADE,
        related_name='grades'
    )
    etudiant = models.ForeignKey(
        'users.Etudiant',
        on_delete=models.CASCADE,
        related_name='grades'
    )
    grade = models.DecimalField(
        max_digits=4, 
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(20)]
    )
    class StatutEvaluation(models.TextChoices):
        RATTRAPAGE = 'rattrapage', 'Rattrapage'
        VALIDE = 'valide', 'Valide'
        NON_VALIDE = 'non_valide', 'Non Valide'
    
    statut = models.CharField(
        max_length=10,
        choices=StatutEvaluation.choices,
        default=StatutEvaluation.NON_VALIDE
    )
    class Meta:
        verbose_name = "Grade"
        verbose_name_plural = "Grades"
        unique_together = ('evaluation', 'etudiant')
    
    def __str__(self):
        return f"{self.etudiant.user.username} - {self.evaluation.get_type_evaluation()} : {self.grade}/20"

    def calculate_final_grade(self): 
        """Calcule la note finale"""
        grade = self.grade
        cc_grade = grade.filter(evaluation__type_evaluation='CC').first()
        sn_grade = grade.filter(evaluation__type_evaluation='SN').first()
        ra_grade = grade.filter(evaluation__type_evaluation='RA').first()

        final_grade = None

        if cc_grade and sn_grade:
            final_grade = (cc_grade.grade * 0.3) + (sn_grade.grade * 0.7)

            if final_grade < 10 and ra_grade:
                final_grade = ra_grade.grade
        
        return round(final_grade, 2) if final_grade else None
    def get_status(self):
        """Détermine le statut de l'étudiant pour ce cours"""
        final_grade = self.calculate_final_grade()
        
        if final_grade is None:
            self.statut = self.StatutEvaluation.NON_VALIDE
        elif final_grade >= 10:
            self.statut = self.StatutEvaluation.VALIDE
        else:
            self.statut = self.StatutEvaluation.RATTRAPAGE
        self.save()
        return self.statut

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