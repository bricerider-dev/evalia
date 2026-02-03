from django.db import models
import uuid

# Create your models here.
class TimeStampedModel(models.Model):
    """Modèle abstrait avec dates de création et modification"""
    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        abstract = True

class UUIDModel(models.Model):
    """Modèle abstrait avec UUID comme clé primaire"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    class Meta:
        abstract = True