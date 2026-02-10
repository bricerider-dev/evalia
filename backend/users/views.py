from .models import User, Etudiant, Enseignant
from academic.models import Evaluation
from department.models import Departement
from .serializer import UserSerializer, EtudiantSerializer, EnseignantSerializer, UserLoginSerializer, UserLogoutSerializer
from rest_framework import viewsets, status
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.hashers import make_password
from django.contrib.auth.hashers import check_password


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class EtudiantViewSet(viewsets.ModelViewSet):
    queryset = Etudiant.objects.all()
    serializer_class = EtudiantSerializer
    permission_classes = [AllowAny]

    @action(detail=True, methods=['get'])
    def grades_report(self, request, pk=None):
        student = self.get_object()
        evaluations = Evaluation.objects.filter(etudiant=student)
        courses_data = []
        total_final_grade = 0
        total_credit = 0

        for evaluation in evaluations:
            grade = Grade.objects.filter(evaluation=evaluation)
            final_grade = None

            if grade.exists():
                # Calculer la note finale
                cc_grade = grades.filter(evaluation_type='CC').first()
                sn_grade = grades.filter(evaluation_type='SN').first()
                ra_grade = grades.filter(evaluation_type='RA').first()

                if cc_grade and sn_grade:
                    final_grade = (cc_grade.note * 0.4) + (sn_grade.note * 0.6)
                elif ra_grade:
                    final_grade = ra_grade.note
                else:
                    final_grade = None

                courses_data.append({
                    'ue': evaluation.ue,
                    'grade': grade,
                    'final_grade': final_grade,
                    'status': evaluation.get_status()
                })
                total_credit += evaluation.ue.credit
                total_final_grade += final_grade * evaluation.ue.credit

        overall_average = round(total_final_grade / total_credit, 2) if total_credit > 0 else 0
        data = {
            'courses': courses_data,
            'student': EtudiantSerializer(student).data,
            'overall_average': overall_average
        }
        serializer = StudentGradeReportSerializer(data)
        return Response(serializer.data)

        

class EnseignantViewSet(viewsets.ModelViewSet):
    queryset = Enseignant.objects.all()
    serializer_class = EnseignantSerializer
    permission_classes = [AllowAny]

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

class UserLoginView(generics.CreateAPIView):
    serializer_class = UserLoginSerializer
    permission_classes = [AllowAny]
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data
        user_data = UserSerializer(user).data

        return Response(user_data)

class UserLogoutView(generics.CreateAPIView):
    serializer_class = UserLogoutSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
