from django.urls import path
from .views import UserListView, UserRegistrationView, UserLoginView, UserLogoutView

urlpatterns = [
    path('', UserListView.as_view(), name='user-list'),
    path('register/', UserRegistrationView.as_view(), name='user-register'),
    path('login/', UserLoginView.as_view(), name='user-login'),
    path('logout/', UserLogoutView.as_view(), name='user-logout'),
]
