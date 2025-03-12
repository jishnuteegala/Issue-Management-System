from django.contrib import admin
from django.urls import path
from django.http import JsonResponse
from django.urls import include

def hello_world(request):
    return JsonResponse({'message': 'Hello from Django backend!'})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/hello/', hello_world),
    path('api/issues/', include('apps.issues.urls')),
    path('api/users/', include('apps.users.urls')),
    path('api/analytics/', include('apps.analytics.urls')),
]
