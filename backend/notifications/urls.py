from django.urls import path, include
from rest_framework.routers import DefaultRouter
from notifications.views import NotificationViewSet, MessageViewSet

notif_router = DefaultRouter()
notif_router.include_format_suffixes = False
notif_router.register(r'list', NotificationViewSet, basename='notification')
notif_router.register(r'messages', MessageViewSet, basename='message')

urlpatterns = notif_router.urls
