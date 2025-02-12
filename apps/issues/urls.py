from django.urls import path
from .views import IssueListCreateView, IssueDetailView

# Define the URL patterns for the issues app using the IssueListCreateView and IssueDetailView views
# The URL patterns are used to route the HTTP requests to the appropriate views
# The IssueListCreateView is used for listing all the issues and creating a new issue
# The IssueDetailView is used for retrieving, updating, and deleting a specific issue
urlpatterns = [
    path('', IssueListCreateView.as_view(), name='issue-list-create'),
    path('<int:pk>/', IssueDetailView.as_view(), name='issue-detail'),
]
