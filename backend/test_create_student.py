import requests
import json

url = "http://localhost:8000/api/users/etudiants/"
headers = {"Content-Type": "application/json"}
data = {
    "user": {
        "firstName": "Test",
        "lastName": "User",
        "email": "test@test.com",
        "username": "TEST001",
        "phone": "699999999",
        "password": "test1234",
        "role": "student",
        "is_active": True
    },
    "filiere": 1,
    "level": "L1",
    "cycle": "ING",
    "status": "active"
}

try:
    response = requests.post(url, headers=headers, data=json.dumps(data))
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")



# class GeneratePVView(generics.GenericAPIView):
#     """Vue améliorée pour la génération de PVs avec une meilleure ergonomie"""
    
#     def get(self, request, evaluation_type=None):
#         if evaluation_type not in ['CC', 'SN', 'RA', 'Final']:
#             return Response({'error': 'Type d\'évaluation invalide'}, status=status.HTTP_400_BAD_REQUEST)
        
#         # Créer le buffer pour le PDF en mode paysage
#         buffer = BytesIO()

#         if evaluation_type == 'Final':
#             pdf = self.generate_final_pv(buffer)
#             filename = f"PV_FINAL_{datetime.date.today().strftime('%Y%m%d')}.pdf"
#         else:
#             pdf = self.generate_evaluation_pv(buffer, evaluation_type)
#             filename = f"PV_{evaluation_type}_{datetime.date.today().strftime('%Y%m%d')}.pdf"
        
#         response = HttpResponse(pdf, content_type='application/pdf')
#         response['Content-Disposition'] = f'attachment; filename="{filename}"'
#         return response

#     def get_styles(self):
#         """Retourne les styles personnalisés pour le PDF"""
#         styles = getSampleStyleSheet()
        
#         return {
#             'title': ParagraphStyle(
#                 'CustomTitle',
#                 parent=styles['Heading1'],
#                 fontSize=16,
#                 spaceAfter=8,
#                 alignment=TA_CENTER,
#                 fontName='Helvetica-Bold',
#                 textColor=colors.HexColor('#2c3e50')
#             ),
#             'subtitle': ParagraphStyle(
#                 'CustomSubtitle',
#                 parent=styles['Normal'],
#                 fontSize=11,
#                 spaceAfter=2,
#                 alignment=TA_CENTER,
#                 fontName='Helvetica',
#                 textColor=colors.HexColor('#34495e')
#             ),
#             'institution': ParagraphStyle(
#                 'Institution',
#                 parent=styles['Normal'],
#                 fontSize=10,
#                 spaceAfter=1,
#                 alignment=TA_CENTER,
#                 fontName='Helvetica-Bold',
#                 textColor=colors.HexColor('#7f8c8d')
#             ),
#             'header': ParagraphStyle(
#                 'HeaderStyle',
#                 parent=styles['Normal'],
#                 fontSize=9,
#                 alignment=TA_LEFT,
#                 fontName='Helvetica-Bold'
#             ),
#             'footer': ParagraphStyle(
#                 'FooterStyle',
#                 parent=styles['Normal'],
#                 fontSize=8,
#                 alignment=TA_RIGHT,
#                 textColor=colors.HexColor('#7f8c8d')
#             ),
#             'stats': ParagraphStyle(
#                 'StatsStyle',
#                 parent=styles['Normal'],
#                 fontSize=9,
#                 alignment=TA_CENTER,
#                 fontName='Helvetica-Bold',
#                 textColor=colors.HexColor('#27ae60')
#             ),
#             'table_header': ParagraphStyle(
#                 'TableHeader',
#                 parent=styles['Normal'],
#                 fontSize=9,
#                 alignment=TA_CENTER,
#                 fontName='Helvetica-Bold'
#             )
#         }

#     def _check_image_exists(self, path: str) -> bool:
#         """Vérifie simplement si le fichier image existe sur le système de fichiers.

#         Retourne True si le fichier est accessible, False sinon.
#         """
#         try:
#             return os.path.exists(path)
#         except Exception:
#             return False

#     def generate_evaluation_pv(self, buffer, eval_type):
#         """Génère un PV pour les évaluations CC, SN ou RA avec une meilleure ergonomie"""
#         doc = SimpleDocTemplate(
#             buffer, 
#             pagesize=landscape(A4),
#             topMargin=0.8*cm, 
#             bottomMargin=0.8*cm,
#             leftMargin=1*cm,
#             rightMargin=1*cm
#         )
#         elements = []
#         styles_dict = self.get_styles()

#         # En-tête institutionnel amélioré
#         elements.append(Paragraph("RÉPUBLIQUE DU CAMEROUN", styles_dict['institution']))
#         elements.append(Paragraph("Paix - Travail - Patrie", styles_dict['institution']))
#         elements.append(Paragraph("UNIVERSITÉ DE DOUALA", styles_dict['institution']))
#         elements.append(Spacer(1, 0.3*cm))
        
#         # Ligne de séparation
#         elements.append(Paragraph("<hr width='100%' color='#bdc3c7' size='1' />", styles_dict['footer']))
#         elements.append(Spacer(1, 0.3*cm))
        
#         # Titre avec icône (simulée par du texte)
#         eval_names = {'CC': 'CONTRÔLE CONTINU', 'SN': 'SESSION NORMALE', 'RA': 'RATTRAPAGE'}
#         title = f"📋 PROCÈS-VERBAL {eval_names[eval_type]}"
#         elements.append(Paragraph(title, styles_dict['title']))
#         elements.append(Spacer(1, 0.5*cm))

#         # Récupérer les données
#         grades = Grade.objects.filter(evaluation__type_evaluation=eval_type).select_related(
#             'etudiant__user', 'evaluation__ue', 'evaluation'
#         ).order_by('etudiant__user__username')

#         # Organiser les données
#         students_dict = {}
#         ues_list = []
        
#         for grade in grades:
#             student_key = grade.etudiant.user.username
#             ue_code = grade.evaluation.ue.code
            
#             if student_key not in students_dict:
#                 students_dict[student_key] = {
#                     'name': grade.etudiant.user.get_full_name(),
#                     'grades': {}
#                 }
            
#             if ue_code not in students_dict[student_key]['grades']:
#                 students_dict[student_key]['grades'][ue_code] = {
#                     'ue': grade.evaluation.ue,
#                     'note': grade.grade,
#                     'date': grade.evaluation.date if hasattr(grade.evaluation, 'date') else None
#                 }
            
#             if ue_code not in [ue[0] for ue in ues_list]:
#                 ues_list.append((ue_code, grade.evaluation.ue))
        
#         # Trier les UEs par code
#         ues_list.sort(key=lambda x: x[0])
        
#         # Informations complémentaires
#         if ues_list:
#             elements.append(Paragraph(f"📚 UE concernées : {', '.join([ue[0] for ue in ues_list])}", styles_dict['stats']))
#             elements.append(Spacer(1, 0.3*cm))
        
#         # Créer le tableau avec style amélioré
#         table_data = [['N°', 'Matricule', 'Nom et Prénoms'] + [ue[0] for ue in ues_list]]
        
#         for i, (student_key, student_info) in enumerate(sorted(students_dict.items()), 1):
#             row = [str(i), student_key, student_info['name']]
#             for ue_code, ue_obj in ues_list:
#                 grade_info = student_info['grades'].get(ue_code, {})
#                 note = grade_info.get('note', '-')
#                 # Formater la note avec couleur (sera appliquée dans le style)
#                 if note != '-':
#                     note = f"{float(note):.2f}" if note else '-'
#                 row.append(note)
#             table_data.append(row)
        
#         # Calcul des largeurs de colonnes
#         col_widths = [0.8*cm, 2.2*cm, 5*cm] + [2*cm] * len(ues_list)
        
#         # Création du tableau avec style amélioré
#         table = Table(table_data, colWidths=col_widths, repeatRows=1)
        
#         # Style du tableau
#         table_style = [
#             # En-tête
#             ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2c3e50')),
#             ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
#             ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
#             ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
#             ('FONTSIZE', (0, 0), (-1, 0), 10),
#             ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
#             ('TOPPADDING', (0, 0), (-1, 0), 10),
            
#             # Corps du tableau
#             ('FONTNAME', (0, 1), (2, -1), 'Helvetica'),
#             ('FONTSIZE', (0, 1), (-1, -1), 9),
#             ('ALIGN', (0, 1), (2, -1), 'LEFT'),
#             ('ALIGN', (3, 1), (-1, -1), 'CENTER'),
#             ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
#             ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#bdc3c7')),
            
#             # Alternance de couleurs pour les lignes
#             ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#ecf0f1')]),
            
#             # Mise en évidence des notes
#             ('TEXTCOLOR', (3, 1), (-1, -1), colors.HexColor('#27ae60')),
#         ]
        
#         # Ajouter des couleurs conditionnelles pour les notes
#         for i, row in enumerate(table_data[1:], start=1):
#             for j, cell in enumerate(row[3:], start=3):
#                 if cell != '-' and float(cell) < 10:
#                     table_style.append(('TEXTCOLOR', (j, i), (j, i), colors.HexColor('#e74c3c')))
        
#         table.setStyle(TableStyle(table_style))
#         elements.append(table)
#         elements.append(Spacer(1, 0.5*cm))
        
#         # Pied de page avec statistiques
#         total_students = len(students_dict)
#         total_notes = sum(1 for s in students_dict.values() for g in s['grades'].values() if g.get('note') is not None)
#         avg_note = sum(float(g['note']) for s in students_dict.values() for g in s['grades'].values() if g.get('note') is not None) / total_notes if total_notes > 0 else 0
        
#         # Ligne de séparation
#         elements.append(Paragraph("<hr width='100%' color='#bdc3c7' size='1' />", styles_dict['footer']))
        
#         stats_text = f"📊 Effectif : {total_students} étudiants | Total des notes saisies : {total_notes} | Moyenne générale : {avg_note:.2f}/20"
#         elements.append(Paragraph(stats_text, styles_dict['stats']))
        
#         date_str = f"📅 Généré le : {datetime.datetime.now().strftime('%d/%m/%Y à %H:%M')}"
#         elements.append(Paragraph(date_str, styles_dict['footer']))
        
#         # Signature
#         elements.append(Spacer(1, 0.5*cm))
#         elements.append(Paragraph("Le Chef de Département", ParagraphStyle(
#             'Signature',
#             parent=styles_dict['footer'],
#             alignment=TA_RIGHT,
#             fontName='Helvetica-Bold'
#         )))
        
#         # Sauvegarder le PDF
#         doc.build(elements)
#         pdf = buffer.getvalue()
#         buffer.close()
#         return pdf

#     def generate_final_pv(self, buffer):
#         """Génère un PV final avec une ergonomie optimisée"""
#         doc = SimpleDocTemplate(
#             buffer, 
#             pagesize=landscape(A4),
#             topMargin=0.8*cm, 
#             bottomMargin=0.8*cm,
#             leftMargin=0.8*cm,
#             rightMargin=0.8*cm
#         )
#         elements = []
#         styles_dict = self.get_styles()
#         # En-tête institutionnel horizontal avec logo
#         header_table_data = [
#             [
#             # Colonne gauche - Texte français
#             Paragraph("RÉPUBLIQUE DU CAMEROUN<br/>Paix - Travail - Patrie<br/>UNIVERSITÉ DE DOUALA", 
#                  ParagraphStyle('LeftHeader', parent=styles_dict['institution'], alignment=TA_LEFT, fontSize=9, borderPadding=5,)),
                 
#             # Colonne centre - Logo
#             Image('/staticfiles/enspd-logo.jpg', width=2.5*cm, height=2.5*cm) if self._check_image_exists('staticfiles/enspd-logo.png') else Paragraph("LOGO", styles_dict['institution']),
#             # Colonne droite - Texte anglais
#             Paragraph("REPUBLIC OF CAMEROON<br/>PEACE - WORK - FATHERLAND<br/>UNIVERSITY OF DOUALA", 
#                  ParagraphStyle('RightHeader', parent=styles_dict['institution'], alignment=TA_RIGHT, fontSize=9, borderPadding=5))
#             ]
#         ]
        
#         header_table = Table(header_table_data, colWidths=[5*cm, 3*cm, 5*cm])
#         header_table.setStyle(TableStyle([
#             ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
#             ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
#             ('TOPPADDING', (0, 0), (-1, -1), 5),
#             ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
#         ]))
        
#         elements.append(header_table)
#         elements.append(Spacer(1, 0.3*cm))
#         # Ligne de séparation
#         elements.append(Paragraph("<hr width='100%' color='#bdc3c7' size='1' />", styles_dict['footer']))
#         elements.append(Spacer(1, 0.3*cm))
        
#         # Titre
#         elements.append(Paragraph("📋 PROCÈS-VERBAL FINAL DES NOTES", styles_dict['title']))
#         elements.append(Paragraph("ANNÉE ACADÉMIQUE 2024-2025", styles_dict['subtitle']))
#         elements.append(Spacer(1, 0.5*cm))

#         # Récupérer les données
#         students = Etudiant.objects.all().order_by('user__username')
        
#         # Organiser les données
#         students_data = {}
#         all_ues = set()

#         for student in students:
#             student_id = student.id
#             if student_id not in students_data:
#                 students_data[student_id] = {
#                     'student': student,
#                     'ues': {}
#                 }

#             grades = Grade.objects.filter(etudiant=student).select_related('evaluation__ue')
            
#             for grade in grades:
#                 ue_code = grade.evaluation.ue.code
#                 all_ues.add((ue_code, grade.evaluation.ue))
                
#                 if ue_code not in students_data[student_id]['ues']:
#                     students_data[student_id]['ues'][ue_code] = {
#                         'ue': grade.evaluation.ue,
#                         'cc': None,
#                         'sn': None,
#                         'ra': None,
#                         'final': None,
#                         'status': 'Non Valide'
#                     }
                
#                 eval_type = grade.evaluation.type_evaluation
#                 if eval_type in ['CC', 'SN', 'RA']:
#                     students_data[student_id]['ues'][ue_code][eval_type.lower()] = float(grade.grade)
            
#             # Calculs finaux
#             for ue_code, ue_info in students_data[student_id]['ues'].items():
#                 if ue_info['ra'] is not None:
#                     ue_info['final'] = ue_info['ra']
#                     ue_info['status'] = 'V' if ue_info['ra'] >= 10 else 'NV'
#                 elif ue_info['cc'] is not None and ue_info['sn'] is not None:
#                     ue_info['final'] = (ue_info['cc'] * 0.3) + (ue_info['sn'] * 0.7)
#                     ue_info['status'] = 'V' if ue_info['final'] >= 10 else 'NV'

#         # Trier les UEs
#         sorted_ues = sorted(list(all_ues), key=lambda x: x[0])
        
#         # Créer l'en-tête du tableau
#         header_cells = ['N°', 'Matricule', 'Nom & Prénoms']
#         for ue_code, ue_obj in sorted_ues:
#             header_cells.extend([f'{ue_code}\nCC', f'{ue_code}\nSN', f'{ue_code}\nRA', f'{ue_code}\nFIN', f'{ue_code}\nR'])
#         header_cells.extend(['MOY', 'RÉS.'])
        
#         table_data = [header_cells]

#         overall_grades = []
#         for student_id, data in sorted(students_data.items(), key=lambda x: x[1]['student'].user.username):
#             student = data['student']
#             row = [str(len(table_data)), student.user.username, 
#                    f"{student.user.first_name[:1]}. {student.user.last_name}"]
            
#             student_notes = []
#             for ue_code, ue_obj in sorted_ues:
#                 ue_info = data['ues'].get(ue_code, {})
                
#                 # Formatage des notes avec couleurs (appliquées plus tard)
#                 cc = f"{ue_info.get('cc', '-'):.2f}" if ue_info.get('cc') else '-'
#                 sn = f"{ue_info.get('sn', '-'):.2f}" if ue_info.get('sn') else '-'
#                 ra = f"{ue_info.get('ra', '-'):.2f}" if ue_info.get('ra') else '-'
#                 final = f"{ue_info.get('final', '-'):.2f}" if ue_info.get('final') else '-'
#                 status = ue_info.get('status', '-')
                
#                 row.extend([cc, sn, ra, final, status])
                
#                 if ue_info.get('final'):
#                     student_notes.append(ue_info['final'])
            
#             # Moyenne et résultat final
#             mg = sum(student_notes) / len(student_notes) if student_notes else 0
#             overall_grades.append(mg)
#             final_status = 'ADMIS' if mg >= 10 else 'AJOURNÉ'
#             row.extend([f"{mg:.2f}", final_status])
            
#             table_data.append(row)
        
#         # Calcul des largeurs de colonnes optimisées
#         base_widths = [0.6*cm, 1.8*cm, 3.5*cm]
#         ue_widths = [0.9*cm] * (len(sorted_ues) * 5)
#         final_widths = [1.2*cm, 1.5*cm]
#         col_widths = base_widths + ue_widths + final_widths
        
#         # Création du tableau
#         table = Table(table_data, colWidths=col_widths, repeatRows=1)
        
#         # Style avancé du tableau
#         table_style = [
#             # En-tête principal
#             ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#3580cc")),
#             ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
#             ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
#             ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
#             ('FONTSIZE', (0, 0), (-1, 0), 8),
#             ('VALIGN', (0, 0), (-1, 0), 'MIDDLE'),
            
#             # Corps
#             ('FONTSIZE', (0, 1), (-1, -1), 7.5),
#             ('ALIGN', (0, 1), (2, -1), 'LEFT'),
#             ('ALIGN', (3, 1), (-1, -1), 'CENTER'),
#             ('VALIGN', (0, 1), (-1, -1), 'MIDDLE'),
#             ('GRID', (0, 0), (-1, -1), 0.3, colors.HexColor("#83a6bd")),
            
#             # Alternance de couleurs
#             ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8f9fa')]),
#         ]
        
#         # Coloriage conditionnel des notes
#         for i in range(1, len(table_data)):
#             for j in range(3, len(table_data[i])):
#                 cell_value = table_data[i][j]
#                 # Notes en vert/rouge
#                 if isinstance(cell_value, str) and cell_value.replace('.', '').replace('-', '').isdigit():
#                     value = float(cell_value)
#                     if value >= 10:
#                         table_style.append(('TEXTCOLOR', (j, i), (j, i), colors.HexColor('#27ae60')))
#                     else:
#                         table_style.append(('TEXTCOLOR', (j, i), (j, i), colors.HexColor('#e74c3c')))
                
#                 # Statuts (V/NV) en vert/rouge
#                 if cell_value in ['V', 'NV']:
#                     color = colors.HexColor('#27ae60') if cell_value == 'V' else colors.HexColor('#e74c3c')
#                     table_style.append(('TEXTCOLOR', (j, i), (j, i), color))
#                     table_style.append(('FONTNAME', (j, i), (j, i), 'Helvetica-Bold'))
        
#         table.setStyle(TableStyle(table_style))
#         elements.append(table)
#         elements.append(Spacer(1, 0.5*cm))

#         # Statistiques avancées
#         total_students = len(students_data)
#         admis = sum(1 for g in overall_grades if g >= 10)
#         ajournes = total_students - admis
#         moyenne_generale = sum(overall_grades) / len(overall_grades) if overall_grades else 0
#         taux_reussite = (admis / total_students * 100) if total_students > 0 else 0
        
#         # Ligne de séparation
#         elements.append(Paragraph("<hr width='100%' color='#bdc3c7' size='1' />", styles_dict['footer']))
        
#         # Statistiques en couleurs
#         stats_text = f"📊 RÉSULTATS FINAUX | Effectif : {total_students} | ✅ Admis : {admis} | ❌ Ajournés : {ajournes} | 📈 Taux : {taux_reussite:.1f}% | 🎯 Moyenne : {moyenne_generale:.2f}/20"
#         elements.append(Paragraph(stats_text, styles_dict['stats']))
        
#         # Date et signature
#         date_str = f"📅 Généré le : {datetime.datetime.now().strftime('%d/%m/%Y à %H:%M')}"
#         elements.append(Paragraph(date_str, styles_dict['footer']))
        
#         elements.append(Spacer(1, 0.5*cm))
#         elements.append(Paragraph("Le Chef de Département", ParagraphStyle(
#             'Signature',
#             parent=styles_dict['footer'],
#             alignment=TA_RIGHT,
#             fontName='Helvetica-Bold',
#             fontSize=10
#         )))
        
#         # Sauvegarder
#         doc.build(elements)
#         pdf = buffer.getvalue()
#         buffer.close()
#         return pdf
