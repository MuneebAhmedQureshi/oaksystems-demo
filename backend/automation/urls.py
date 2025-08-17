from django.urls import path
from . import views

urlpatterns = [
    path('templates/', views.AutomationTemplateListView.as_view(), name='template-list'),
    path('recommendations/', views.generate_recommendation, name='generate-recommendation'),
]
