from django.urls import path
from .views import TransactionView, get_owner_transaction_details, get_drink_list


urlpatterns = [
    path(
        "transactions/",
        TransactionView.as_view(),
        name="transaction_list_api_view",
    ),
    path(
        "transactions/access-control",
        TransactionView.as_view(),
        name="transaction_create_api_view",
    ),
    path(
        "transactions/owner-details",
        get_owner_transaction_details,
        name="owner_transaction_api_view",
    ),
    path(
        "drink-list",
        get_drink_list,
        name="drink_list_api_view",
    ),
]
