from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from .models import ChatRoom, Message
from .serializers import ChatRoomSerializer, MessageSerializer
from django.db.models import Q

from rest_framework.permissions import AllowAny


class ChatRoomView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, username):
        other_user = get_object_or_404(User, username=username)

        if not request.user.is_authenticated:
            return Response({'error': 'Login required to open a chat room.'}, status=status.HTTP_401_UNAUTHORIZED)

        # Check both orderings before creating to respect unique_together
        room = ChatRoom.objects.filter(
            Q(user1=request.user, user2=other_user) | Q(user1=other_user, user2=request.user)
        ).first()

        if not room:
            room, _ = ChatRoom.objects.get_or_create(user1=request.user, user2=other_user)

        return Response(ChatRoomSerializer(room, context={'request': request}).data)


class ChatRoomListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        # If the user is not logged in, just return an empty list — no crash
        if not request.user.is_authenticated:
            return Response([])

        rooms = ChatRoom.objects.filter(
            Q(user1=request.user) | Q(user2=request.user)
        ).distinct().order_by('-created_at')

        serializer = ChatRoomSerializer(rooms, many=True, context={'request': request})
        return Response(serializer.data)


class MessageListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, room_id):
        room = get_object_or_404(ChatRoom, id=room_id)
        messages = room.messages.all()
        return Response(MessageSerializer(messages, many=True, context={'request': request}).data)

    def post(self, request, room_id):
        if not request.user.is_authenticated:
            return Response({'error': 'Login required to send messages.'}, status=status.HTTP_401_UNAUTHORIZED)

        room = get_object_or_404(ChatRoom, id=room_id)
        content = request.data.get('content')
        if not content:
            return Response({'error': 'Message content is required.'}, status=status.HTTP_400_BAD_REQUEST)
        msg = Message.objects.create(room=room, sender=request.user, content=content)
        return Response(MessageSerializer(msg, context={'request': request}).data)

class MessageDetailView(APIView):
    permission_classes = [AllowAny]

    def put(self, request, pk):
        if not request.user.is_authenticated:
            return Response({'error': 'Login required.'}, status=status.HTTP_401_UNAUTHORIZED)
        msg = get_object_or_404(Message, id=pk)
        if msg.sender != request.user:
            return Response({'error': 'You can only edit your own messages.'}, status=status.HTTP_403_FORBIDDEN)
        
        content = request.data.get('content')
        if not content:
            return Response({'error': 'Content is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        msg.content = content
        msg.is_edited = True
        msg.save()
        return Response(MessageSerializer(msg, context={'request': request}).data)

    def delete(self, request, pk):
        if not request.user.is_authenticated:
            return Response({'error': 'Login required.'}, status=status.HTTP_401_UNAUTHORIZED)
        msg = get_object_or_404(Message, id=pk)
        if msg.sender != request.user:
            return Response({'error': 'You can only delete your own messages.'}, status=status.HTTP_403_FORBIDDEN)
        msg.delete()
        return Response({'message': 'Deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)
