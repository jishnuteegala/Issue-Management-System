from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from .models import Issue
from django.db import connection

class IssueAPITest(APITestCase):
    '''
    Test case for the Issue API endpoints
    '''
    def setUp(self):
        '''
        Method to set up the test case
        '''
        # Check if the test database exists and handle it
        # self.check_test_database()

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
    
    # def check_test_database(self):
    #     '''
    #     Method to check if the test database exists and handle it
    #     '''
    #     test_db_name = connection.settings_dict['TEST']['NAME']
    #     with connection.cursor() as cursor:
    #         cursor.execute(f"SELECT 1 FROM pg_database WHERE datname = '{test_db_name}'")
    #         exists = cursor.fetchone()
    #         if exists:
    #             cursor.execute(f"DROP DATABASE {test_db_name}")
    #             connection.creation.create_test_db()
    
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
        # Verify that the new issue was created successfully
        self.assertEqual(Issue.objects.count(), 2)
        # Verify that the title of the new issue matches the expected title
        self.assertEqual(Issue.objects.last().title, "New Issue")
        # Verify that the description of the new issue matches the expected description
        self.assertEqual(Issue.objects.last().description, "A new pothole needs fixing")
        # Verify that the category of the new issue matches the expected category
        self.assertEqual(Issue.objects.last().category, "pothole")
        # Verify that the reported_by user id of the new issue matches the expected user id
        self.assertEqual(Issue.objects.last().reported_by.id, self.user.id)
        # Verify that the status of the new issue is 'open'
        self.assertEqual(Issue.objects.last().status, "open")
        # Verify that the allocated_to field of the new issue is null
        self.assertIsNone(Issue.objects.last().allocated_to)
        # Verify that the reported_at field of the new issue is not null
        self.assertIsNotNone(Issue.objects.last().reported_at)
        # Verify that the reported_by user id of the new issue matches the expected user id
        self.assertEqual(Issue.objects.last().reported_by.id, self.user.id)
    

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
        # Verify that the retrieved issue title matches the expected title
        self.assertEqual(response.data['title'], self.issue.title)
        # Verify that the retrieved issue description matches the expected description
        self.assertEqual(response.data['description'], self.issue.description)
        # Verify that the retrieved issue category matches the expected category
        self.assertEqual(response.data['category'], self.issue.category)
        # Verify that the retrieved issue reported_by user id matches the expected user id
        self.assertEqual(response.data['reported_by'], self.issue.reported_by.id)
        # Verify that the retrieved issue status matches the expected status
        self.assertEqual(response.data['status'], self.issue.status)
        # Verify that the retrieved issue allocated_to field is null
        self.assertIsNone(response.data['allocated_to'])
        # Verify that the retrieved issue reported_at field is not null
        self.assertIsNotNone(response.data['reported_at'])
        # Verify that the retrieved issue id matches the expected issue id
        self.assertEqual(response.data['id'], self.issue.id)
        # Verify that the retrieved issue url matches the expected issue url
