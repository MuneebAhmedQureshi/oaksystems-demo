from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Avg
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import pandas as pd

from tasks.models import ProcessAssessment
from .models import ProcessAnalysis


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def analyze_process_similarity(request):
    """Find similar processes using ML clustering"""
    try:
        user_assessments = ProcessAssessment.objects.filter(assessed_by=request.user)
        
        if user_assessments.count() < 3:
            return Response({
                'error': 'Need at least 3 assessments for similarity analysis'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Prepare data for clustering
        data = []
        process_names = []
        
        for assessment in user_assessments:
            data.append([
                assessment.repetitiveness_score,
                assessment.rule_based_score,
                assessment.complexity_score,
                assessment.volume_score,
                assessment.standardization_score,
                assessment.current_errors_score
            ])
            process_names.append(assessment.process_name)
        
        # Perform clustering
        scaler = StandardScaler()
        scaled_data = scaler.fit_transform(data)
        
        n_clusters = min(3, len(data) // 2)  # Reasonable number of clusters
        kmeans = KMeans(n_clusters=n_clusters, random_state=42)
        clusters = kmeans.fit_predict(scaled_data)
        
        # Organize results
        cluster_groups = {}
        for i, (process_name, cluster) in enumerate(zip(process_names, clusters)):
            if cluster not in cluster_groups:
                cluster_groups[cluster] = []
            cluster_groups[cluster].append({
                'process_name': process_name,
                'scores': data[i],
                'total_score': sum(data[i])
            })
        
        # Generate insights
        insights = []
        for cluster_id, processes in cluster_groups.items():
            if len(processes) > 1:
                avg_score = np.mean([p['total_score'] for p in processes])
                insights.append({
                    'cluster_id': cluster_id,
                    'processes': [p['process_name'] for p in processes],
                    'average_score': round(avg_score, 1),
                    'insight': f"These {len(processes)} processes have similar automation characteristics"
                })
        
        # Save analysis
        analysis = ProcessAnalysis.objects.create(
            process_name="Similarity Analysis",
            analysis_type='similarity',
            input_data={'processes_analyzed': process_names},
            analysis_results={'clusters': cluster_groups, 'insights': insights},
            confidence_score=0.8,  # Static confidence for demo
            analyzed_by=request.user
        )
        
        return Response({
            'analysis_id': analysis.id,
            'insights': insights,
            'cluster_groups': cluster_groups
        })
    
    except Exception as e:
        return Response({
            'error': f'Analysis failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def predict_automation_success(request):
    """Predict automation success probability"""
    scores = request.data.get('scores', {})
    
    if not scores:
        return Response({
            'error': 'Process scores required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Simple ML-like prediction based on weighted factors
    weights = {
        'repetitiveness_score': 0.2,
        'rule_based_score': 0.25,
        'complexity_score': 0.15,
        'volume_score': 0.15,
        'standardization_score': 0.15,
        'current_errors_score': 0.1
    }
    
    weighted_score = sum(scores.get(factor, 0) * weight for factor, weight in weights.items())
    
    # Convert to probability (0-100%)
    success_probability = min(100, (weighted_score / 5) * 100)
    
    # Generate recommendations based on probability
    if success_probability >= 80:
        recommendation = "High success probability - proceed with automation"
        risk_factors = []
    elif success_probability >= 60:
        recommendation = "Good success probability - consider pilot implementation"
        risk_factors = ["Monitor complexity during implementation", "Ensure stakeholder buy-in"]
    else:
        recommendation = "Lower success probability - improve process first"
        risk_factors = ["Address process standardization", "Clarify business rules", "Reduce complexity"]
    
    analysis = ProcessAnalysis.objects.create(
        process_name=request.data.get('process_name', 'Unknown Process'),
        analysis_type='prediction',
        input_data=scores,
        analysis_results={
            'success_probability': success_probability,
            'recommendation': recommendation,
            'risk_factors': risk_factors
        },
        confidence_score=0.85,
        analyzed_by=request.user
    )
    
    return Response({
        'analysis_id': analysis.id,
        'success_probability': round(success_probability, 1),
        'recommendation': recommendation,
        'risk_factors': risk_factors,
        'confidence': 85
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_optimization_suggestions(request):
    """Generate AI-powered optimization suggestions"""
    scores = request.data.get('scores', {})
    process_name = request.data.get('process_name', 'Unknown Process')
    
    suggestions = []
    priority_order = []
    
    # Analyze each factor and suggest improvements
    if scores.get('repetitiveness_score', 0) < 4:
        suggestions.append({
            'factor': 'Repetitiveness',
            'current_score': scores.get('repetitiveness_score', 0),
            'suggestion': 'Consider batching similar tasks or scheduling regular execution cycles',
            'potential_improvement': '+1-2 points',
            'priority': 'high' if scores.get('repetitiveness_score', 0) < 3 else 'medium'
        })
    
    if scores.get('rule_based_score', 0) < 4:
        suggestions.append({
            'factor': 'Rule-Based Logic',
            'current_score': scores.get('rule_based_score', 0),
            'suggestion': 'Document decision trees and business rules clearly',
            'potential_improvement': '+1-2 points',
            'priority': 'high'
        })
    
    if scores.get('complexity_score', 0) < 3:
        suggestions.append({
            'factor': 'Complexity',
            'current_score': scores.get('complexity_score', 0),
            'suggestion': 'Break process into smaller sub-processes or simplify exception handling',
            'potential_improvement': '+1-3 points',
            'priority': 'high'
        })
    
    if scores.get('standardization_score', 0) < 4:
        suggestions.append({
            'factor': 'Standardization',
            'current_score': scores.get('standardization_score', 0),
            'suggestion': 'Create templates and standardize input/output formats',
            'potential_improvement': '+1-2 points',
            'priority': 'medium'
        })
    
    # Sort by priority
    high_priority = [s for s in suggestions if s['priority'] == 'high']
    medium_priority = [s for s in suggestions if s['priority'] == 'medium']
    
    analysis = ProcessAnalysis.objects.create(
        process_name=process_name,
        analysis_type='optimization',
        input_data=scores,
        analysis_results={
            'suggestions': suggestions,
            'high_priority_count': len(high_priority),
            'medium_priority_count': len(medium_priority)
        },
        confidence_score=0.9,
        analyzed_by=request.user
    )
    
    return Response({
        'analysis_id': analysis.id,
        'high_priority_suggestions': high_priority,
        'medium_priority_suggestions': medium_priority,
        'total_suggestions': len(suggestions)
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_analysis_history(request):
    """Get user's analysis history"""
    analyses = ProcessAnalysis.objects.filter(analyzed_by=request.user)
    
    history = []
    for analysis in analyses:
        history.append({
            'id': analysis.id,
            'process_name': analysis.process_name,
            'analysis_type': analysis.get_analysis_type_display(),
            'confidence_score': analysis.confidence_score,
            'created_at': analysis.created_at,
            'results_summary': analysis.analysis_results
        })
    
    return Response(history)
