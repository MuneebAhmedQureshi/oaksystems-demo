from django.contrib import admin
from .models import ProcessAssessment, AssessmentReport, ProcessCategory


@admin.register(ProcessAssessment)
class ProcessAssessmentAdmin(admin.ModelAdmin):
    list_display = [
        'process_name', 'department', 'total_score', 'automation_suitability', 
        'priority', 'assessed_by', 'created_at'
    ]
    list_filter = [
        'automation_suitability', 'priority', 'department', 
        'implementation_effort', 'created_at'
    ]
    search_fields = ['process_name', 'description', 'department', 'process_owner']
    readonly_fields = ['total_score', 'automation_suitability', 'priority']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('process_name', 'description', 'department', 'process_owner')
        }),
        ('Assessment Scores', {
            'fields': (
                ('repetitiveness_score', 'repetitiveness_remarks'),
                ('rule_based_score', 'rule_based_remarks'),
                ('complexity_score', 'complexity_remarks'),
                ('volume_score', 'volume_remarks'),
                ('standardization_score', 'standardization_remarks'),
                ('current_errors_score', 'current_errors_remarks'),
            )
        }),
        ('Results', {
            'fields': ('total_score', 'automation_suitability', 'priority')
        }),
        ('Additional Information', {
            'fields': ('estimated_cost_savings', 'estimated_time_savings', 'implementation_effort')
        }),
        ('Metadata', {
            'fields': ('assessed_by', 'created_at', 'updated_at')
        })
    )
    
    def get_readonly_fields(self, request, obj=None):
        readonly_fields = list(self.readonly_fields)
        if obj:  # editing an existing object
            readonly_fields.extend(['assessed_by', 'created_at', 'updated_at'])
        return readonly_fields


@admin.register(AssessmentReport)
class AssessmentReportAdmin(admin.ModelAdmin):
    list_display = ['title', 'generated_by', 'assessment_count', 'created_at']
    list_filter = ['created_at', 'generated_by']
    search_fields = ['title', 'description']
    filter_horizontal = ['assessments']
    readonly_fields = ['created_at']
    
    def assessment_count(self, obj):
        return obj.assessments.count()
    assessment_count.short_description = 'Number of Assessments'


@admin.register(ProcessCategory)
class ProcessCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'description', 'color', 'created_at']
    search_fields = ['name', 'description']
    list_filter = ['created_at']
