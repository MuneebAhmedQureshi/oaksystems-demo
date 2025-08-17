from django.urls import path
from . import views

urlpatterns = [
    path('similarity-analysis/', views.analyze_process_similarity, name='similarity-analysis'),
    path('predict-success/', views.predict_automation_success, name='predict-success'),
    path('optimization-suggestions/', views.generate_optimization_suggestions, name='optimization-suggestions'),
    path('analysis-history/', views.get_analysis_history, name='analysis-history'),
]
