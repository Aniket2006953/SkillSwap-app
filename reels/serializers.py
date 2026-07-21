from rest_framework import serializers
from .models import VideoPost

class VideoPostSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    likes_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = VideoPost
        fields = ['id', 'user', 'username', 'video_file', 'caption', 'likes_count', 'is_liked', 'created_at']
        read_only_fields = ['user']

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False
