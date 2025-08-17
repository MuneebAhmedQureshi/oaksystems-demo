"""automation_ai URL Configuration"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from django.shortcuts import redirect

def api_root(request):
    """API root endpoint with information about available endpoints"""
    return JsonResponse({
        'message': 'Process Automation Assessment API',
        'version': '1.0.0',
        'endpoints': {
            'authentication': '/api/auth/',
            'tasks': '/api/tasks/',
            'automation': '/api/automation/',
            'ai_features': '/api/ai/',
            'admin': '/admin/',
        },
        'frontend': 'http://localhost:3000',
        'documentation': '/api/docs/' if settings.DEBUG else None
    })

def root_redirect(request):
    """Redirect root to frontend in development"""
    if settings.DEBUG:
        return redirect('http://localhost:3000')
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
