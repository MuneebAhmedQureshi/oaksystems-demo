from django.urls import path
from . import views

urlpatterns = [
    # Process Assessments
    path('assessments/', views.ProcessAssessmentListCreateView.as_view(), name='assessment-list-create'),
    path('assessments/<int:pk>/', views.ProcessAssessmentDetailView.as_view(), name='assessment-detail'),
    path('assessments/bulk/', views.bulk_assessment, name='bulk-assessment'),
    
    # Reports
    path('reports/', views.AssessmentReportListCreateView.as_view(), name='report-list-create'),
    path('reports/<int:pk>/', views.AssessmentReportDetailView.as_view(), name='report-detail'),
    path('reports/<int:report_id>/ai-conclusion/', views.generate_ai_conclusion, name='generate-ai-conclusion'),
    path('reports/<int:report_id>/download/csv/', views.download_report_csv, name='download-report-csv'),
    path('reports/<int:report_id>/download/pdf/', views.download_report_pdf, name='download-report-pdf'),
    
    # Dashboard
    path('dashboard/stats/', views.dashboard_stats, name='dashboard-stats'),
    
    # Categories
    path('categories/', views.ProcessCategoryListCreateView.as_view(), name='category-list-create'),
]
