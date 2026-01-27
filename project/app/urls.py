from django.urls import path
from .views import home, analyze_document, chat_query, verify_contract, legal_console

urlpatterns = [
    path('', name='home', view=home),
    path('api/analyze/', analyze_document, name='analyze_document'),
    path('api/chat/', chat_query, name='chat_query'),
    path('api/verify-contract/', verify_contract, name='verify_contract'),
    path('legal-console/', legal_console, name='legal_console'),
]

