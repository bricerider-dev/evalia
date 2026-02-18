"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
import django
from django.contrib import admin
from django.urls import path, include

#swagger
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi




urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/grade/', include('grade.urls')),

    path('api/academic/', include('academic.urls')),
    path('api/dep/', include('department.urls')),
    path('api/notifications/', include('notifications.urls')),
    #path('api/', include('core.urls')),

    #swagger
    path('swagger/', get_schema_view(
        openapi.Info(
            title="Evalia API",
            default_version='v1',
            description="API pour la gestion des évaluations",
            terms_of_service="https://www.google.com/policies/terms/",
            contact=openapi.Contact(email="brice@hdm.cm"),
            license=openapi.License(name="BSD License"),
        ),
        public=True,
        permission_classes=[permissions.AllowAny],
    ).with_ui('swagger', cache_timeout=0)),
]
