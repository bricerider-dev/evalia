from django.contrib import admin
from .models import AnneeAcademique, Semestre, UniteEnseignement, ControleContinu, SessionNormale, Rattrapage


# Register your models here.
admin.site.register(AnneeAcademique)
admin.site.register(Semestre)
admin.site.register(UniteEnseignement)
admin.site.register(ControleContinu)
admin.site.register(SessionNormale)
admin.site.register(Rattrapage)