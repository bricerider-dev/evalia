from django.urls import path, include
from rest_framework.routers import DefaultRouter
from academic.views import (
    AcademicYearViewSet, SemesterViewSet,
 UniteEnseignementViewSet,
 EvaluationViewSet
)

ac_router= DefaultRouter()
ac_router.include_format_suffixes = False
ac_router.register(r'years', AcademicYearViewSet)
ac_router.register(r'semesters', SemesterViewSet)
ac_router.register(r'subjects', UniteEnseignementViewSet)
ac_router.register(r'evaluations', EvaluationViewSet)
urlpatterns = ac_router.urls
