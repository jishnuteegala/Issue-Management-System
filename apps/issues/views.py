from rest_framework import generics
from .models import Issue
from .serializers import IssueSerializer

class IssueListCreateView(generics.ListCreateAPIView):
    '''
    ListCreateAPIView is a generic view that provides both the read and write operations for a model.
    It is used to list all the issues and create a new issue.
    '''
    # Define the queryset to fetch all the issues from the database and order them by the reported_at field in descending order
    queryset = Issue.objects.all().order_by('-reported_at')

    # Initialize the IssueSerializer class to serialize the Issue model
    serializer_class = IssueSerializer

class IssueDetailView(generics.RetrieveUpdateDestroyAPIView):
    '''
    RetrieveUpdateDestroyAPIView is a generic view that provides the read, update, and delete operations for a model.
    It is used to retrieve a specific issue, update its details, and delete it.
    '''
    # Define the queryset to fetch all the issues from the database
    queryset = Issue.objects.all()

    # Initialize the IssueSerializer class to serialize the Issue model
    serializer_class = IssueSerializer

    def perform_update(self, serializer):
        '''
        Method to perform the update operation when updating an issue
        '''
        # Set the updated_by field to the user who updated the issue
        serializer.save(updated_by=self.request.user)
