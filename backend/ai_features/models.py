from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class ProcessAnalysis(models.Model):
    """AI analysis results for processes"""
    process_name = models.CharField(max_length=200)
    analysis_type = models.CharField(max_length=50, choices=[
        ('similarity', 'Similarity Analysis'),
        ('optimization', 'Optimization Suggestions'),
        ('prediction', 'Automation Success Prediction'),
    ])
    
    input_data = models.JSONField()
    analysis_results = models.JSONField()
    confidence_score = models.FloatField()
    
    analyzed_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.analysis_type} for {self.process_name}"


class MLModel(models.Model):
    """Machine learning model metadata"""
    name = models.CharField(max_length=100)
    version = models.CharField(max_length=20)
    model_type = models.CharField(max_length=50)
    accuracy = models.FloatField()
    training_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.name} v{self.version}"
