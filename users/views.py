from rest_framework import generics
from django.contrib.auth.models import User
from .serializers import RegisterSerializer
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import Profile
from .serializers import ProfileSerializer, AllUserSerializer, PasswordResetRequestSerializer, PasswordResetConfirmSerializer
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            user = User.objects.filter(email=email).first()
            if user:
                token = default_token_generator.make_token(user)
                uid = urlsafe_base64_encode(force_bytes(user.pk))
                # Note: For production, change localhost:5173 to your actual frontend URL.
                reset_link = f"http://localhost:5173/reset-password/{uid}/{token}"
                
                send_mail(
                    "Password Reset Requested",
                    f"Click the link to reset your password: {reset_link}",
                    "noreply@skillbarter.com",
                    [email],
                    fail_silently=False,
                )
            # We always return success so we don't leak which emails exist
            return Response({"message": "Password reset email sent! Check your inbox."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            uidb64 = serializer.validated_data['uidb64']
            token = serializer.validated_data['token']
            password = serializer.validated_data['password']

            try:
                uid = force_str(urlsafe_base64_decode(uidb64))
                user = User.objects.get(pk=uid)
            except (TypeError, ValueError, OverflowError, User.DoesNotExist):
                user = None

            if user is not None and default_token_generator.check_token(user, token):
                user.set_password(password)
                user.save()
                return Response({"message": "Password reset successful!"}, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Invalid token or user ID"}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        profile, created = Profile.objects.get_or_create(user=self.request.user)
        return profile
    



class PublicProfileView(generics.RetrieveAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [AllowAny]
    lookup_field = 'user__username'

from .models import Follow, FollowRequest
from .serializers import FollowSerializer, FollowRequestSerializer

class SendFollowRequestView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, username):
        receiver = get_object_or_404(User, username=username)
        if request.user == receiver:
            return Response({"error": "Cannot follow yourself"}, status=status.HTTP_400_BAD_REQUEST)
            
        if Follow.objects.filter(follower=request.user, user=receiver).exists():
            return Response({"error": "Already following"}, status=status.HTTP_400_BAD_REQUEST)
            
        follow_req, created = FollowRequest.objects.get_or_create(
            sender=request.user, receiver=receiver, defaults={'status': 'pending'}
        )
        if not created:
            if follow_req.status == 'pending':
                return Response({"message": "Request already sent"}, status=status.HTTP_400_BAD_REQUEST)
            else:
                follow_req.status = 'pending'
                follow_req.save()
            
        return Response(FollowRequestSerializer(follow_req).data, status=status.HTTP_201_CREATED)

class AcceptRejectFollowRequestView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, req_id, action):
        follow_req = get_object_or_404(FollowRequest, id=req_id, receiver=request.user)
        if action == 'accept':
            follow_req.status = 'accepted'
            follow_req.save()
            Follow.objects.get_or_create(follower=follow_req.sender, user=request.user)
            return Response({"message": "Request accepted"})
        elif action == 'reject':
            follow_req.status = 'rejected'
            follow_req.save()
            return Response({"message": "Request rejected"})
        return Response({"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)

class UnfollowView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, username):
        user_to_unfollow = get_object_or_404(User, username=username)
        Follow.objects.filter(follower=request.user, user=user_to_unfollow).delete()
        FollowRequest.objects.filter(sender=request.user, receiver=user_to_unfollow).delete()
        return Response({"message": "Unfollowed"})

class FollowersListView(generics.ListAPIView):
    serializer_class = FollowSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        user = get_object_or_404(User, username=self.kwargs['username'])
        return Follow.objects.filter(user=user)

class FollowingListView(generics.ListAPIView):
    serializer_class = FollowSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        user = get_object_or_404(User, username=self.kwargs['username'])
        return Follow.objects.filter(follower=user)

class FollowRequestListView(generics.ListAPIView):
    serializer_class = FollowRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return FollowRequest.objects.filter(receiver=self.request.user, status='pending')


class AllUsersListView(generics.ListAPIView):
    """Return all users with basic profile info for the Messages/People page."""
    serializer_class = AllUserSerializer
    permission_classes = [AllowAny]
    pagination_class = None  # return flat array, not paginated object

    def get_queryset(self):
        return Profile.objects.select_related('user').all()

import firebase_admin
from firebase_admin import credentials, auth as firebase_auth
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken

import os
import json

try:
    if not firebase_admin._apps:
        firebase_creds_json = os.environ.get('FIREBASE_CREDENTIALS_JSON')
        if firebase_creds_json:
            cred_dict = json.loads(firebase_creds_json)
            cred = credentials.Certificate(cred_dict)
        else:
            cred = credentials.Certificate(settings.BASE_DIR / 'firebase-service-account.json')
        firebase_admin.initialize_app(cred)
except Exception as e:
    print("Firebase Warning: could not initialize admin sdk.", e)

class FirebaseLoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        token = request.data.get('token')
        if not token:
            return Response({"error": "No token provided"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            decoded_token = firebase_auth.verify_id_token(token)
            email = decoded_token.get('email')
            if not email:
                return Response({"error": "No email found in token"}, status=status.HTTP_400_BAD_REQUEST)
            user = User.objects.filter(email=email).first()
            if not user:
                base_username = email.split('@')[0]
                new_username = base_username
                counter = 1
                while User.objects.filter(username=new_username).exists():
                    new_username = f"{base_username}{counter}"
                    counter += 1
                user = User.objects.create(username=new_username, email=email)
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'username': user.username,
                'id': str(user.id)
            })
        except Exception as e:
            import traceback
            print("FIREBASE ERROR:", str(e))
            traceback.print_exc()
            return Response({"error": str(e)}, status=status.HTTP_401_UNAUTHORIZED)
