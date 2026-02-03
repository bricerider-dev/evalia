from django.db import models
from core.models import TimeStampedModel, UUIDModel

class Notification(TimeStampedModel, UUIDModel):
    """Modèle Notification"""
    destinataire = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    titre = models.CharField(max_length=200)
    message = models.TextField()
    
    class TypeNotification(models.TextChoices):
        NOTE_PUBLIEE = 'note_publiee', 'Note publiée'
        RATTRAPAGE = 'rattrapage', 'Rattrapage programmé'
        DECISION = 'decision', 'Décision publiée'
        INSCRIPTION = 'inscription', 'Inscription validée'
        RAPPEL = 'rappel', 'Rappel important'
        SECURITE = 'securite', 'Alerte sécurité'
        SYSTEME = 'systeme', 'Message système'
    
    type_notification = models.CharField(
        max_length=20,
        choices=TypeNotification.choices,
        default=TypeNotification.SYSTEME
    )
    
    class NiveauNotification(models.TextChoices):
        INFO = 'info', 'Information'
        SUCCES = 'succes', 'Succès'
        AVERTISSEMENT = 'avertissement', 'Avertissement'
        URGENT = 'urgent', 'Urgent'
    
    niveau = models.CharField(
        max_length=15,
        choices=NiveauNotification.choices,
        default=NiveauNotification.INFO
    )
    
    lue = models.BooleanField(default=False)
    date_lecture = models.DateTimeField(null=True, blank=True)
    lien = models.URLField(blank=True, null=True)
    donnees = models.JSONField(
        default=dict,
        blank=True,
        help_text="Données supplémentaires au format JSON"
    )
    
    class Meta:
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['destinataire', 'lue']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.titre} - {self.destinataire}"

class Message(TimeStampedModel, UUIDModel):
    """Modèle Message interne"""
    expediteur = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='messages_envoyes'
    )
    destinataire = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='messages_recus'
    )
    sujet = models.CharField(max_length=200)
    contenu = models.TextField()
    lu = models.BooleanField(default=False)
    date_lecture = models.DateTimeField(null=True, blank=True)
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='reponses'
    )
    est_important = models.BooleanField(default=False)
    est_archive = models.BooleanField(default=False)
    
    class Meta:
        verbose_name = "Message"
        verbose_name_plural = "Messages"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.sujet} - {self.expediteur} → {self.destinataire}"