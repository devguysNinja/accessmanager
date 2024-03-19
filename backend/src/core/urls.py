from django.urls import path
from .views import (TransactionView, 
	get_restaurant_transaction_details,
	get_drink_list,
	drink_transaction
	)


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
