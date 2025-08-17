"""automation_ai URL Configuration"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from django.shortcuts import redirect, render

def api_root(request):
    """API root endpoint with information about available endpoints"""
    base_url = f"{request.scheme}://{request.get_host()}"
    
    return JsonResponse({
        'message': 'Process Automation Assessment Tool - Backend API',
        'version': '1.0.0',
        'description': 'Django REST API for process automation assessment and AI-powered analysis',
        'status': 'active',
        'backend_interfaces': {
            'django_admin': f'{base_url}/admin/',
            'api_root': f'{base_url}/api/',
        },
        'api_endpoints': {
            'authentication': f'{base_url}/api/auth/',
            'tasks_and_reports': f'{base_url}/api/tasks/',
            'automation_templates': f'{base_url}/api/automation/',
            'ai_features': f'{base_url}/api/ai/',
        },
        'frontend_application': 'http://localhost:3000',
        'key_features': [
            'Process automation assessment scoring',
            'AI-powered similarity analysis',
            'Automation success prediction',
            'Optimization suggestions',
            'Report generation (PDF/CSV)',
            'User authentication & management'
        ],
        'quick_links': {
            'create_superuser': 'python manage.py createsuperuser',
            'access_admin': f'{base_url}/admin/',
            'view_assessments': f'{base_url}/api/tasks/assessments/',
            'ai_analysis': f'{base_url}/api/ai/similarity-analysis/',
        },
        'documentation': f'{base_url}/api/docs/' if settings.DEBUG else None,
        'environment': 'development' if settings.DEBUG else 'production'
    })

def root_redirect(request):
    """Show backend information and links"""
    # Check if request accepts HTML (browser) or JSON (API client)
    if 'text/html' in request.META.get('HTTP_ACCEPT', ''):
        return render(request, 'api_root.html')
    return api_root(request)

urlpatterns = [
    path('', root_redirect, name='root'),
    path('api/', api_root, name='api-root'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/tasks/', include('tasks.urls')),
    path('api/automation/', include('automation.urls')),
    path('api/ai/', include('ai_features.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
