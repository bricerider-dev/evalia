from django.urls import path, include
from rest_framework.routers import DefaultRouter
from academic.views import (
 UniteEnseignementViewSet,
    ControleContinuViewSet, SessionNormaleViewSet, RattrapageViewSet
)

ac_router= DefaultRouter()
ac_router.include_format_suffixes = False
ac_router.register(r'subjects', UniteEnseignementViewSet)
ac_router.register(r'cc', ControleContinuViewSet)
ac_router.register(r'sn', SessionNormaleViewSet)
ac_router.register(r'ra', RattrapageViewSet)
urlpatterns = ac_router.urls
