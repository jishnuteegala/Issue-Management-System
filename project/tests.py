from django.test import TestCase
from django.urls import reverse

class ProjectURLsTest(TestCase):
    def test_hello_world(self):
        '''
        Test the hello_world endpoint
        '''
        response = self.client.get('/api/hello/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {'message': 'Hello from Django backend!'})
