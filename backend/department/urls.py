from django.urls import path, include
from rest_framework import routers
from .views import DepartmentViewSet, FiliereViewSet

dep_router = routers.DefaultRouter()
dep_router.include_format_suffixes = False
dep_router.register(r'departements', DepartmentViewSet, basename='department')
dep_router.register(r'filieres', FiliereViewSet, basename='filiere')

urlpatterns = dep_router.urls