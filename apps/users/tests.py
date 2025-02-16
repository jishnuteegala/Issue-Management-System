from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from django.db import connection

class UserAPITest(APITestCase):
    def setUp(self):

        # Check if the test database exists and handle it
        # self.check_test_database()

        self.user = User.objects.create_user(username='testuser', password='password')
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
    
    def test_user_list(self):
        url = reverse('user-list')
        self.client.login(username='testuser', password='password')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['username'], 'testuser')
        self.assertEqual(response.data[0]['email'], '')
