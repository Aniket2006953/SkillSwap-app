from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from .models import VideoPost
from .serializers import VideoPostSerializer

class VideoPostListCreateView(generics.ListCreateAPIView):
    queryset = VideoPost.objects.all().order_by('-created_at')
    serializer_class = VideoPostSerializer
    
    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class LikeReelView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, reel_id):
        reel = get_object_or_404(VideoPost, id=reel_id)
        if request.user in reel.likes.all():
            reel.likes.remove(request.user)
            return Response({'status': 'unliked'})
        else:
            reel.likes.add(request.user)
            return Response({'status': 'liked'})
