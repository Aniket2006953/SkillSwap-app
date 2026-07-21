from django.db import models
from django.contrib.auth.models import User


from django.db.models.signals import post_save
from django.dispatch import receiver











class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    bio = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True,null=True)
    
    # New Fields
    skills_offered = models.TextField(blank=True)
    skills_wanted = models.TextField(blank=True)
    skill_coins = models.IntegerField(default=3) # Time banking currency
    experience_level = models.CharField(
        max_length=20, 
        choices=[
            ('beginner', 'Beginner'),
            ('intermediate', 'Intermediate'),
            ('advanced', 'Advanced'),
            ('expert', 'Expert')
        ],
        default='beginner'
    )
    availability = models.CharField(
        max_length=20,
        choices=[
            ('weekdays', 'Weekdays'),
            ('weekends', 'Weekends'),
            ('evenings', 'Evenings'),
            ('flexible', 'Flexible'),
            ('full-time', 'Full Time')
        ],
        default='weekends'
    )
    phone = models.CharField(max_length=20, blank=True)
    linkedin_url = models.URLField(blank=True)
    portfolio_url = models.URLField(blank=True)
    languages = models.TextField(blank=True)
    hourly_rate = models.IntegerField(null=True, blank=True)
    years_of_experience = models.IntegerField(default=0, blank=True, null=True)
    
    def __str__(self):
        return self.user.username
    


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

class FollowRequest(models.Model):
    sender = models.ForeignKey(User, related_name='sent_requests', on_delete=models.CASCADE)
    receiver = models.ForeignKey(User, related_name='received_requests', on_delete=models.CASCADE)
    status = models.CharField(
        max_length=20, 
        choices=[('pending', 'Pending'), ('accepted', 'Accepted'), ('rejected', 'Rejected')], 
        default='pending'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('sender', 'receiver')

class Follow(models.Model):
    follower = models.ForeignKey(User, related_name='following', on_delete=models.CASCADE)
    user = models.ForeignKey(User, related_name='followers', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('follower', 'user')