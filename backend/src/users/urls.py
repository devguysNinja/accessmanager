from django.urls import path, re_path
from .views import (
    ProfileFieldChoicesView,
    RegisterView,
    LoginView,
    AuthUserView,
    LogoutView,
    UserProfileView,
    UserProfileDetailAPIView,
    UploadProfileImageView,
    bulk_create,
)


urlpatterns = [
    path("register", RegisterView.as_view(), name="register_api_view"),
    path("login", LoginView.as_view(), name="login_api_view"),
    path("auth-user", AuthUserView.as_view(), name="auth_user_view"),
    path("logout", LogoutView.as_view(), name="logout_api_view"),
    # re_path(r'^profiles/(?P<uid>[a-f0-9]{32})$', UserProfileDetailAPIView.as_view(), name='profile_get_update_delete_api_view'),
    path(
        "profiles/<str:id>",
        UserProfileDetailAPIView.as_view(),
        name="profile_get_update_delete_api_view",
    ),
    path(
        "profile-choices",
        ProfileFieldChoicesView.as_view(),
        name="profile_choices_api_view",
    ),
    path("profiles", UserProfileView.as_view(), name="profiles_list_create_api_view"),
    path("avatar", UploadProfileImageView.as_view(), name="avatar_api_view"),
    path("batch-loader", bulk_create, name="bulk_create_api_view"),
]

