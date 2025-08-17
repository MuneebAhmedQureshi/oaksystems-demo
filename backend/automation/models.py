from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class AutomationTemplate(models.Model):
    """Pre-defined templates for common automation scenarios"""
    name = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=100)
    
    # Default scoring suggestions
    default_repetitiveness = models.IntegerField(default=3)
    default_rule_based = models.IntegerField(default=3)
    default_complexity = models.IntegerField(default=3)
    default_volume = models.IntegerField(default=3)
    default_standardization = models.IntegerField(default=3)
    default_current_errors = models.IntegerField(default=3)
    
    # Guidance text
    guidance_text = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name


class AutomationRecommendation(models.Model):
    """AI-generated recommendations for specific processes"""
    process_name = models.CharField(max_length=200)
    current_score = models.IntegerField()
    recommended_improvements = models.TextField()
    estimated_impact = models.TextField()
    implementation_steps = models.TextField()
    
    generated_at = models.DateTimeField(auto_now_add=True)
    generated_for = models.ForeignKey(User, on_delete=models.CASCADE)
    
    def __str__(self):
        return f"Recommendation for {self.process_name}"
