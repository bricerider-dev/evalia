from django.urls import path, include
from rest_framework import routers
from .views import GradeSerializer, HistoriqueNoteViewSet, DecisionFinaleViewSet,NoteViewSet 

gr_router = routers.DefaultRouter()
gr_router.include_format_suffixes = False
gr_router.register(r'notes', NoteViewSet, basename='note')
gr_router.register(r'historique-notes', HistoriqueNoteViewSet, basename='historique-note')
gr_router.register(r'decision-finales', DecisionFinaleViewSet, basename='decision-finale')

urlpatterns = gr_router.urls