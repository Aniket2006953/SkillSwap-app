from django.urls import path
from .views import VideoPostListCreateView, LikeReelView

urlpatterns = [
    path('', VideoPostListCreateView.as_view(), name='reels-list-create'),
    path('<str:reel_id>/like/', LikeReelView.as_view(), name='reel-like'),
]
