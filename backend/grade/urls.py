from django.urls import path, include
from rest_framework import routers
from .views import NoteViewSet, HistoriqueNoteViewSet, DecisionFinaleViewSet

gr_router = routers.DefaultRouter()
gr_router.include_format_suffixes = False
gr_router.register(r'notes', NoteViewSet)
gr_router.register(r'historique-notes', HistoriqueNoteViewSet)
gr_router.register(r'decision-finales', DecisionFinaleViewSet)

urlpatterns = gr_router.urls