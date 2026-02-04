from django.contrib import admin
from .models import AnneeAcademique, Semestre, UniteEnseignement


# Register your models here.
admin.site.register(AnneeAcademique)
admin.site.register(Semestre)
admin.site.register(UniteEnseignement)