from django.contrib import admin
from .models import AutomationTemplate, AutomationRecommendation


@admin.register(AutomationTemplate)
class AutomationTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'created_at']
    list_filter = ['category', 'created_at']
    search_fields = ['name', 'description', 'category']


@admin.register(AutomationRecommendation)
class AutomationRecommendationAdmin(admin.ModelAdmin):
    list_display = ['process_name', 'current_score', 'generated_for', 'generated_at']
    list_filter = ['current_score', 'generated_at']
    search_fields = ['process_name', 'generated_for__username']
    readonly_fields = ['generated_at']
