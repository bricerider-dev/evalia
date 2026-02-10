from django.urls import path, include
from rest_framework import routers
from .views import GradeViewSet,GeneratePVView

gr_router = routers.DefaultRouter()
gr_router.include_format_suffixes = False
gr_router.register(r'notes', GradeViewSet, basename='note')

urlpatterns = gr_router.urls + [
    path('generate-pv/', GeneratePVView.as_view(), name='generate-pv'),
    path('generate-pv/<str:evaluation_type>/', GeneratePVView.as_view(), name='generate-pv-ue'),
]