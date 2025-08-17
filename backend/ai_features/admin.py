from django.contrib import admin
from .models import ProcessAnalysis, MLModel


@admin.register(ProcessAnalysis)
class ProcessAnalysisAdmin(admin.ModelAdmin):
    list_display = ['process_name', 'analysis_type', 'confidence_score', 'analyzed_by', 'created_at']
    list_filter = ['analysis_type', 'created_at']
    search_fields = ['process_name', 'analyzed_by__username']


@admin.register(MLModel)
class MLModelAdmin(admin.ModelAdmin):
    list_display = ['name', 'version', 'model_type', 'accuracy', 'is_active', 'training_date']
    list_filter = ['model_type', 'is_active', 'training_date']
    search_fields = ['name', 'model_type']
