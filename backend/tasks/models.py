from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator

User = get_user_model()


class ProcessAssessment(models.Model):
    """Main model for process automation assessment"""
    
    AUTOMATION_SUITABILITY_CHOICES = [
        ('not_suitable', 'Not Suitable for Automation'),
        ('possibly_automatable', 'Possibly Automatable'),
        ('highly_automatable', 'Highly Automatable'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]

    # Basic Information
    process_name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    department = models.CharField(max_length=100, blank=True)
    process_owner = models.CharField(max_length=100, blank=True)
    
    # Assessment Factors (1-5 scale)
    repetitiveness_score = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="How frequently is the process executed? (1=Rarely, 5=Daily)"
    )
    repetitiveness_remarks = models.TextField(blank=True)
    
    rule_based_score = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Is the process deterministic with clear rules? (1=Requires judgment, 5=Rule-based)"
    )
    rule_based_remarks = models.TextField(blank=True)
    
    complexity_score = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Process complexity (1=Very complex, 5=Simple)"
    )
    complexity_remarks = models.TextField(blank=True)
    
    volume_score = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Transaction volume (1=Low volume, 5=High volume)"
    )
    volume_remarks = models.TextField(blank=True)
    
    standardization_score = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Input/output standardization (1=Highly variable, 5=Standardized)"
    )
    standardization_remarks = models.TextField(blank=True)
    
    current_errors_score = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Manual error rate (1=Low errors, 5=High errors)"
    )
    current_errors_remarks = models.TextField(blank=True)
    
    # Calculated Fields
    total_score = models.IntegerField(editable=False)
    automation_suitability = models.CharField(
        max_length=25, 
        choices=AUTOMATION_SUITABILITY_CHOICES,
        editable=False
    )
    priority = models.CharField(
        max_length=10, 
        choices=PRIORITY_CHOICES,
        editable=False
    )
    
    # Additional Information
    estimated_cost_savings = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        help_text="Estimated annual cost savings in USD"
    )
    estimated_time_savings = models.DecimalField(
        max_digits=8, decimal_places=2, null=True, blank=True,
        help_text="Estimated time savings in hours per week"
    )
    implementation_effort = models.CharField(
        max_length=50,
        choices=[
            ('low', 'Low (1-2 weeks)'),
            ('medium', 'Medium (1-2 months)'),
            ('high', 'High (3+ months)'),
        ],
        blank=True
    )
    
    # Metadata
    assessed_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-total_score', '-created_at']
        
    def save(self, *args, **kwargs):
        # Calculate total score
        self.total_score = (
            self.repetitiveness_score +
            self.rule_based_score +
            self.complexity_score +
            self.volume_score +
            self.standardization_score +
            self.current_errors_score
        )
        
        # Determine automation suitability
        if self.total_score <= 10:
            self.automation_suitability = 'not_suitable'
            self.priority = 'low'
        elif self.total_score <= 20:
            self.automation_suitability = 'possibly_automatable'
            self.priority = 'medium'
        else:
            self.automation_suitability = 'highly_automatable'
            self.priority = 'high'
            
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.process_name} ({self.total_score}/30)"
    
    @property
    def automation_suitability_display(self):
        return dict(self.AUTOMATION_SUITABILITY_CHOICES)[self.automation_suitability]
    
    @property
    def priority_display(self):
        return dict(self.PRIORITY_CHOICES)[self.priority]
    
    @property
    def recommendation(self):
        if self.automation_suitability == 'not_suitable':
            return "Process is too complex, infrequent, or rule-ambiguous. Keep it manual."
        elif self.automation_suitability == 'possibly_automatable':
            return "Process has some potential for automation, but may require human intervention. Consider semi-automation."
        else:
            return "Process is repetitive, rule-based, and structured—ideal for full automation!"


class AssessmentReport(models.Model):
    """Report containing multiple process assessments"""
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    assessments = models.ManyToManyField(ProcessAssessment)
    generated_by = models.ForeignKey(User, on_delete=models.CASCADE)
    ai_conclusion = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.assessments.count()} processes"
    
    @property
    def highly_automatable_count(self):
        return self.assessments.filter(automation_suitability='highly_automatable').count()
    
    @property
    def possibly_automatable_count(self):
        return self.assessments.filter(automation_suitability='possibly_automatable').count()
    
    @property
    def not_suitable_count(self):
        return self.assessments.filter(automation_suitability='not_suitable').count()


class ProcessCategory(models.Model):
    """Categories for organizing processes"""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    color = models.CharField(max_length=7, default='#007bff')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = "Process Categories"
    
    def __str__(self):
        return self.name