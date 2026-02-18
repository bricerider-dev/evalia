from rest_framework import viewsets, generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from django.http import HttpResponse
# from reportlab.lib.pagesizes import A4, A3, landscape
# from reportlab.lib.units import cm, inch
# from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
# from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
# from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
# from reportlab.lib import colors

from io import BytesIO
import datetime
import os
from .models import Grade
from .serializer import GradeSerializer, StudentGradeReportSerializer
from users.models import Etudiant
from department.models import Filiere
from django.db.models import Q
from django.template.loader import render_to_string
try:
    from xhtml2pdf import pisa
except ImportError:
    pisa = None

class GradeViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les notes des étudiants"""
    queryset = Grade.objects.select_related('evaluation', 'etudiant__user').all()
    serializer_class = GradeSerializer
    permission_classes = [AllowAny]  # TODO: Implémenter les permissions
    
    def get_queryset(self):
        """Filtrer les notes selon les paramètres"""
        queryset = super().get_queryset()
        
        # Filtrer par étudiant
        student_id = self.request.query_params.get('student_id')
        if student_id:
            queryset = queryset.filter(etudiant__id=student_id)
        
        # Filtrer par évaluation
        evaluation_id = self.request.query_params.get('evaluation_id')
        if evaluation_id:
            queryset = queryset.filter(evaluation__id=evaluation_id)
        
        # Filtrer par type d'évaluation
        eval_type = self.request.query_params.get('evaluation_type')
        if eval_type:
            queryset = queryset.filter(evaluation__type_evaluation=eval_type)
        
        # Filtrer par UE
        ue_id = self.request.query_params.get('ue_id')
        if ue_id:
            queryset = queryset.filter(evaluation__ue__id=ue_id)
        
        return queryset
    
    def create(self, request, *args, **kwargs):
        """Créer une note avec validation"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    def update(self, request, *args, **kwargs):
        """Mettre à jour une note"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_evaluation(self, request):
        """Récupérer les notes par évaluation"""
        evaluation_id = request.query_params.get('evaluation_id')
        if not evaluation_id:
            return Response(
                {'error': 'evaluation_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        grades = self.get_queryset().filter(evaluation__id=evaluation_id)
        serializer = self.get_serializer(grades, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_student(self, request):
        """Récupérer les notes d'un étudiant"""
        student_id = request.query_params.get('student_id')
        if not student_id:
            return Response(
                {'error': 'student_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        grades = self.get_queryset().filter(etudiant__id=student_id)
        serializer = self.get_serializer(grades, many=True)
        return Response(serializer.data)




class GeneratePVView(generics.GenericAPIView):
    """Vue pour la génération de PVs PDF via xhtml2pdf et templates HTML"""

    def get(self, request, evaluation_type=None, semester_id=None):
        if evaluation_type not in ['CC', 'SN', 'RA', 'Final']:
            return Response({'error': "Type d'évaluation invalide"}, status=status.HTTP_400_BAD_REQUEST)

        # Récupérer les paramètres de filtrage (valides pour tous les types de PV)
        filiere_id = request.query_params.get('filiere_id')
        niveau = request.query_params.get('niveau')

        if evaluation_type == 'Final':
            html, filename = self.render_final_pv(filiere_id=filiere_id, niveau=niveau)
        else:
            html, filename = self.render_evaluation_pv(evaluation_type, filiere_id=filiere_id, niveau=niveau)

        # Générer le PDF à partir du HTML
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        pisa_status = pisa.CreatePDF(html, dest=response, encoding='utf-8')
        if pisa_status.err:
            return HttpResponse('Erreur lors de la génération du PDF', status=500)
        return response

    def get_logo_url(self, request=None):
        # Pour xhtml2pdf, il faut un chemin absolu du système de fichiers
        # Try common static file names
        candidates = [
            os.path.join(settings.BASE_DIR, 'backend', 'static', 'enspd-logo.jpg'),
            os.path.join(settings.BASE_DIR, 'backend', 'static', 'enspd-logo.png'),
            os.path.join(settings.BASE_DIR, 'backend', 'static', 'enspd-logo.svg'),
        ]
        for path in candidates:
            if os.path.exists(path):
                return 'file://' + path
        # As fallback return an inline SVG data URI (simple placeholder)
        svg = ("<svg xmlns='http://www.w3.org/2000/svg' width='260' height='80'>"
               "<rect width='100%' height='100%' fill='%230f172a' rx='6'/>"
               "<text x='50%' y='50%' font-family='DejaVu Sans, Arial, sans-serif' font-size='28' fill='%23ffffff' text-anchor='middle' dominant-baseline='middle'>ENSPD</text></svg>")
        return 'data:image/svg+xml;utf8,' + svg

    def render_evaluation_pv(self, eval_type, semester_id=None, filiere_id=None, niveau=None):
        # Récupérer les données nécessaires pour le PV d'évaluation
        grades_filter = {'evaluation__type_evaluation': eval_type}
        if semester_id:
            grades_filter['evaluation__semestre_id'] = semester_id
        
        grades = Grade.objects.filter(**grades_filter).select_related(
            'etudiant__user', 'evaluation__ue', 'evaluation'
        )
        
        # Filtrer par filière et/ou niveau si spécifiés
        if filiere_id:
            grades = grades.filter(etudiant__filiere_id=filiere_id)
        if niveau:
            grades = grades.filter(etudiant__niveau=niveau)
        
        grades = grades.order_by('etudiant__user__username')

        # On suppose qu'il n'y a qu'une seule UE par évaluation pour ce PV
        ue = grades[0].evaluation.ue if grades else None
        ue_name = ue.nom if ue else 'N/A'
        teacher = getattr(grades[0].evaluation, 'enseignant', 'N/A') if grades else 'N/A'

        grades_data = []
        for grade in grades:
            grades_data.append({
                'matricule': grade.etudiant.user.username,
                'nom': grade.etudiant.user.last_name,
                'prenom': grade.etudiant.user.first_name,
                'note': f"{float(grade.grade):.2f}" if grade.grade is not None else '-',
                'observation': 'V' if float(grade.grade) >= 10 else 'NV' if grade.grade is not None else '-'
            })

        context = {
            'logo_url': self.get_logo_url(),
            'date': datetime.datetime.now().strftime('%d/%m/%Y à %H:%M'),
            'ue_name': ue_name,
            'evaluation_type': eval_type,
            'teacher': teacher,
            'grades': grades_data,
        }
        html = render_to_string('grade/pv_evaluation.html', context)
        filename = f"PV_{eval_type}_{datetime.date.today().strftime('%Y%m%d')}.pdf"
        return html, filename

    def render_final_pv(self, filiere_id=None, niveau=None):
        """
        Génère le procès-verbal final des notes pour les étudiants filtrés
        """
        import datetime
        from django.template.loader import render_to_string
        from grade.models import Grade
        from users.models import Etudiant
        
        # Récupérer les étudiants filtrés
        students = Etudiant.objects.select_related('user', 'filiere').all()
        
        if filiere_id:
            students = students.filter(filiere_id=filiere_id)
        if niveau:
            students = students.filter(niveau=niveau)
        
        students = students.order_by('user__last_name', 'user__first_name')
        
        # Récupérer toutes les notes des étudiants concernés
        all_grades = Grade.objects.filter(
            etudiant__in=students
        ).select_related('evaluation__ue', 'evaluation')
        
        # Organiser les notes par étudiant
        grades_by_student = {}
        ue_set = set()
        
        for grade in all_grades:
            if not grade.evaluation or not grade.evaluation.ue:
                continue
                
            etudiant_id = grade.etudiant.id
            if etudiant_id not in grades_by_student:
                grades_by_student[etudiant_id] = []
            grades_by_student[etudiant_id].append(grade)
            
            # Ajouter l'UE à l'ensemble
            ue_set.add(grade.evaluation.ue)
        
        # Si aucune UE trouvée dans les notes, essayer de récupérer les UEs de la filière
        if not ue_set and filiere_id:
            try:
                from academic.models import UniteEnseignement
                ue_set = set(UniteEnseignement.objects.filter(
                    filiere_id=filiere_id
                ))
                if niveau:
                    ue_set = set([ue for ue in ue_set if ue.niveau == niveau])
            except ImportError:
                print("Module academic.models.UniteEnseignement non trouvé")
        
        # Convertir en liste et trier par code
        ues = sorted(list(ue_set), key=lambda ue: ue.code if ue and ue.code else '')
        
        # DEBUG: Afficher les informations
        print(f"Nombre d'étudiants: {students.count()}")
        print(f"Nombre d'UEs trouvées: {len(ues)}")
        for ue in ues:
            print(f"UE: {ue.code} - {ue.nom} - Crédits: {ue.credit}")
        
        # Calculer la somme totale des crédits pour toutes les UEs
        somme_credits_totale = sum(ue.credit for ue in ues if ue and ue.credit)
        print(f"Somme totale des crédits: {somme_credits_totale}")
        
        # Déterminer les noms pour l'affichage
        filiere_name = 'TOUTES FILIÈRES'
        niveau_name = 'TOUS NIVEAUX'
        
        if students.exists():
            first_student = students.first()
            if filiere_id and first_student.filiere:
                filiere_name = first_student.filiere.nom.upper()
            if niveau:
                niveau_display = dict(Etudiant.Niveau.choices).get(niveau, '')
                niveau_name = niveau_display.upper() if niveau_display else niveau
        
        # Traitement des données
        grades_data = []
        all_student_finals = []
        
        for student in students:
            # Récupérer les notes de l'étudiant
            student_grades = grades_by_student.get(student.id, [])
            
            # Organiser les notes par UE
            ue_grades = {}
            for grade in student_grades:
                if not grade.evaluation or not grade.evaluation.ue:
                    continue
                    
                ue_code = grade.evaluation.ue.code
                eval_type = grade.evaluation.type_evaluation
                
                if ue_code not in ue_grades:
                    ue_grades[ue_code] = {'CC': None, 'SN': None, 'RA': None}
                
                if grade.grade is not None:
                    if eval_type == 'RA':
                        ue_grades[ue_code]['RA'] = float(grade.grade)
                    elif eval_type == 'CC':
                        ue_grades[ue_code]['CC'] = float(grade.grade)
                    elif eval_type == 'SN':
                        ue_grades[ue_code]['SN'] = float(grade.grade)
            
            # Construction de la ligne
            row = {
                'matricule': student.user.username if student.user else '',
                'nom': student.user.last_name.upper() if student.user else '',
                'prenom': student.user.first_name.capitalize() if student.user else '',
                'ues': []
            }
            
            # Variables pour le calcul de la moyenne pondérée de l'étudiant
            somme_notes_ponderees = 0.0
            credits_etudiant = 0
            
            for ue in ues:
                notes_ue = ue_grades.get(ue.code, {'CC': None, 'SN': None, 'RA': None})
                
                # Calcul de la note finale de l'UE
                final_ue = None
                if notes_ue['RA'] is not None:
                    final_ue = notes_ue['RA']
                elif notes_ue['CC'] is not None and notes_ue['SN'] is not None:
                    final_ue = (notes_ue['CC'] * 0.3) + (notes_ue['SN'] * 0.7)
                
                # Calcul de la contribution de cette UE à la moyenne générale
                # C'est (note_UE * crédit_UE) / total_crédits
                contribution_moyenne = None
                if final_ue is not None and ue.credit and somme_credits_totale > 0:
                    contribution_moyenne = (final_ue * ue.credit) / somme_credits_totale
                    somme_notes_ponderees += contribution_moyenne
                    credits_etudiant += ue.credit
                
                # Déterminer le statut de l'UE (Validé/Non Validé)
                status = '-'
                if final_ue is not None:
                    status = 'V' if final_ue >= 10 else 'NV'
                
                row['ues'].append({
                    'ue': ue,
                    'cc': f"{notes_ue['CC']:.2f}" if notes_ue['CC'] is not None else '-',
                    'sn': f"{notes_ue['SN']:.2f}" if notes_ue['SN'] is not None else '-',
                    'ra': f"{notes_ue['RA']:.2f}" if notes_ue['RA'] is not None else '-',
                    'final': f"{final_ue:.2f}" if final_ue is not None else '-',
                    'final_av': f"{contribution_moyenne:.2f}" if contribution_moyenne is not None else '-',
                    'status': status,
                })
            
            # La note finale de l'étudiant est la somme des contributions
            # C'est équivalent à (somme(note_UE * crédit_UE)) / total_crédits
            if somme_notes_ponderees > 0:
                note_finale = somme_notes_ponderees  # Déjà divisé par total_crédits
                row['note_finale'] = f"{note_finale:.2f}"
                row['statut'] = 'ADMIS(E)' if note_finale >= 10 else 'AJOURNÉ(E)'
                all_student_finals.append(note_finale)
            else:
                row['note_finale'] = '-'
                row['statut'] = 'N/A'
            
            grades_data.append(row)
        
        # Statistiques
        total_students = len(students)
        if all_student_finals:
            admis = sum(1 for note in all_student_finals if note >= 10)
            ajournes = total_students - admis
            moyenne_generale = sum(all_student_finals) / len(all_student_finals) if all_student_finals else 0
            taux_reussite = (admis / total_students * 100) if total_students > 0 else 0
        else:
            admis = 0
            ajournes = 0
            moyenne_generale = 0
            taux_reussite = 0
        
        # Déterminer le semestre en fonction de la date
        mois_actuel = datetime.datetime.now().month
        semestre = "SEMESTRE 1" if 9 <= mois_actuel <= 12 or 1 <= mois_actuel <= 2 else "SEMESTRE 2"
        
        # Contexte
        context = {
            'date': datetime.datetime.now().strftime('%d/%m/%Y'),
            'filiere': filiere_name,
            'classe': niveau_name,
            'semestre': semestre,
            'ues': ues,
            'grades': grades_data,
            'total_students': total_students,
            'admis': admis,
            'ajournes': ajournes,
            'moyenne_generale': f"{moyenne_generale:.2f}",
            'taux_reussite': f"{taux_reussite:.1f}",
        }
        
        # DEBUG: Vérifier les calculs pour le premier étudiant
        if grades_data:
            print(f"Premier étudiant: {grades_data[0]['nom']} {grades_data[0]['prenom']}")
            print(f"Note finale: {grades_data[0]['note_finale']}")
            print(f"Nombre d'UEs dans les données: {len(grades_data[0]['ues'])}")
            for i, ue_grade in enumerate(grades_data[0]['ues']):
                print(f"  UE {i+1}: final={ue_grade['final']}, final_av={ue_grade['final_av']}")
        
        html = render_to_string('grade/pv_final.html', context)
        filename = f"PV_FINAL_{datetime.date.today().strftime('%Y%m%d')}.pdf"
        
        return html, filename


class StudentGradeReportView(generics.GenericAPIView):
    """Vue améliorée pour le rapport de notes détaillé d'un étudiant"""
    
    def get(self, request, student_id):
        try:
            student = Etudiant.objects.get(id=student_id)
        except Etudiant.DoesNotExist:
            return Response({'error': 'Étudiant non trouvé'}, status=status.HTTP_404_NOT_FOUND)
        
        # Récupérer toutes les notes
        grades_by_ue = {}
        all_grades = Grade.objects.filter(etudiant=student).select_related(
            'evaluation__ue', 'evaluation'
        ).order_by('evaluation__ue__code')
        
        for grade in all_grades:
            ue_code = grade.evaluation.ue.code
            if ue_code not in grades_by_ue:
                grades_by_ue[ue_code] = {
                    'ue': {
                        'code': grade.evaluation.ue.code,
                        'nom': grade.evaluation.ue.nom,
                        'credit': getattr(grade.evaluation.ue, 'credit', 0)
                    },
                    'notes': [],
                    'cc': None,
                    'sn': None,
                    'ra': None,
                    'final': None,
                    'status': 'Non Valide'
                }
            
            eval_type = grade.evaluation.type_evaluation
            if eval_type in ['CC', 'SN', 'RA']:
                grades_by_ue[ue_code][eval_type.lower()] = float(grade.grade)
                grades_by_ue[ue_code]['notes'].append({
                    'type': eval_type,
                    'valeur': float(grade.grade),
                    'date': grade.evaluation.date if hasattr(grade.evaluation, 'date') else None
                })
        
        # Calculs finaux
        ue_list = []
        overall_notes = []
        total_credits = 0
        weighted_sum = 0
        
        for ue_code, ue_info in sorted(grades_by_ue.items()):
            if ue_info['ra'] is not None:
                ue_info['final'] = ue_info['ra']
                ue_info['status'] = 'Valide' if ue_info['ra'] >= 10 else 'Non Valide'
            elif ue_info['cc'] is not None and ue_info['sn'] is not None:
                ue_info['final'] = round((ue_info['cc'] * 0.3) + (ue_info['sn'] * 0.7), 2)
                ue_info['status'] = 'Valide' if ue_info['final'] >= 10 else 'Non Valide'
            
            if ue_info['final'] is not None:
                overall_notes.append(ue_info['final'])
                credit = ue_info['ue']['credit']
                total_credits += credit
                weighted_sum += ue_info['final'] * credit
            
            ue_list.append(ue_info)
        
        # Calculs généraux
        overall_average = weighted_sum / total_credits if total_credits > 0 else 0
        overall_status = 'ADMIS' if overall_average >= 10 else 'AJOURNÉ'
        passed_courses = sum(1 for ue in ue_list if ue['status'] == 'Valide')
        
        # Retourner le rapport enrichi
        report = {
            'student': {
                'id': student.id,
                'matricule': student.user.username,
                'nom': student.user.get_full_name(),
                'email': student.user.email,
                'niveau': getattr(student, 'niveau', 'Non spécifié')
            },
            'courses': ue_list,
            'overall_average': round(overall_average, 2),
            'overall_status': overall_status,
            'total_courses': len(ue_list),
            'passed_courses': passed_courses,
            'failed_courses': len(ue_list) - passed_courses,
            'total_credits': total_credits,
            'weighted_average': round(weighted_sum / total_credits, 2) if total_credits > 0 else 0,
            'generated_at': datetime.datetime.now().isoformat(),
            'academic_year': '2024-2025'
        }


class PVFiltersView(generics.GenericAPIView):
    """Vue pour récupérer les options de filière et niveau qui ont des données d'évaluation"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        """Retourne les filières et niveaux avec étudiants ayant des grades"""
        from django.db.models import Q, Exists, OuterRef
        
        # Récupérer les filières qui ont au moins un étudiant avec une note
        filieres_avec_grades = Filiere.objects.annotate(
            has_grades=Exists(
                Etudiant.objects.filter(
                    filiere_id=OuterRef('id'),
                    grades__isnull=False
                )
            )
        ).filter(has_grades=True).values('id', 'code', 'nom').distinct()
        
        # Récupérer les niveaux qui ont au moins un étudiant avec une note
        niveaux_avec_grades = Etudiant.objects.filter(
            grades__isnull=False
        ).values_list('niveau', flat=True).distinct()
        
        # Créer un mapping des combinaisons filière+niveau valides
        combinaisons_valides = Etudiant.objects.filter(
            grades__isnull=False
        ).values('filiere_id', 'niveau').distinct()
        
        niveaux_map = {code: label for code, label in Etudiant.Niveau.choices}
        
        return Response({
            'filieres': list(filieres_avec_grades),
            'niveaux': [
                {'code': code, 'label': niveaux_map.get(code, code)} 
                for code in niveaux_avec_grades
            ],
            'combinaisons': [
                {
                    'filiere_id': str(comb['filiere_id']),
                    'niveau': comb['niveau']
                }
                for comb in combinaisons_valides
            ]
        })
        return Response(report)

