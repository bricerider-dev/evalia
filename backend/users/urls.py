from django.urls import path
from rest_framework import routers
from .views import UserViewSet, EtudiantViewSet, EnseignantViewSet, UserLoginView, UserLogoutView

users_router = routers.DefaultRouter()
users_router.include_format_suffixes = False
users_router.register(r'users', UserViewSet)
users_router.register(r'etudiants', EtudiantViewSet)
users_router.register(r'enseignants', EnseignantViewSet)

urlpatterns = users_router.urls + [ 
    path('login/', UserLoginView.as_view()),
    path('logout/', UserLogoutView.as_view()),
]