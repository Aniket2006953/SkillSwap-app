from django.db import models
from django.contrib.auth.models import User

class VideoPost(models.Model):
    user = models.ForeignKey(User, related_name='reels', on_delete=models.CASCADE)
    video_file = models.FileField(upload_to='reels/')
    caption = models.TextField(blank=True)
    likes = models.ManyToManyField(User, related_name='liked_reels', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username}'s reel {self.id}"
