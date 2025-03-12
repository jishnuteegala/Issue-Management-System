from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.db.models import Count, Avg, F
from django.utils import timezone
from django.contrib.auth.models import User
from apps.issues.models import Issue
from datetime import timedelta

class DashboardMetricsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        # Basic metrics
        total_issues = Issue.objects.count()
        total_users = User.objects.count()
        open_issues = Issue.objects.filter(status='open').count()
        closed_issues = Issue.objects.filter(status='closed').count()

        # Calculate average resolution time for closed issues
        closed_issues_data = Issue.objects.filter(status='closed')
        avg_resolution_time = closed_issues_data.aggregate(
            avg_time=Avg(F('updated_at') - F('reported_at'))
        )['avg_time']

        # Issues by category
        issues_by_category = Issue.objects.values('category').annotate(
            count=Count('id')
        ).order_by('category')

        # Issues by status
        issues_by_status = Issue.objects.values('status').annotate(
            count=Count('id')
        ).order_by('status')

        # Recent activity (last 7 days)
        seven_days_ago = timezone.now() - timedelta(days=7)
        recent_issues = Issue.objects.filter(
            reported_at__gte=seven_days_ago
        ).count()

        return Response({
            'total_issues': total_issues,
            'total_users': total_users,
            'open_issues': open_issues,
            'closed_issues': closed_issues,
            'avg_resolution_time': avg_resolution_time.total_seconds() if avg_resolution_time else 0,
            'issues_by_category': list(issues_by_category),
            'issues_by_status': list(issues_by_status),
            'recent_issues': recent_issues
        })
