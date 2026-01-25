from django.urls import path
from .views import home, analyze_document, chat_query

urlpatterns = [
    path('', name='home', view=home),
    path('api/analyze/', analyze_document, name='analyze_document'),
    path('api/chat/', chat_query, name='chat_query'),
]
