from rest_framework import serializers
from .models import AutomationTemplate, AutomationRecommendation


class AutomationTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AutomationTemplate
        fields = '__all__'


class AutomationRecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AutomationRecommendation
        fields = '__all__'
        read_only_fields = ['generated_for', 'generated_at']
