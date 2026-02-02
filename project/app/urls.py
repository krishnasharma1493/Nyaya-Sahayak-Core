from django.urls import path
from .views import home, analyze_document, chat, clear_history, legal_console, health_check, verify_document, draft_legal_notice, tools_dashboard

urlpatterns = [
    path('', name='home', view=home),
    path('legal-console/', legal_console, name='legal_console'),
    path('api/chat/', chat, name='chat'),
    path('api/clear-history/', clear_history, name='clear_history'),
    path('api/analyze/', analyze_document, name='analyze_document'),
    path('api/verify-document/', verify_document, name='verify_document'),
    path('api/draft-notice/', draft_legal_notice, name='draft_legal_notice'),
    path('dashboard/tools/', tools_dashboard, name='tools_dashboard'),
    path('api/health/', health_check, name='health_check'),
    # Aliases for frontend navigation
    path('chat/', legal_console, name='chat_view'),
    path('tools/notice-generator/', tools_dashboard, name='notice_generator'),
]

