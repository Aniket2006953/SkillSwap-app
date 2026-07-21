from django.urls import path
from .views import RegisterView
from rest_framework_simplejwt.views import TokenObtainPairView
from .views import ProfileView, PublicProfileView, SendFollowRequestView, AcceptRejectFollowRequestView, UnfollowView, FollowersListView, FollowingListView, FollowRequestListView, AllUsersListView, FirebaseLoginView, PasswordResetRequestView, PasswordResetConfirmView

urlpatterns = [
    path('register/', RegisterView.as_view(),name='register'),
    path('login/', TokenObtainPairView.as_view()),
    path('password-reset/', PasswordResetRequestView.as_view(), name='password-reset'),
    path('password-reset-confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    path('firebase-login/', FirebaseLoginView.as_view(), name='firebase-login'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('public-profile/<str:user__username>/', PublicProfileView.as_view(), name='public-profile'),
    path('follow/<str:username>/', SendFollowRequestView.as_view(), name='follow-request'),
    path('follow-request/<str:req_id>/<str:action>/', AcceptRejectFollowRequestView.as_view(), name='follow-action'),
    path('unfollow/<str:username>/', UnfollowView.as_view(), name='unfollow'),
    path('followers/<str:username>/', FollowersListView.as_view(), name='followers'),
    path('following/<str:username>/', FollowingListView.as_view(), name='following'),
    path('follow-requests/', FollowRequestListView.as_view(), name='follow-requests'),
    path('all/', AllUsersListView.as_view(), name='all-users'),
]