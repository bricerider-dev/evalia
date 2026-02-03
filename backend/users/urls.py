from django.urls import path, include
from rest_framework import routers
from .views import UserViewSet, EtudiantViewSet, EnseignantViewSet, UserLoginView, UserLogoutView

router = routers.DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'etudiants', EtudiantViewSet)
router.register(r'enseignants', EnseignantViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('login/', UserLoginView.as_view()),
    path('logout/', UserLogoutView.as_view()),
]