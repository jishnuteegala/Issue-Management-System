from rest_framework import serializers
from .models import Issue

# Issue Serializer to serialize the Issue model
class IssueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Issue
        fields = '__all__'
