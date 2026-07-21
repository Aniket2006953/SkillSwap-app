from rest_framework import serializers
from .models import ChatRoom, Message


class MessageSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    room = serializers.CharField(source='room.id', read_only=True)
    sender = serializers.CharField(source='sender.id', read_only=True)
    sender_username = serializers.ReadOnlyField(source='sender.username')
    sender_profile_picture = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['id', 'room', 'sender', 'sender_username', 'sender_profile_picture', 'content', 'timestamp', 'is_edited']

    def get_sender_profile_picture(self, obj):
        request = self.context.get('request')
        if hasattr(obj.sender, 'profile') and obj.sender.profile.profile_picture:
            if request:
                return request.build_absolute_uri(obj.sender.profile.profile_picture.url)
            return obj.sender.profile.profile_picture.url
        return None


class ChatRoomSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    user1 = serializers.CharField(source='user1.id', read_only=True)
    user2 = serializers.CharField(source='user2.id', read_only=True)
    user1_username = serializers.ReadOnlyField(source='user1.username')
    user2_username = serializers.ReadOnlyField(source='user2.username')
    other_user = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = ChatRoom
        fields = [
            'id', 'user1', 'user2',
            'user1_username', 'user2_username',
            'other_user', 'last_message', 'created_at'
        ]

    def get_other_user(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            # Return user2 as fallback when no request context
            other = obj.user2
        else:
            user = request.user
            other = obj.user2 if obj.user1 == user else obj.user1

        profile_pic = None
        if hasattr(other, 'profile') and other.profile.profile_picture:
            if request:
                profile_pic = request.build_absolute_uri(other.profile.profile_picture.url)

        return {
            'username': other.username,
            'profile_picture': profile_pic
        }

    def get_last_message(self, obj):
        last_msg = obj.messages.order_by('-timestamp').first()
        if last_msg:
            return {
                'content': last_msg.content,
                'timestamp': last_msg.timestamp
            }
        return None
