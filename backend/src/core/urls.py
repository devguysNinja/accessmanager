from django.urls import path
from .views import (
    TransactionReportApiView,
    TransactionView,
    get_restaurant_transaction_details,
    get_drink_list,
    drink_transaction,
    transaction_report_export_data,
)


urlpatterns = [
    path(
        "transactions/reports/export-to-file/",
        transaction_report_export_data,
        name="transaction_report_export_api_view",
    ),
    path(
        "transactions/reports/",
        TransactionReportApiView.as_view(),
        name="transaction_report_api_view",
    ),
    path(
        "transactions-old/",
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
        get_restaurant_transaction_details,
        name="owner_transaction_api_view",
    ),
    path(
        "drink-list",
        get_drink_list,
        name="drink_list_api_view",
    ),
    path(
        "drink-cart",
        drink_transaction,
        name="drink_cart_api_view",
    ),
]
