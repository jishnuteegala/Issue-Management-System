from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from apps.issues.models import Issue
from django.utils import timezone
from datetime import timedelta

class AnalyticsAPITest(APITestCase):
    '''
    Test case for the Analytics API endpoints
    '''
    def setUp(self):
        '''
        Method to set up the test case with sample data
        '''
        # Create staff and regular users
        self.staff_user = User.objects.create_user(username='staffuser', password='password', is_staff=True)
        self.regular_user = User.objects.create_user(username='regularuser', password='password')

        # Create test issues with different statuses and categories
        self.issues = [
            Issue.objects.create(
                title="Open Issue",
                description="Test description",
                category="pothole",
                reported_by=self.regular_user,
                status="open"
            ),
            Issue.objects.create(
                title="Closed Issue",
                description="Test description",
                category="graffiti",
                reported_by=self.regular_user,
                status="closed",
                allocated_to=self.staff_user
            ),
            Issue.objects.create(
                title="Allocated Issue",
                description="Test description",
                category="street_lighting",
                reported_by=self.regular_user,
                status="allocated",
                allocated_to=self.staff_user
            )
        ]

        # Set a specific reported_at time for one issue to test recent issues
        self.issues[0].reported_at = timezone.now() - timedelta(days=10)
        self.issues[0].save()

    def test_metrics_access_unauthorized(self):
        '''
        Test to verify that unauthorized users cannot access metrics
        '''
        # Define the URL for the metrics endpoint
        url = reverse('dashboard-metrics')

        # Send a GET request without authentication
        response = self.client.get(url)

        # Verify that the response status code is 403 (Forbidden)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_metrics_access_non_staff(self):
        '''
        Test to verify that non-staff users cannot access metrics
        '''
        # Log in as regular user
        self.client.login(username='regularuser', password='password')
        
        # Define the URL for the metrics endpoint
        url = reverse('dashboard-metrics')

        # Send a GET request
        response = self.client.get(url)

        # Verify that the response status code is 403 (Forbidden)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_metrics_retrieval(self):
        '''
        Test to verify that staff users can retrieve metrics
        '''
        # Log in as staff user
        self.client.login(username='staffuser', password='password')
        
        # Define the URL for the metrics endpoint
        url = reverse('dashboard-metrics')

        # Send a GET request
        response = self.client.get(url)

        # Verify that the response status code is 200 (OK)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify the metrics data
        self.assertEqual(response.data['total_issues'], 3)
        self.assertEqual(response.data['total_users'], 2)
        self.assertEqual(response.data['open_issues'], 1)
        self.assertEqual(response.data['closed_issues'], 1)
        self.assertTrue('avg_resolution_time' in response.data)
        
        # Verify category metrics
        category_data = {item['category']: item['count'] for item in response.data['issues_by_category']}
        self.assertEqual(category_data['pothole'], 1)
        self.assertEqual(category_data['graffiti'], 1)
        self.assertEqual(category_data['street_lighting'], 1)

        # Verify status metrics
        status_data = {item['status']: item['count'] for item in response.data['issues_by_status']}
        self.assertEqual(status_data['open'], 1)
        self.assertEqual(status_data['closed'], 1)
        self.assertEqual(status_data['allocated'], 1)

    def test_recent_issues_count(self):
        '''
        Test to verify that recent issues are correctly counted
        '''
        # Log in as staff user
        self.client.login(username='staffuser', password='password')
        
        # Define the URL for the metrics endpoint
        url = reverse('dashboard-metrics')

        # Send a GET request
        response = self.client.get(url)

        # Verify that only issues from the last 7 days are counted
        self.assertEqual(response.data['recent_issues'], 2)  # Two issues are within last 7 days

    def test_metrics_with_no_closed_issues(self):
        '''
        Test metrics when there are no closed issues (avg_resolution_time should be 0)
        '''
        # Delete all existing issues
        Issue.objects.all().delete()
        
        # Create only open issues
        Issue.objects.create(
            title="Open Issue",
            description="Test description",
            category="pothole",
            reported_by=self.regular_user,
            status="open"
        )
        
        # Log in as staff user
        self.client.login(username='staffuser', password='password')
        
        # Get metrics
        url = reverse('dashboard-metrics')
        response = self.client.get(url)
        
        # Verify metrics
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['avg_resolution_time'], 0)
        self.assertEqual(response.data['total_issues'], 1)
        self.assertEqual(response.data['closed_issues'], 0)

    def test_metrics_with_empty_database(self):
        '''
        Test metrics when database is empty
        '''
        # Delete all issues and users except staff user
        Issue.objects.all().delete()
        User.objects.exclude(username='staffuser').delete()
        
        # Log in as staff user
        self.client.login(username='staffuser', password='password')
        
        # Get metrics
        url = reverse('dashboard-metrics')
        response = self.client.get(url)
        
        # Verify metrics
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_issues'], 0)
        self.assertEqual(response.data['total_users'], 1)
        self.assertEqual(response.data['open_issues'], 0)
        self.assertEqual(response.data['closed_issues'], 0)
        self.assertEqual(response.data['recent_issues'], 0)
        self.assertEqual(response.data['avg_resolution_time'], 0)
        self.assertEqual(len(response.data['issues_by_category']), 0)
        self.assertEqual(len(response.data['issues_by_status']), 0)

    def test_metrics_with_mixed_timestamps(self):
        '''
        Test metrics with issues having different reported and updated times
        '''
        # Delete existing issues
        Issue.objects.all().delete()

        # Create an issue with specific timestamps
        issue = Issue.objects.create(
            title="Test Issue",
            description="Test description",
            category="pothole",
            reported_by=self.regular_user,
            status="closed",
            allocated_to=self.staff_user
        )
        
        # Set reported_at and updated_at with fixed times
        past_time = timezone.now() - timedelta(days=5)
        now_time = timezone.now()
        issue.reported_at = past_time
        issue.save()
        
        # Update the issue to set updated_at
        issue.status = "closed"
        issue.save()

        # Log in as staff user
        self.client.login(username='staffuser', password='password')
        
        # Get metrics
        url = reverse('dashboard-metrics')
        response = self.client.get(url)
        
        # Verify metrics including resolution time
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['avg_resolution_time'] > 0)

    def test_metrics_with_partially_allocated_issues(self):
        '''
        Test metrics with a mix of allocated and unallocated issues
        '''
        # Delete existing issues
        Issue.objects.all().delete()

        # Create issues with different allocation states
        Issue.objects.create(
            title="Unallocated Issue",
            description="Test description",
            category="pothole",
            reported_by=self.regular_user,
            status="open"
        )
        
        Issue.objects.create(
            title="Allocated Issue",
            description="Test description",
            category="graffiti",
            reported_by=self.regular_user,
            status="allocated",
            allocated_to=self.staff_user
        )

        # Log in as staff user
        self.client.login(username='staffuser', password='password')
        
        # Get metrics
        url = reverse('dashboard-metrics')
        response = self.client.get(url)
        
        # Verify metrics for allocation states
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        status_data = {item['status']: item['count'] for item in response.data['issues_by_status']}
        self.assertEqual(status_data.get('open', 0), 1)
        self.assertEqual(status_data.get('allocated', 0), 1)

    def test_metrics_with_different_statuses(self):
        '''
        Test metrics with all possible status combinations and edge cases
        '''
        # Delete existing issues
        Issue.objects.all().delete()

        # Create issues with all possible statuses
        statuses = ['open', 'allocated', 'closed']
        category_types = ['pothole', 'graffiti', 'street_lighting']
        
        # Create one issue of each status type and category
        for i, (status, category) in enumerate(zip(statuses, category_types)):
            Issue.objects.create(
                title=f"{status.title()} Issue",
                description="Test description",
                category=category,
                reported_by=self.regular_user,
                status=status,
                allocated_to=self.staff_user if status != 'open' else None
            )

        # Log in as staff user
        self.client.login(username='staffuser', password='password')
        
        # Get metrics
        url = reverse('dashboard-metrics')
        response = self.client.get(url)
        
        # Verify all status counts are present
        status_data = {item['status']: item['count'] for item in response.data['issues_by_status']}
        for status in statuses:
            self.assertEqual(status_data.get(status, 0), 1)
            
        # Also verify category distribution
        categories = {item['category']: item['count'] for item in response.data['issues_by_category']}
        for category in category_types:
            self.assertEqual(categories.get(category, 0), 1)
        
        # Test avg_resolution_time calculation
        avg_time = response.data['avg_resolution_time']
        self.assertIsNotNone(avg_time)
        self.assertTrue(isinstance(avg_time, (int, float)))

    def test_metrics_resolution_time_calculation(self):
        '''
        Test that resolution time is calculated correctly for closed issues
        '''
        # Delete existing issues
        Issue.objects.all().delete()

        # Create a closed issue with known resolution time
        past_time = timezone.now() - timedelta(days=2)  # Issue from 2 days ago
        issue = Issue.objects.create(
            title="Test Issue",
            description="Test description",
            category="pothole",
            reported_by=self.regular_user,
            status="closed",
            allocated_to=self.staff_user
        )
        
        # Set the reported_at time manually
        issue.reported_at = past_time
        issue.save()

        # Log in as staff user
        self.client.login(username='staffuser', password='password')
        
        # Get metrics
        url = reverse('dashboard-metrics')
        response = self.client.get(url)
        
        # Verify resolution time is approximately correct (within 1 hour margin)
        expected_seconds = 48 * 3600  # 2 days in seconds
        actual_seconds = response.data['avg_resolution_time']
        self.assertTrue(abs(actual_seconds - expected_seconds) < 3600)

    def test_metrics_category_counts(self):
        '''
        Test that category counts are accurate with multiple issues per category
        '''
        # Delete existing issues
        Issue.objects.all().delete()

        # Create multiple issues for the same category
        for _ in range(3):
            Issue.objects.create(
                title="Pothole Issue",
                description="Test description",
                category="pothole",
                reported_by=self.regular_user,
                status="open"
            )

        # Create one issue for a different category
        Issue.objects.create(
            title="Graffiti Issue",
            description="Test description",
            category="graffiti",
            reported_by=self.regular_user,
            status="open"
        )

        # Log in as staff user
        self.client.login(username='staffuser', password='password')
        
        # Get metrics
        url = reverse('dashboard-metrics')
        response = self.client.get(url)
        
        # Verify category counts
        category_data = {item['category']: item['count'] for item in response.data['issues_by_category']}
        self.assertEqual(category_data['pothole'], 3)
        self.assertEqual(category_data['graffiti'], 1)
