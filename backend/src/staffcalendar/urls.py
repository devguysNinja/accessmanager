from django.urls import path

from .views import RosterListCreateAPIView,RosterRetrieveUpdateDestroyAPIView
urlpatterns = [
    
    path('rosters/', RosterListCreateAPIView.as_view(), name='shift-list-create'),
    path('rosters/<int:pk>/', RosterRetrieveUpdateDestroyAPIView.as_view(), name='shift-retrieve-update-destroy'),
]