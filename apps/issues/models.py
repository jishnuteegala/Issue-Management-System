from django.db import models
from django.contrib.auth.models import User

# Define the Issue model which will be used to store the details of the issues reported by the users
class Issue(models.Model):
    # Define the choices for the category which can be modified as needed
    CATEGORY_CHOICES = [
        ('pothole', 'Pothole'),
        ('street_lighting', 'Street Lighting'),
        ('graffiti', 'Graffiti'),
        ('anti_social', 'Anti-Social Behaviour'),
        ('fly_tipping', 'Fly-Tipping'),
        ('blocked_drain', 'Blocked Drains'),
    ]
    
    # Define the choices for the status which can be modified as needed
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('allocated', 'Allocated'),
        ('closed', 'Closed'),
    ]
    
    # Define the fields for the Issue model with their appropriate data types
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    reported_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reported_issues')
    reported_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    allocated_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='allocated_issues')
    
    # Define the string representation of the Issue model
    def __str__(self):
        return f"{self.title} ({self.get_status_display()})"
