from rest_framework import generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import AutomationTemplate, AutomationRecommendation
from .serializers import AutomationTemplateSerializer, AutomationRecommendationSerializer


class AutomationTemplateListView(generics.ListAPIView):
    """List all automation templates"""
    queryset = AutomationTemplate.objects.all()
    serializer_class = AutomationTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def generate_recommendation(request):
    """Generate automation recommendations based on process assessment"""
    process_name = request.data.get('process_name')
    current_score = request.data.get('current_score')
    factor_scores = request.data.get('factor_scores', {})
    
    # Simple recommendation logic
    recommendations = []
    
    if factor_scores.get('repetitiveness_score', 0) < 4:
        recommendations.append("Consider batching similar tasks to increase repetitiveness score")
    
    if factor_scores.get('rule_based_score', 0) < 4:
        recommendations.append("Document clear business rules and decision criteria")
    
    if factor_scores.get('complexity_score', 0) < 3:
        recommendations.append("Break down complex process into smaller, simpler sub-processes")
    
    if factor_scores.get('standardization_score', 0) < 4:
        recommendations.append("Standardize input formats and output templates")
    
    if not recommendations:
        recommendations.append("Process is well-suited for automation as-is")
    
    # Estimate impact
    if current_score >= 21:
        impact = "High impact - immediate automation recommended"
        steps = [
            "1. Define automation requirements",
            "2. Select appropriate automation tools",
            "3. Develop automation solution",
            "4. Test and validate",
            "5. Deploy and monitor"
        ]
    elif current_score >= 11:
        impact = "Medium impact - semi-automation or process improvement first"
        steps = [
            "1. Improve process standardization",
            "2. Document business rules",
            "3. Consider RPA or workflow automation",
            "4. Implement in phases"
        ]
    else:
        impact = "Low impact - keep manual or redesign process"
        steps = [
            "1. Analyze if process is necessary",
            "2. Consider process redesign",
            "3. Focus on other high-value processes first"
        ]
    
    recommendation = AutomationRecommendation.objects.create(
        process_name=process_name,
        current_score=current_score,
        recommended_improvements="; ".join(recommendations),
        estimated_impact=impact,
        implementation_steps="\n".join(steps),
        generated_for=request.user
    )
    
    serializer = AutomationRecommendationSerializer(recommendation)
    return Response(serializer.data)
