"""mealmanager URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.auth import views
from .views import index

urlpatterns = [
    path('danger-zone/', admin.site.urls),
    path('accounts/login/', views.LoginView.as_view(), name="login"),
    path('accounts/password-reset', views.PasswordResetView.as_view(), name="password_reset"),
    path('accounts/password-reset/done', views.PasswordResetDoneView.as_view(), name="password_reset_done"),
    path('accounts/reset-confirm/<uidb64>/<token>/', views.PasswordResetConfirmView.as_view(), name="password_reset_confirm"),
    path('accounts/reset/', views.PasswordResetCompleteView.as_view(), name="password_reset_complete"),
    path('api/v1/', include('users.urls')),
    path('api/v1/', include('core.urls')),
    path('api/v1/', include('staffcalendar.urls')),
    path('', index, name="index"),
]
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

admin.site.site_header = "Meal Manager Admin"
admin.site.site_title = "Admin Portal"
admin.site.index_title = "Welcome"
