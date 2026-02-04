from django.urls import path, include
from rest_framework.routers import DefaultRouter
from academic.views import (
    SubjectViewSet, UniteEnseignementViewSet,
    ControleContinuViewSet, SessionNormaleViewSet, RattrapageViewSet
)

router = DefaultRouter()
router.register(r'subjects', SubjectViewSet)
router.register(r'units', UniteEnseignementViewSet)
router.register(r'cc', ControleContinuViewSet)
router.register(r'sn', SessionNormaleViewSet)
router.register(r'ra', RattrapageViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
