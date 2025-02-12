from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from .models import Issue

class IssueAPITest(APITestCase):
    '''
    Test case for the Issue API endpoints
    '''
    def setUp(self):
        '''
        Method to set up the test case
        '''

        # Create a new user for the test case
        self.user = User.objects.create_user(username='testuser', password='password')
        # Log in the user
        self.client.login(username='testuser', password='password')
        # Create a new issue for the test case
        self.issue = Issue.objects.create(
            title="Test Issue",
            description="Test description",
            category="pothole",
            reported_by=self.user,
        )
    
    def test_issue_creation(self):
        '''
        Test to verify that a new issue can be created using the API
        '''

        # Define the URL for the issue list endpoint
        url = reverse('issue-list-create')

        # Define the data to be sent in the POST request to create a new issue
        data = {
            "title": "New Issue",
            "description": "A new pothole needs fixing",
            "category": "pothole",
            "reported_by": self.user.id
        }

        # Send a POST request to create a new issue
        response = self.client.post(url, data, format='json')

        # Verify that the response status code is 201 (Created)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    

    def test_issue_retrieval(self):
        '''
        Test to verify that an existing issue can be retrieved
        '''

        # Define the URL for the issue detail endpoint
        url = reverse('issue-detail', args=[self.issue.id])

        # Send a GET request to retrieve the existing issue
        response = self.client.get(url)

        # Verify that the response status code is 200 (OK)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
