from django.urls import path

from .views import RosterListCreateAPIView,RosterRetrieveUpdateDestroyAPIView, get_shift_type_list
urlpatterns = [
    
    path('rosters/', RosterListCreateAPIView.as_view(), name='roster-list-create'),
    path('rosters/shift-types/', get_shift_type_list, name='shift-types-list'),
    path('rosters/<int:pk>/', RosterRetrieveUpdateDestroyAPIView.as_view(), name='shift-retrieve-update-destroy'),
]