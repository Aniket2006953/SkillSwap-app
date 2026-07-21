from django.urls import path
from .views import ChatRoomView, MessageListView, ChatRoomListView, MessageDetailView

urlpatterns = [
    path('rooms/', ChatRoomListView.as_view(), name='chat-rooms'),
    path('room/<str:username>/', ChatRoomView.as_view(), name='chat-room'),
    path('messages/<str:room_id>/', MessageListView.as_view(), name='chat-messages'),
    path('messages/detail/<str:pk>/', MessageDetailView.as_view(), name='message-detail'),
]
