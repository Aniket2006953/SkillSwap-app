from django.db import models
from django.contrib.auth.models import User


class Skill(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="skills")
    title = models.CharField(max_length=100)
    description = models.TextField()
    category = models.CharField(max_length=50)
    city = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title