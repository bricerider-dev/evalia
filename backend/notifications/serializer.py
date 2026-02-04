from rest_framework import serializers
from notifications.models import Notification, Message

class NotificationSerializer(serializers.ModelSerializer):
    """Serializer pour les Notifications"""
    destinataireId = serializers.PrimaryKeyRelatedField(source='destinataire', queryset=Notification._meta.get_field('destinataire').remote_field.model.objects.all())
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    
    class Meta:
        model = Notification
        fields = [
            'id', 'destinataireId', 'titre', 'message', 'type_notification',
            'niveau', 'lue', 'date_lecture', 'lien', 'donnees', 'createdAt'
        ]
        read_only_fields = ['id', 'createdAt', 'date_lecture']

class MessageSerializer(serializers.ModelSerializer):
    """Serializer pour les Messages internes"""
    expediteurId = serializers.PrimaryKeyRelatedField(source='expediteur', queryset=Message._meta.get_field('expediteur').remote_field.model.objects.all())
    destinataireId = serializers.PrimaryKeyRelatedField(source='destinataire', queryset=Message._meta.get_field('destinataire').remote_field.model.objects.all())
    parentId = serializers.PrimaryKeyRelatedField(source='parent', queryset=Message.objects.all(), required=False, allow_null=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    
    class Meta:
        model = Message
        fields = [
            'id', 'expediteurId', 'destinataireId', 'sujet', 'contenu',
            'lu', 'date_lecture', 'parentId', 'est_important', 'est_archive',
            'createdAt'
        ]
        read_only_fields = ['id', 'createdAt', 'date_lecture']
