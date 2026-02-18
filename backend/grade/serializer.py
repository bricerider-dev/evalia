from rest_framework import serializers
from .models import Grade
from academic.models import UniteEnseignement
from academic.serializer import UniteSerialization

class GradeSerializer(serializers.ModelSerializer):
    """Serializer pour Grade avec calcul des notes et statut automatiques"""
    final_grade = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    evaluation_type = serializers.CharField(source='evaluation.type_evaluation', read_only=True)
    ue_code = serializers.CharField(source='evaluation.ue.code', read_only=True)
    student_name = serializers.CharField(source='etudiant.user.get_full_name', read_only=True)
    
    class Meta:
        model = Grade
        fields = [
            'id', 'evaluation', 'etudiant', 'grade', 'statut',
            'final_grade', 'status', 'evaluation_type', 'ue_code', 
            'student_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'final_grade', 'status']
        extra_kwargs = {
            'grade': {'min_value': 0, 'max_value': 20}
        }
    
    def get_final_grade(self, obj):
        """Retourne la note finale calculée"""
        return obj.calculate_final_grade()
    
    def get_status(self, obj):
        """Retourne le statut calculé"""
        return obj.get_status()
    
    def validate_grade(self, value):
        """Validation de la note"""
        if value is not None and (value < 0 or value > 20):
            raise serializers.ValidationError("La note doit être entre 0 et 20")
        return value
    
    def validate(self, data):
        """Validation du couple étudiant-évaluation pour création uniquement"""
        # Vérifier unicité uniquement lors de la création
        if not self.instance:
            evaluation = data.get('evaluation')
            etudiant = data.get('etudiant')
            
            if evaluation and etudiant:
                existing = Grade.objects.filter(
                    evaluation=evaluation,
                    etudiant=etudiant
                ).exists()
                if existing:
                    raise serializers.ValidationError(
                        "Une note existe déjà pour cet étudiant et cette évaluation."
                    )
        
        return data
    
    def create(self, validated_data):
        """Créer une note et initialiser le statut"""
        grade = Grade.objects.create(**validated_data)
        grade.update_status()
        return grade
    
    def update(self, instance, validated_data):
        """Mettre à jour une note et recalculer le statut"""
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        instance.update_status()
        return instance

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

    

