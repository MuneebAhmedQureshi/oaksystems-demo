from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Avg, Sum, Count
from django.http import HttpResponse
from django.template.loader import get_template
from django.utils import timezone
import csv
import io
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

from .models import ProcessAssessment, AssessmentReport, ProcessCategory
from .serializers import (
    ProcessAssessmentSerializer,
    ProcessAssessmentListSerializer,
    AssessmentReportSerializer,
    ProcessCategorySerializer,
    ProcessAssessmentStatsSerializer,
    BulkAssessmentSerializer
)


class ProcessAssessmentListCreateView(generics.ListCreateAPIView):
    """List all process assessments or create a new one"""
    serializer_class = ProcessAssessmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return ProcessAssessment.objects.filter(assessed_by=self.request.user)
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return ProcessAssessmentListSerializer
        return ProcessAssessmentSerializer


class ProcessAssessmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a process assessment"""
    serializer_class = ProcessAssessmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return ProcessAssessment.objects.filter(assessed_by=self.request.user)


class AssessmentReportListCreateView(generics.ListCreateAPIView):
    """List all reports or create a new one"""
    serializer_class = AssessmentReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return AssessmentReport.objects.filter(generated_by=self.request.user)


class AssessmentReportDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a report"""
    serializer_class = AssessmentReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return AssessmentReport.objects.filter(generated_by=self.request.user)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_stats(request):
    """Get dashboard statistics"""
    user_assessments = ProcessAssessment.objects.filter(assessed_by=request.user)
    
    stats = {
        'total_processes': user_assessments.count(),
        'highly_automatable': user_assessments.filter(automation_suitability='highly_automatable').count(),
        'possibly_automatable': user_assessments.filter(automation_suitability='possibly_automatable').count(),
        'not_suitable': user_assessments.filter(automation_suitability='not_suitable').count(),
        'average_score': user_assessments.aggregate(avg_score=Avg('total_score'))['avg_score'] or 0,
        'total_estimated_savings': user_assessments.aggregate(
            total_savings=Sum('estimated_cost_savings')
        )['total_savings'] or 0,
    }
    
    serializer = ProcessAssessmentStatsSerializer(stats)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def bulk_assessment(request):
    """Create multiple assessments at once"""
    serializer = BulkAssessmentSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        result = serializer.save()
        return Response({
            'message': f'Successfully created {len(result["processes"])} assessments',
            'processes': ProcessAssessmentListSerializer(result['processes'], many=True).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def generate_ai_conclusion(request, report_id):
    """Generate AI conclusion for a report"""
    try:
        report = AssessmentReport.objects.get(id=report_id, generated_by=request.user)
        
        # Simple AI conclusion generation based on statistics
        highly_automatable = report.highly_automatable_count
        possibly_automatable = report.possibly_automatable_count
        not_suitable = report.not_suitable_count
        total = highly_automatable + possibly_automatable + not_suitable
        
        if total == 0:
            conclusion = "No processes have been assessed yet."
        else:
            conclusion = f"""Based on this assessment, {highly_automatable} processes are highly automatable, {possibly_automatable} are partially automatable, and {not_suitable} should remain manual. 

Prioritization should focus on high-impact areas to maximize efficiency and cost savings. 

Key Recommendations:
- Immediately implement automation for highly automatable processes ({highly_automatable}/{total} = {(highly_automatable/total*100):.1f}%)
- Consider semi-automation for processes with medium scores
- Continue manual operations for complex processes requiring human judgment

Expected Benefits:
- Reduced manual errors and processing time
- Improved consistency and standardization
- Cost savings through reduced labor requirements
- Enhanced employee satisfaction by eliminating repetitive tasks"""
        
        report.ai_conclusion = conclusion
        report.save()
        
        return Response({'ai_conclusion': conclusion})
    
    except AssessmentReport.DoesNotExist:
        return Response({'error': 'Report not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def download_report_csv(request, report_id):
    """Download report as CSV"""
    try:
        report = AssessmentReport.objects.get(id=report_id, generated_by=request.user)
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{report.title}_report.csv"'
        
        writer = csv.writer(response)
        writer.writerow([
            'Process Name', 'Department', 'Repetitiveness', 'Rule-Based', 'Complexity',
            'Volume', 'Standardization', 'Error Rate', 'Total Score',
            'Automation Suitability', 'Priority', 'Recommendation'
        ])
        
        for assessment in report.assessments.all():
            writer.writerow([
                assessment.process_name,
                assessment.department,
                assessment.repetitiveness_score,
                assessment.rule_based_score,
                assessment.complexity_score,
                assessment.volume_score,
                assessment.standardization_score,
                assessment.current_errors_score,
                assessment.total_score,
                assessment.automation_suitability_display,
                assessment.priority_display,
                assessment.recommendation
            ])
        
        return response
    
    except AssessmentReport.DoesNotExist:
        return Response({'error': 'Report not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def download_report_pdf(request, report_id):
    """Download report as PDF"""
    try:
        report = AssessmentReport.objects.get(id=report_id, generated_by=request.user)
        
        # Create PDF
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        elements = []
        
        # Styles
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=18,
            textColor=colors.darkblue,
            spaceAfter=30,
        )
        
        # Title
        elements.append(Paragraph(f"Process Automation Assessment Report", title_style))
        elements.append(Paragraph(f"Report: {report.title}", styles['Heading2']))
        elements.append(Paragraph(f"Generated: {timezone.now().strftime('%Y-%m-%d %H:%M')}", styles['Normal']))
        elements.append(Spacer(1, 20))
        
        # Summary
        elements.append(Paragraph("Summary", styles['Heading2']))
        summary_text = f"""
        Total Processes Assessed: {report.assessments.count()}<br/>
        Highly Automatable: {report.highly_automatable_count}<br/>
        Possibly Automatable: {report.possibly_automatable_count}<br/>
        Not Suitable for Automation: {report.not_suitable_count}
        """
        elements.append(Paragraph(summary_text, styles['Normal']))
        elements.append(Spacer(1, 20))
        
        # Assessment Table
        elements.append(Paragraph("Detailed Assessment", styles['Heading2']))
        
        table_data = [
            ['Process Name', 'Repetitiveness', 'Rule-Based', 'Complexity', 'Volume', 'Standardization', 'Error Rate', 'Total Score', 'Suitability']
        ]
        
        for assessment in report.assessments.all():
            table_data.append([
                assessment.process_name,
                str(assessment.repetitiveness_score),
                str(assessment.rule_based_score),
                str(assessment.complexity_score),
                str(assessment.volume_score),
                str(assessment.standardization_score),
                str(assessment.current_errors_score),
                str(assessment.total_score),
                assessment.automation_suitability_display
            ])
        
        table = Table(table_data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        elements.append(table)
        elements.append(Spacer(1, 20))
        
        # AI Conclusion
        if report.ai_conclusion:
            elements.append(Paragraph("AI-Generated Conclusion", styles['Heading2']))
            elements.append(Paragraph(report.ai_conclusion, styles['Normal']))
        
        doc.build(elements)
        
        response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{report.title}_report.pdf"'
        
        return response
    
    except AssessmentReport.DoesNotExist:
        return Response({'error': 'Report not found'}, status=status.HTTP_404_NOT_FOUND)


class ProcessCategoryListCreateView(generics.ListCreateAPIView):
    """List all categories or create a new one"""
    queryset = ProcessCategory.objects.all()
    serializer_class = ProcessCategorySerializer
    permission_classes = [permissions.IsAuthenticated]
