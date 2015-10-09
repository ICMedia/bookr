from django.contrib.auth import get_user_model

from rest_framework import serializers
from rest_framework.fields import empty, SerializerMethodField, SkipField

import bookings.models
from . import validators

import datetime


class UserSerializer(serializers.ModelSerializer):
    loggedIn = serializers.SerializerMethodField()
    firstName = serializers.CharField(source='first_name')
    lastName = serializers.CharField(source='last_name')
    isApprover = serializers.SerializerMethodField()

    def get_loggedIn(self, obj):
        return obj.is_authenticated()

    def get_isApprover(self, obj):
        return bookings.models.BookableApprover.objects.filter(
            approver=obj,
            authority_start__lt=datetime.datetime.now(),
            authority_end__gt=datetime.datetime.now()
        ).exists()

    class Meta:
        model = get_user_model()
        fields = ('username', 'firstName', 'lastName', 'loggedIn', 'isApprover')


class BookableApproverReadSerializer(serializers.ModelSerializer):
    approver = UserSerializer()

    class Meta:
        model = bookings.models.BookableApprover
        fields = (
            'id',
            'approver', 'authority_start', 'authority_end'
        )


class BookableWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = bookings.models.Bookable
        fields = (
            'id',
            'type', 'name', 'notes', 'booking_start', 'booking_end'
        )


class BookableReadSerializer(serializers.ModelSerializer):
    approvers = BookableApproverReadSerializer(many=True)

    class Meta:
        model = bookings.models.Bookable
        fields = (
            'id',
            'type', 'name', 'notes', 'booking_start', 'booking_end',
            'approvers'
        )


class BookingReadSerializer(serializers.ModelSerializer):
    creator = UserSerializer()

    class Meta:
        model = bookings.models.Booking
        fields = (
            'id',
            'type', 'name', 'description', 'creator', 'created_date',
        )


class BookingWriteSerializer(serializers.ModelSerializer):
    creator = serializers.PrimaryKeyRelatedField(read_only=True, default=serializers.CurrentUserDefault())

    class Meta:
        model = bookings.models.Booking
        fields = (
            'id',
            'type', 'name', 'description', 'creator', 'created_date',
        )

    def create(self, validated_data):
        request = self.context['request']
        user = request.user

        if not user.is_authenticated():
            raise Exception("no user authenticated?!?")

        validated_data.update({
            'creator': user,
        })

        if not user.is_staff:
            validated_data.update({
                'type': 'booking',
            })

        return super(BookingWriteSerializer, self).create(validated_data)


class BookingPartReadSerializer(serializers.ModelSerializer):
    booking = BookingReadSerializer()
    bookable = BookableReadSerializer()
    potential_overlaps = SerializerMethodField()

    class Meta:
        model = bookings.models.BookingPart
        fields = (
            'id',
            'status', 'booking', 'bookable', 'created_date', 'booking_start', 'booking_end',
            'potential_overlaps'
        )

    def create(self, validated_data):
        raise Exception("this is nonsensical")

    def update(self, instance, validated_data):
        raise Exception("this is nonsensical")

    def get_potential_overlaps(self, obj):
        if self.context.get('nested_bookingpartreadserializer', False):
            return []
        elif obj.status == 'approved':
            return []

        ctx = {}
        ctx.update(self.context)
        ctx['nested_bookingpartreadserializer'] = True

        return BookingPartReadSerializer(obj.potential_overlaps, many=True, context=ctx).data


class BookingPartWriteSerializer(serializers.ModelSerializer):


    class Meta:
        model = bookings.models.BookingPart
        fields = (
            'id',
            'status', 'booking', 'bookable', 'created_date', 'booking_start', 'booking_end'
        )
        validators = [
            validators.UniqueBookingPartValidator()
        ]

    def to_internal_value(self, data=empty):
        internal_values = super(BookingPartWriteSerializer, self).to_internal_value(data)
        if 'bookable' in internal_values:
            user = self.context['request'].user
            if not internal_values['bookable'].active_approvers.filter(approver=user).exists():
                internal_values['status'] = 'pending_approval'
            elif internal_values.get('status', empty) is empty:
                internal_values['status'] = 'approved'
        return internal_values

    def create(self, validated_data):
        request = self.context['request']
        user = request.user

        if not user.is_authenticated():
            raise Exception("no user authenticated?!?")

        if not user.is_staff and validated_data.booking.creator != user:
            raise Exception("user cannot create new part on someone else's booking")

        if not validated_data['bookable'].active_approvers.filter(approver=user):
            validated_data.update({
                'status': 'pending_approval',
            })
        else:
            validated_data.update({
                'status': 'approved',
            })

        if (
                    (validated_data['bookable'].booking_end is not None and validated_data['bookable'].booking_end <
                        validated_data['booking_end'])
                or (validated_data['bookable'].booking_start and validated_data['bookable'].booking_start >
                    validated_data[
                        'booking_start'])
        ):
            raise Exception("booking out of range of bookable period")

        return super(BookingPartWriteSerializer, self).create(validated_data)

    def update(self, instance, validated_data):
        request = self.context['request']
        user = request.user

        bookable = validated_data.get('bookable') or instance.bookable

        if not bookable.active_approvers.filter(approver=user) and 'status' in validated_data:
            del validated_data['status']

        return super(BookingPartWriteSerializer, self).update(instance, validated_data)
