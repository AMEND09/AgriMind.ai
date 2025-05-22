# your_app/urls.py
from django.urls import path
from .views import (
    ImportDataView, ExportDataView, # Assuming these are your existing views
    SaveLocalStorageView, LoadLocalStorageView,
    GeminiChatView, # Add GeminiChatView
    # Add other view imports here e.g., FarmListCreateView, FarmDetailView etc.
)
# from .views import UserLoginView, UserRegisterView # If you have custom login/register

urlpatterns = [
    # ... your existing API URLs ...
    # Example: path('farms/', FarmListCreateView.as_view(), name='farm-list-create'),
    # Example: path('login/', UserLoginView.as_view(), name='api_login'), # If you have custom login
    # Example: path('register/', UserRegisterView.as_view(), name='api_register'), # If you have custom register

    path('import/', ImportDataView.as_view(), name='import_data'),
    path('export/', ExportDataView.as_view(), name='export_data'),
    
    path('sync/localstorage/save/', SaveLocalStorageView.as_view(), name='save_local_storage'),
    path('sync/localstorage/load/', LoadLocalStorageView.as_view(), name='load_local_storage'),
    path('chat/gemini/', GeminiChatView.as_view(), name='gemini_chat'), # New URL for Gemini chat
]