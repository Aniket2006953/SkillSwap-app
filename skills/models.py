from django.db import models
from django.contrib.auth.models import User


class Skill(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="skills")
    title = models.CharField(max_length=100)
    description = models.TextField()
    category = models.CharField(max_length=50)
    level = models.CharField(
        max_length=20,
        choices=[
            ('beginner', 'Beginner'),
            ('intermediate', 'Intermediate'),
            ('advanced', 'Advanced'),
            ('expert', 'Expert')
        ],
        default='beginner'
    )
    city = models.CharField(max_length=50)
    image=models.ImageField(upload_to='skills/', blank=True, null=True)
    video=models.FileField(upload_to='skills/videos/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return self.title
    





class SkillRequest(models.Model):
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE)
    requester = models.ForeignKey(User, on_delete=models.CASCADE)
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('accepted', 'Accepted'),
            ('rejected', 'Rejected')
        ],
        default='pending'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.requester} → {self.skill.title}"
    



class Review(models.Model):
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name="reviews")
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.IntegerField()
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('skill', 'reviewer')

class Meeting(models.Model):
    request = models.OneToOneField(SkillRequest, on_delete=models.CASCADE, related_name="meeting")
    scheduled_time = models.DateTimeField()
    duration_minutes = models.IntegerField(default=60)
    meeting_url = models.URLField(blank=True) # Will be used in Phase 2
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Meeting for {self.request.skill.title} at {self.scheduled_time}"

class Milestone(models.Model):
    request = models.ForeignKey(SkillRequest, on_delete=models.CASCADE, related_name="milestones")
    title = models.CharField(max_length=200)
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Report(models.Model):
    reporter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='filed_reports')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, null=True, blank=True, related_name='reports')
    review = models.ForeignKey(Review, on_delete=models.CASCADE, null=True, blank=True, related_name='reports')
    reason = models.TextField()
    is_resolved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Report by {self.reporter.username}"
