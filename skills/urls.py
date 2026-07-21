from django.urls import path
from .views import SkillListCreateView, SkillDetailView, AllSkillsView, SkillRequestCreateView, OwnerSkillRequestListView, SkillRequestUpdateView
from .views import DashboardStatsView, ReviewCreateView, ReviewDetailView
from .views import ReviewListView, LeaderboardView, ReportCreateView
from . views import OwnerSkillRequestListView
from .views import MySkillRequestListView






from .views import MilestoneListCreateView, MilestoneUpdateView

urlpatterns = [
    path('', SkillListCreateView.as_view()),
    path('all/', AllSkillsView.as_view()),
    path('requests/', SkillRequestCreateView.as_view()),
    path('my-requests/', MySkillRequestListView.as_view()),
    path('review/', ReviewCreateView.as_view()),
    path('dashboard/', DashboardStatsView.as_view()),
    path('leaderboard/', LeaderboardView.as_view()),
    path('report/', ReportCreateView.as_view()),
    path('review-detail/<str:pk>/', ReviewDetailView.as_view()),
    path('reviews/<str:skill_id>/', ReviewListView.as_view()),
    path('owner-requests/', OwnerSkillRequestListView.as_view()),
    path('requests/<str:request_id>/milestones/', MilestoneListCreateView.as_view()),
    path('milestones/<str:pk>/', MilestoneUpdateView.as_view()),
    path('request/<str:pk>/', SkillRequestUpdateView.as_view()),  # MUST COME BEFORE <int:pk>
    path('<str:pk>/', SkillDetailView.as_view()),  # ALWAYS LAST
]

