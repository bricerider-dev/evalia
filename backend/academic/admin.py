from django.contrib import admin
from .models import AnneeAcademique, Semestre, UniteEnseignement, Evaluation


# Register your models here.
admin.site.register(AnneeAcademique)
admin.site.register(Semestre)
admin.site.register(UniteEnseignement)
admin.site.register(Evaluation)