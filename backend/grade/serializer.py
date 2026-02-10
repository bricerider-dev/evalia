from rest_framework import serializers
from .models import Grade
from academic.models import UniteEnseignement
from academic.serializer import UniteSerialization

class GradeSerializer(serializers.ModelSerializer):
   
    class Meta:
        model = Grade
        fields = '__all__'
        read_only_fields = ['id', 'createdAt', 'updatedAt', 'final_grade', 'statut']
    
    def create(self, validated_data):
        grade = Grade.objects.create(**validated_data)
        grade.final_grade = grade.calculate_final_grade()
        grade.statut = grade.get_status()
        grade.save()
        return grade
    
    def update(self, instance, validated_data):
        instance.note = validated_data.get('note', instance.note)
        instance.final_grade = instance.calculate_final_grade()
        instance.statut = instance.get_status()
        instance.save()
        return instance
    def get_final_grade(self, obj):
        return obj.calculate_final_grade()
    
    def get_statut(self, obj):
        return obj.get_status()

class StudentGradeReportSerializer(serializers.ModelSerializer):
    studentId = serializers.PrimaryKeyRelatedField(source='etudiant', queryset=Grade._meta.get_field('etudiant').remote_field.model.objects.all())
    ue = serializers.SerializerMethodField()
    overall_average = serializers.FloatField()

    def get_ue(self, obj):
        ue_data = []
        for ue_info in obj['ue']:
            ue_data.append({
                'ue': UniteSerialization(ue_info['ue']).data,                
                'grade': GradeSerializer(ue_info['grade'], many=True).data,
                'final_grade': ue_info['final_grade'],
                'status': ue_info['status']
            })
        return ue_data

    

