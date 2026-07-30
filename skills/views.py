from rest_framework import generics, permissions, filters
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.exceptions import ValidationError, PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from .models import Skill, SkillRequest, Review
from .serializers import SkillSerializer, SkillRequestSerializer, ReviewSerializer


class SkillListCreateView(generics.ListCreateAPIView):
    serializer_class = SkillSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Skill.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)





class SkillDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = SkillSerializer
    permission_classes = [IsAuthenticated]
    queryset = Skill.objects.all()

    def perform_update(self, serializer):
        if serializer.instance.owner != self.request.user:
            raise PermissionDenied("You do not have permission to edit this skill.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.owner != self.request.user:
            raise PermissionDenied("You do not have permission to delete this skill.")
        instance.delete()



class AllSkillsView(generics.ListAPIView):
    serializer_class = SkillSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter,filters.OrderingFilter]
    filterset_fields = ['category', 'city', 'level']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at']
    ordering = ['-created_at']  # Default ordering by created_at descending
    
    def get_queryset(self):
        from django.db.models import Avg, Prefetch
        qs = Skill.objects.annotate(avg_rating=Avg('reviews__rating'))
        
        user = self.request.user
        if user.is_authenticated:
            qs = qs.prefetch_related(
                Prefetch(
                    'skillrequest_set',
                    queryset=SkillRequest.objects.filter(requester=user),
                    to_attr='user_requests'
                )
            )
        return qs
    




class SkillRequestCreateView(generics.CreateAPIView):
    serializer_class = SkillRequestSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        skill = serializer.validated_data['skill']
        user = self.request.user

        #  Prevent owner requesting own skill
        if skill.owner == user:
            print(f"DEBUG: User {user.username} tried to request their own skill {skill.title}")
            raise ValidationError({"detail": "You cannot request your own skill."})

        #  Prevent duplicate request
        if SkillRequest.objects.filter(skill=skill, requester=user).exists():
            print(f"DEBUG: User {user.username} already requested skill {skill.title}")
            raise ValidationError({"detail": "You have already requested this skill."})

        profile = user.profile
        if profile.skill_coins < 1:
            raise ValidationError({"detail": "You do not have enough Skill Coins to make a request."})
            
        profile.skill_coins -= 1
        profile.save()

        serializer.save(requester=user)
        print(f"DEBUG: Skill request created for {user.username} -> {skill.title}. Deducted 1 coin.")






class OwnerSkillRequestListView(generics.ListAPIView):
    serializer_class = SkillRequestSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return SkillRequest.objects.filter(skill__owner=self.request.user)




class MySkillRequestListView(generics.ListAPIView):
    serializer_class = SkillRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SkillRequest.objects.filter(
            requester=self.request.user
        )
 




class SkillRequestUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = SkillRequestSerializer
    permission_classes = [IsAuthenticated]
    queryset = SkillRequest.objects.all()

    def perform_update(self, serializer):
        skill_request = self.get_object()
        old_status = skill_request.status

        # Only skill owner can update the request
        if skill_request.skill.owner != self.request.user:
            raise PermissionDenied("You do not have permission to update this request.")

        updated_request = serializer.save()

        # Handle coin logic and meeting scheduling
        if old_status != 'accepted' and updated_request.status == 'accepted':
            # Transfer coin to owner
            owner_profile = self.request.user.profile
            owner_profile.skill_coins += 1
            owner_profile.save()
            
            # Create a Meeting
            from .models import Meeting
            from django.utils import timezone
            import datetime
            scheduled_time_str = self.request.data.get('scheduled_time')
            if scheduled_time_str:
                from dateutil import parser
                try:
                    scheduled_time = parser.parse(scheduled_time_str)
                except:
                    scheduled_time = timezone.now() + datetime.timedelta(days=1)
            else:
                scheduled_time = timezone.now() + datetime.timedelta(days=1)
            
            meeting_url = f"https://meet.jit.si/SkillSwap-{updated_request.id}"
            Meeting.objects.get_or_create(
                request=updated_request, 
                defaults={'scheduled_time': scheduled_time, 'meeting_url': meeting_url}
            )
            
        elif old_status == 'pending' and updated_request.status == 'rejected':
            # Refund coin to requester
            requester_profile = updated_request.requester.profile
            requester_profile.skill_coins += 1
            requester_profile.save()

    


class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # Total skills created by this user
        total_skills = Skill.objects.filter(owner=user).count()

        # Total requests received on user’s skills
        total_requests_received = SkillRequest.objects.filter(
            skill__owner=user
        ).count()

        # Total requests sent by this user
        total_requests_sent = SkillRequest.objects.filter(
            requester=user
        ).count()

        # Accepted requests received
        accepted_requests = SkillRequest.objects.filter(
            skill__owner=user,
            status='accepted'
        ).count()

        # Rejected requests received
        rejected_requests = SkillRequest.objects.filter(
            skill__owner=user,
            status='rejected'
        ).count()

        # Average rating of user's skills
        reviews = Review.objects.filter(skill__owner=user)
        if reviews.exists():
            average_rating = round(
                sum([r.rating for r in reviews]) / reviews.count(), 1
            )
        else:
            average_rating = 0

        return Response({
            "total_skills": total_skills,
            "total_requests": total_requests_received,
            "total_requests_sent": total_requests_sent,
            "accepted_requests": accepted_requests,
            "rejected_requests": rejected_requests,
            "average_rating": average_rating
        })





class ReviewCreateView(generics.CreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        skill = serializer.validated_data['skill']

        # Check if accepted request exists
        accepted_request = SkillRequest.objects.filter(
            skill=skill,
            requester=user,
            status='accepted'
        ).exists()

        if not accepted_request:
            raise ValidationError("You can only review accepted skills.")

        # Check if already reviewed
        already_reviewed = Review.objects.filter(
            skill=skill,
            reviewer=user
        ).exists()

        if already_reviewed:
            raise ValidationError("You have already reviewed this skill.")

        serializer.save(reviewer=user)







class ReviewListView(generics.ListAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['rating', 'created_at']
    ordering = ['-created_at'] # default
    
    def get_queryset(self):
        skill_id = self.kwargs['skill_id']
        return Review.objects.filter(skill__id=skill_id)

class ReviewDetailView(generics.DestroyAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]
    queryset = Review.objects.all()

    def perform_destroy(self, instance):
        if instance.reviewer != self.request.user:
            raise PermissionDenied("You can only delete your own reviews.")
        instance.delete()

from .models import Milestone, Report
from .serializers import MilestoneSerializer, ReportSerializer

class ReportCreateView(generics.CreateAPIView):
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(reporter=self.request.user)

from django.db.models import Avg, Count
class LeaderboardView(generics.ListAPIView):
    serializer_class = SkillSerializer
    permission_classes = [AllowAny]
    pagination_class = None

    def get_queryset(self):
        # Top 10 skills by average rating, must have at least 1 review
        return Skill.objects.annotate(
            avg_rating=Avg('reviews__rating'),
            review_count=Count('reviews')
        ).filter(review_count__gt=0).order_by('-avg_rating', '-review_count')[:10]

class MilestoneListCreateView(generics.ListCreateAPIView):
    serializer_class = MilestoneSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Milestone.objects.filter(request_id=self.kwargs['request_id'])

    def perform_create(self, serializer):
        skill_request = SkillRequest.objects.get(id=self.kwargs['request_id'])
        # Ensure only the owner or requester can add milestones
        if self.request.user != skill_request.skill.owner and self.request.user != skill_request.requester:
            raise PermissionDenied("You do not have permission to add milestones to this request.")
        serializer.save(request=skill_request)

class MilestoneUpdateView(generics.UpdateAPIView):
    serializer_class = MilestoneSerializer
    permission_classes = [IsAuthenticated]
    queryset = Milestone.objects.all()

    def perform_update(self, serializer):
        milestone = self.get_object()
        # Ensure only owner or requester can update
        if self.request.user != milestone.request.skill.owner and self.request.user != milestone.request.requester:
            raise PermissionDenied("You do not have permission to update this milestone.")
        serializer.save()