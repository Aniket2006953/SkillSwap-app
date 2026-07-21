from rest_framework import serializers
from .models import Skill, SkillRequest, Review, Meeting, Milestone
from bson import ObjectId
from bson.errors import InvalidId


class SkillSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)   # ✅ FIX
    owner = serializers.CharField(source="owner.id", read_only=True)
    owner_username = serializers.ReadOnlyField(source='owner.username')
    average_rating = serializers.SerializerMethodField()
    request_status = serializers.SerializerMethodField()

    class Meta:
        model = Skill
        fields = ['id', 'owner', 'owner_username', 'title', 'description', 'category', 'level', 'city', 'image', 'video', 'average_rating', 'request_status', 'created_at']

    def get_average_rating(self, obj):
        reviews = Review.objects.filter(skill=obj)
        if reviews.exists():
            total = sum([review.rating for review in reviews])
            return round(total / reviews.count(), 1)
        return 0

    def get_request_status(self, obj):
        user = self.context.get('request').user if 'request' in self.context else None
        if user and user.is_authenticated:
            request_obj = SkillRequest.objects.filter(skill=obj, requester=user).first()
            return request_obj.status if request_obj else None
        return None


class MeetingSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    request_id = serializers.CharField(source='request.id', read_only=True)

    class Meta:
        model = Meeting
        fields = ['id', 'request_id', 'scheduled_time', 'duration_minutes', 'meeting_url', 'created_at']

class MilestoneSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    request_id = serializers.CharField(source='request.id', read_only=True)

    class Meta:
        model = Milestone
        fields = ['id', 'request_id', 'title', 'is_completed', 'created_at']

class SkillRequestSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)

    # Use skillId for writing, and skill as a read-only string for serialization
    skillId = serializers.PrimaryKeyRelatedField(
        queryset=Skill.objects.all(), source='skill', write_only=True
    )
    skill = serializers.CharField(source='skill.id', read_only=True)
    requester = serializers.CharField(source='requester.id', read_only=True)

    skill_title = serializers.ReadOnlyField(source='skill.title')
    skill_owner = serializers.ReadOnlyField(source='skill.owner.username')
    requester_username = serializers.ReadOnlyField(source='requester.username')
    meeting = MeetingSerializer(read_only=True)
    milestones = MilestoneSerializer(many=True, read_only=True)

    class Meta:
        model = SkillRequest
        fields = ['id', 'skill', 'skillId', 'skill_title', 'skill_owner', 'requester', 'requester_username', 'status', 'meeting', 'milestones', 'created_at']
        read_only_fields = ['requester', 'status', 'created_at']

    def to_internal_value(self, data):
        # Create a mutable copy if it's a QueryDict or other immutable mapping
        if hasattr(data, 'dict'):
            data = data.dict()
        else:
            data = dict(data)

        # We need to check both 'skill' and 'skillId' (sent by frontend)
        # Frontend sends 'skillId', but we also support 'skill'
        skill_id = data.get("skillId") or data.get("skill")

        if skill_id:
            try:
                # Ensure it's a valid MongoDB ObjectId string format
                validated_id = str(ObjectId(skill_id))
                # Normalize both to the same validated ID
                data["skill"] = validated_id
                data["skillId"] = validated_id
            except (InvalidId, TypeError):
                raise serializers.ValidationError({"skillId": "Invalid Skill ID format"})

        return super().to_internal_value(data)

            
class ReviewSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)   # ✅ FIX
    reviewer = serializers.ReadOnlyField(source='reviewer.username')

    class Meta:
        model = Review
        fields = '__all__'
        read_only_fields = ['reviewer', 'created_at']

from .models import Report

class ReportSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    reporter = serializers.ReadOnlyField(source='reporter.username')

    class Meta:
        model = Report
        fields = ['id', 'reporter', 'skill', 'review', 'reason', 'is_resolved', 'created_at']
        read_only_fields = ['reporter', 'is_resolved', 'created_at']