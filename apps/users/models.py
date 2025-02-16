from django.db import models
from django.contrib.auth.models import User

# Define the UserProfile model which will be used to store the additional details of the users
class UserProfile(models.Model):
    # Define the user fields which will be used to link the UserProfile model with the User model
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    email = models.EmailField(blank=True)
    phone_number = models.CharField(max_length=15, blank=True)
    address = models.TextField(blank=True)
    staff = models.BooleanField(default=False)
    
    # Define the string representation of the UserProfile model
    def __str__(self):
        return self.user.username
