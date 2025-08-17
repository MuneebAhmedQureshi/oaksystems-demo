from rest_framework import serializers
from .models import ProcessAssessment, AssessmentReport, ProcessCategory


class ProcessAssessmentSerializer(serializers.ModelSerializer):
    automation_suitability_display = serializers.ReadOnlyField()
    priority_display = serializers.ReadOnlyField()
    recommendation = serializers.ReadOnlyField()
    
    class Meta:
        model = ProcessAssessment
        fields = [
            'id', 'process_name', 'description', 'department', 'process_owner',
            'repetitiveness_score', 'repetitiveness_remarks',
            'rule_based_score', 'rule_based_remarks',
            'complexity_score', 'complexity_remarks',
            'volume_score', 'volume_remarks',
            'standardization_score', 'standardization_remarks',
            'current_errors_score', 'current_errors_remarks',
            'total_score', 'automation_suitability', 'automation_suitability_display',
            'priority', 'priority_display', 'recommendation',
            'estimated_cost_savings', 'estimated_time_savings', 'implementation_effort',
            'assessed_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ['total_score', 'automation_suitability', 'priority', 'assessed_by']
    
    def create(self, validated_data):
        validated_data['assessed_by'] = self.context['request'].user
        return super().create(validated_data)


class ProcessAssessmentListSerializer(serializers.ModelSerializer):
    """Simplified serializer for list views"""
    automation_suitability_display = serializers.ReadOnlyField()
    priority_display = serializers.ReadOnlyField()
    assessed_by_name = serializers.CharField(source='assessed_by.get_full_name', read_only=True)
    
    class Meta:
        model = ProcessAssessment
        fields = [
            'id', 'process_name', 'department', 'total_score',
            'automation_suitability', 'automation_suitability_display',
            'priority', 'priority_display', 'assessed_by_name', 'created_at'
        ]


class AssessmentReportSerializer(serializers.ModelSerializer):
    assessments = ProcessAssessmentListSerializer(many=True, read_only=True)
    assessment_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    highly_automatable_count = serializers.ReadOnlyField()
    possibly_automatable_count = serializers.ReadOnlyField()
    not_suitable_count = serializers.ReadOnlyField()
    generated_by_name = serializers.CharField(source='generated_by.get_full_name', read_only=True)
    
    class Meta:
        model = AssessmentReport
        fields = [
            'id', 'title', 'description', 'assessments', 'assessment_ids',
            'generated_by', 'generated_by_name', 'ai_conclusion',
            'highly_automatable_count', 'possibly_automatable_count', 'not_suitable_count',
            'created_at'
        ]
        read_only_fields = ['generated_by', 'ai_conclusion']
    
    def create(self, validated_data):
        assessment_ids = validated_data.pop('assessment_ids', [])
        validated_data['generated_by'] = self.context['request'].user
        
        report = super().create(validated_data)
        
        if assessment_ids:
            assessments = ProcessAssessment.objects.filter(
                id__in=assessment_ids,
                assessed_by=self.context['request'].user
            )
            report.assessments.set(assessments)
        
        return report


class ProcessCategorySerializer(serializers.ModelSerializer):
    process_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ProcessCategory
        fields = ['id', 'name', 'description', 'color', 'process_count', 'created_at']
    
    def get_process_count(self, obj):
        # This would require adding a category field to ProcessAssessment model
        # For now, return 0
        return 0


class ProcessAssessmentStatsSerializer(serializers.Serializer):
    """Serializer for dashboard statistics"""
    total_processes = serializers.IntegerField()
    highly_automatable = serializers.IntegerField()
    possibly_automatable = serializers.IntegerField()
    not_suitable = serializers.IntegerField()
    average_score = serializers.FloatField()
    total_estimated_savings = serializers.DecimalField(max_digits=15, decimal_places=2)
    
    
class BulkAssessmentSerializer(serializers.Serializer):
    """Serializer for bulk assessment operations"""
    processes = ProcessAssessmentSerializer(many=True)
    
    def create(self, validated_data):
        processes_data = validated_data['processes']
        user = self.context['request'].user
        
        created_processes = []
        for process_data in processes_data:
            process_data['assessed_by'] = user
            process = ProcessAssessment.objects.create(**process_data)
            created_processes.append(process)
        
        return {'processes': created_processes}
