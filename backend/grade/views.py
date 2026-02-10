from rest_framework import viewsets, generics, status
from rest_framework.response import Response
from django.http import HttpResponse
from rest_framework.decorators import action
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.units import inch
from  io import BytesIO
import datetime
from .models import Grade
from .serializer import GradeSerializer
from users.models import Etudiant

class GradeViewSet(viewsets.ModelViewSet):
    queryset = Grade.objects.all()
    serializer_class = GradeSerializer

class GeneratePVView(generics.GenericAPIView):
    def get(self, request, evaluation_type=None):
        if evaluation_type not in ['CC', 'SN', 'RA', 'Final']:
            return Response({'error': 'Invalid evaluation type'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Créer le buffer pour le PDF
        buffer = BytesIO()

        if evaluation_type == 'Final':
            pdf = self.generate_final_pv(buffer)
        else:
            pdf = self.generate_evaluation_pv(buffer, evaluation_type)
        
        response = HttpResponse(pdf, content_type='application/pdf')
        filename = f"PV_{evaluation_type}_{datetime.date.today()}.pdf"
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response

    def generate_evaluation_pv(self, buffer, eval_type):
        doc = SimpleDocTemplate(buffer, pagesize=A2, orientation='landscape')
        elements = []

        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=16,
            spaceAfter=30,
            alignment=1  # Center
        )

        # Titre
        eval_names = {'CC': 'Contrôle Continu', 'SN': 'Session Normale', 'RA': 'Rattrapage'}
        title = f"PROCÈS-VERBAL DES NOTES - {eval_names[eval_type]}"
        elements.append(Paragraph(title, title_style))
        
        # Date de génération
        date_str = f"Généré le : {datetime.date.today().strftime('%d/%m/%Y')}"
        elements.append(Paragraph(date_str, styles['Normal']))
        elements.append(Spacer(1, 20))

        # Récupérer les données
        grades = Grade.objects.filter(evaluation__type_evaluation=eval_type).select_related('etudiant__user', 'evaluation__ue').order_by('evaluation__ue__code', 'etudiant__user__username')

        # Organiser les données par cours
        courses_data = {}
        for grade in grades:
            ue_code = grade.evaluation.ue.code
            if ue_code not in courses_data:
                courses_data[ue_code] = {
                    'ue': grade.evaluation.ue,
                    'grades': []
                }
            courses_data[ue_code]['grades'].append({
                'student_name': grade.etudiant.user.get_full_name(),
                'matricule': grade.etudiant.user.username,
                'note': grade.grade,
                'status': grade.statut,
                
            })
        
        # Ajouter les données de chaque cours
        for ue_code, ue_data in courses_data.items():
            elements.append(Paragraph(f"Cours : {ue_data['ue'].code} - {ue_data['ue'].nom}", styles['Heading2']))
            elements.append(Spacer(1, 10))
            
            # Créer le tableau des notes
            table_data = [
                ['N°', 'Matricule', 'Nom et Prénom', 'Note', 'Statut']
            ]
            
            for i, grade in enumerate(ue_data['grades'], 1):
                table_data.append([
                    i,
                    grade['matricule'],
                    grade['student_name'],
                    grade['note'],
                    grade['status'],                    
                ])
            
            # Ajouter le tableau
            table = Table(table_data, colWidths=[0.5*cm, 2*cm, 5*cm, 1.5*cm, 1.5*cm])
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ]))
            elements.append(table)
            elements.append(Spacer(1, 20))
        
        # Sauvegarder le PDF
        doc.build(elements)
        pdf = buffer.getvalue()
        buffer.close()
        return pdf

    def generate_final_pv(self, buffer):
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        elements = []
        
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=16,
            spaceAfter=30,
            alignment=1
        )

        # Titre
        title = "PROCÈS-VERBAL FINAL DES NOTES"
        elements.append(Paragraph(title, title_style))
        
        date_str = f"Année académique : 2024-2025 - Généré le : {datetime.date.today().strftime('%d/%m/%Y')}"
        elements.append(Paragraph(date_str, styles['Normal']))
        elements.append(Spacer(1, 20))

        # Récupérer tous les étudiants avec leurs notes
        students = Etudiant.objects.all().order_by('user__username')
        
        # Organiser les données par étudiant
        students_data = {}

        for student in students:
            student_id = student.id
            if student_id not in students_data:
                students_data[student_id] = {
                    'student': student,
                    'grades': []
                }

            grades = Grade.objects.filter(etudiant=student).select_related('evaluation__ue')
            final_grade = None
            cc_grade = None
            sn_grade = None
            ra_grade = None
            status = "Non Valide"

            for grade in grades:
                if grade.evaluation.type_evaluation == 'CC':
                    cc_grade = float(grade.grade)
                elif grade.evaluation.type_evaluation == 'SN':
                    sn_grade = float(grade.grade)
                elif grade.evaluation.type_evaluation == 'RA':
                    ra_grade = float(grade.grade)

            if ra_grade is not None:
                final_grade = ra_grade
                status = "Valide" if final_grade >= 10 else "Non Valide"
            elif cc_grade is not None and sn_grade is not None:
                final_grade = (cc_grade * 0.3) + (sn_grade * 0.7)
                status = "Valide" if final_grade >= 10 else "Non Valide"
            else:
                final_grade = None
                status = "Non Valide"

            students_data[student_id]['grades'].append({
                'ue': grade.evaluation.ue,
                'cc_grade': cc_grade,
                'sn_grade': sn_grade,
                'ra_grade': ra_grade,
                'final_grade': final_grade,
                'status': status
            })
        # Créer le tableau final
        table_data = [['Matricule', 'Étudiant', 'Cours', 'CC (30%)', 'SN (70%)', 'RA', 'Finale', 'Statut']]

        for student_id, data in sorted(students_data.items(), key=lambda x: x[1]['student'].user.username):
            student_name = f"{data['student'].user.first_name} {data['student'].user.last_name}"
            
            for i, ue_data in enumerate(data['grades']):
                if i == 0:
                    table_data.append([
                        data['student'].user.username,
                        student_name,
                        ue_data['ue'].code,
                        ue_data['cc_grade'] or '-',
                        ue_data['sn_grade'] or '-',
                        ue_data['ra_grade'] or '-',
                        ue_data['final_grade'] or '-',
                        ue_data['status']
                    ])
                else:
                    table_data.append([
                        '',
                        '',
                        ue_data['ue'].code,
                        ue_data['cc_grade'] or '-',
                        ue_data['sn_grade'] or '-',
                        ue_data['ra_grade'] or '-',
                        ue_data['final_grade'] or '-',
                        ue_data['status']
                    ])
        
        #Créer le tableau final
        table = Table(table_data, colWidths=[1*inch, 2*inch, 2*inch, 0.8*inch, 0.8*inch, 0.8*inch, 0.8*inch, 1*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('SPAN', (0, 1), (0, len(table_data)-2)),  # Fusionner les cellules du matricule
            ('SPAN', (1, 1), (1, len(table_data)-2)),  # Fusionner les cellules du nom
        ]))

        elements.append(table)
        elements.append(Spacer(1, 20))

        # Ajouter les totaux
        total_students = len(students)
        valid_students = sum(1 for data in students_data.values() if any(ue['status'] == 'Valide' for ue in data['grades']))
        invalid_students = total_students - valid_students

        elements.append(Paragraph(f"Total étudiants : {total_students}", styles['Normal']))
        elements.append(Paragraph(f"Étudiants valides : {valid_students}", styles['Normal']))
        elements.append(Paragraph(f"Étudiants non valides : {invalid_students}", styles['Normal']))

        # Ajouter les statistiques
        elements.append(Spacer(1, 30))
        elements.append(Paragraph("LÉGENDE : CC = Contrôle Continu, SN = Session Normale, RA = Rattrapage", styles['Normal']))
        elements.append(Paragraph("NOTE : La note finale est calculée comme suit : Finale = (CC × 0.30) + (SN × 0.70)", styles['Normal']))
        elements.append(Paragraph("Le rattrapage est autorisé uniquement si la note finale est inférieure à 10/20", styles['Normal']))
        
        # Sauvegarder le PDF
        doc.build(elements)
        pdf = buffer.getvalue()
        buffer.close()
        return pdf