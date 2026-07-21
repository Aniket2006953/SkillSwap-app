from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Profile, Follow, FollowRequest

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'password']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

class PasswordResetConfirmSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True, min_length=8)
    uidb64 = serializers.CharField()
    token = serializers.CharField()


class FollowSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    follower = serializers.CharField(source='follower.id', read_only=True)
    user = serializers.CharField(source='user.id', read_only=True)
    follower_username = serializers.ReadOnlyField(source='follower.username')
    following_username = serializers.ReadOnlyField(source='user.username')
    
    class Meta:
        model = Follow
        fields = ['id', 'follower', 'user', 'follower_username', 'following_username', 'created_at']

class FollowRequestSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    sender = serializers.CharField(source='sender.id', read_only=True)
    receiver = serializers.CharField(source='receiver.id', read_only=True)
    sender_username = serializers.ReadOnlyField(source='sender.username')
    receiver_username = serializers.ReadOnlyField(source='receiver.username')
    
    class Meta:
        model = FollowRequest
        fields = ['id', 'sender', 'receiver', 'status', 'sender_username', 'receiver_username', 'created_at']

class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')
    email = serializers.ReadOnlyField(source='user.email')
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    posts_count = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()
    is_follow_requested = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = [
            'username', 'email', 'bio', 'city', 'profile_picture', 
            'skills_offered', 'skills_wanted', 'skill_coins', 'experience_level', 
            'availability', 'phone', 'linkedin_url', 'portfolio_url', 
            'languages', 'hourly_rate', 'years_of_experience',
            'followers_count', 'following_count', 'posts_count',
            'is_following', 'is_follow_requested'
        ]

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', None)
        if user_data and 'username' in user_data:
            new_username = user_data['username']
            if User.objects.filter(username=new_username).exclude(id=instance.user.id).exists():
                raise serializers.ValidationError({"username": "This username is already taken."})
            instance.user.username = new_username
            instance.user.save()
        return super().update(instance, validated_data)

    def get_followers_count(self, obj):
        return obj.user.followers.count()

    def get_following_count(self, obj):
        return obj.user.following.count()

    def get_posts_count(self, obj):
        if hasattr(obj.user, 'reels'):
            return obj.user.reels.count()
        return 0

    def get_is_following(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Follow.objects.filter(follower=request.user, user=obj.user).exists()
        return False

    def get_is_follow_requested(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return FollowRequest.objects.filter(sender=request.user, receiver=obj.user, status='pending').exists()
        return False


class AllUserSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing all users in the Messages people-picker."""
    username = serializers.ReadOnlyField(source='user.username')
    profile_picture = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ['username', 'profile_picture', 'bio', 'city']

    def get_profile_picture(self, obj):
        request = self.context.get('request')
        if obj.profile_picture and request:
            return request.build_absolute_uri(obj.profile_picture.url)
        return None