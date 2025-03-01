from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth.models import User

class UserAPITest(APITestCase):
    '''
    Test case for the User API endpoints
    '''
    def setUp(self):
        '''
        Method to set up the test case
        '''
        # Create a new user for the test case
        self.user = User.objects.create_user(username='testuser', password='password')

    def test_user_creation(self):
        '''
        Test to verify that a new user can be created using the API
        '''
        # Define the URL for the user registration endpoint
        url = reverse('user-register')

        # Define the data to be sent in the POST request to create a new user
        data = {
            "username": "newuser",
            "password": "newpassword"
        }

        # Send a POST request to create a new user
        response = self.client.post(url, data, format='json')

        # Verify that the response status code is 201 (Created)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        # Verify that the new user was created successfully
        self.assertEqual(User.objects.count(), 2)
        # Verify that the username of the new user matches the expected username
        self.assertEqual(User.objects.last().username, "newuser")

    def test_user_login(self):
        '''
        Test to verify that an existing user can log in using the API
        '''
        # Define the URL for the user login endpoint
        url = reverse('user-login')

        # Define the data to be sent in the POST request to log in the user
        data = {
            "username": self.user.username,
            "password": "password"
        }

        # Send a POST request to log in the user
        response = self.client.post(url, data, format='json')

        # Verify that the response status code is 200 (OK)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Verify that the response contains the expected user data
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['username'], self.user.username)

    def test_user_logout(self):
        '''
        Test to verify that an authenticated user can log out using the API
        '''
        # Log in the user
        self.client.login(username='testuser', password='password')

        # Define the URL for the user logout endpoint
        url = reverse('user-logout')

        # Send a POST request to log out the user
        response = self.client.post(url, {}, format='json')

        # Verify that the response status code is 200 (OK)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_user_list(self):
        '''
        Test to verify that the list of users can be retrieved using the API
        '''
        # Define the URL for the user list endpoint
        url = reverse('user-list')

        # Log in the user
        self.client.login(username='testuser', password='password')

        # Send a GET request to retrieve the list of users
        response = self.client.get(url)

        # Verify that the response status code is 200 (OK)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Verify that the response contains the expected number of users
        self.assertEqual(len(response.data), 1)
        # Verify that the username of the first user matches the expected username
        self.assertEqual(response.data[0]['username'], 'testuser')
        # Verify that the email of the first user matches the expected email
        self.assertEqual(response.data[0]['email'], '')
