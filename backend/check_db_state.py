import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from academic.models import UniteEnseignement, Semestre, AnneeAcademique

print("Checking UniteEnseignement...")
ues = UniteEnseignement.objects.all()
print(f"Total UEs: {ues.count()}")
for ue in ues:
    print(f"UE: {ue.code}, Semestre: {ue.semestre}")

print("\nChecking Semestres...")
print(f"Total Semestres: {Semestre.objects.count()}")

print("\nChecking AnneeAcademique...")
print(f"Total AnneeAcademique: {AnneeAcademique.objects.count()}")
