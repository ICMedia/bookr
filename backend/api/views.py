from rest_framework import viewsets, generics, permissions
from rest_framework_extensions.mixins import NestedViewSetMixin

from django.utils import timezone

import api.serializers
import bookings.models

import datetime


class BookablePermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True

        if request.user.is_superuser:
            return True

        return False


class BookingPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True

        return request.user.is_authenticated()

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        if request.user.is_superuser:
            return True
        if obj.creator == request.user:
            return True

        return False


class BookingPartPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True

        return request.user.is_authenticated()

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        if request.user.is_superuser:
            return True

        if obj.bookable.approvers.filter(approver=request.user).exists():
            return True
        if obj.booking.creator == request.user:
            return True

        return False


class CurrentUserView(generics.RetrieveAPIView):
    serializer_class = api.serializers.UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class BookableViewSet(viewsets.ModelViewSet):
    queryset = bookings.models.Bookable.objects.all()
    serializer_class = api.serializers.BookableWriteSerializer
    permission_classes = [BookablePermission]

    def get_serializer_class(self):
        if self.action in ('list', 'retrieve'):
            return api.serializers.BookableReadSerializer
        else:
            return api.serializers.BookableWriteSerializer


class BookingViewSet(viewsets.ModelViewSet):
    queryset = bookings.models.Booking.objects.all()
    serializer_class = api.serializers.BookingWriteSerializer
    permission_classes = [BookingPermission]

    def get_serializer_class(self):
        if self.action in ('list', 'retrieve'):
            return api.serializers.BookingReadSerializer
        else:
            return api.serializers.BookingWriteSerializer

    def get_queryset(self):
        qs = super(BookingViewSet, self).get_queryset()

        if self.request.query_params.get('awaiting_approval_by', None):
            can_approve_qs = bookings.models.BookableApprover.objects.filter(
                approver__username=self.request.query_params['awaiting_approval_by'],
                authority_start__lt=timezone.now(),
                authority_end__gt=timezone.now()
            )
            qs = qs.filter(
                bookingpart__bookable__approvers=can_approve_qs, bookingpart__status='pending_approval'
            ).distinct().order_by('bookingpart__booking_start')

        if self.request.query_params.get('created_by', None):
            qs = qs.filter(
                creator__username=self.request.query_params['created_by']
            )

        if self.request.query_params.get('in_the_future', None):
            qs = qs.filter(
                bookingpart__booking_end__gte=timezone.now()
            )

        return qs


class BookingPartViewSet(NestedViewSetMixin, viewsets.ModelViewSet):
    queryset = bookings.models.BookingPart.objects.all()
    serializer_class = api.serializers.BookingPartWriteSerializer
    permission_classes = [BookingPartPermission]

    def get_serializer_class(self):
        if self.action in ('list', 'retrieve'):
            return api.serializers.BookingPartReadSerializer
        else:
            return api.serializers.BookingPartWriteSerializer

    def get_queryset(self):
        queryset = super(BookingPartViewSet, self).get_queryset()

        in_date = self.request.query_params.get('in_date') or ''
        in_date_bits = in_date.split('-')
        if len(in_date_bits) > 3:
            in_date_bits = []  # discard invalid

        try:
            in_date_bits = [int(x) for x in in_date_bits]

            start_date = None
            end_date = None
            if len(in_date_bits) == 1:
                start_date = datetime.date(in_date_bits[0], 1, 1)
                end_date = datetime.date(in_date_bits[0] + 1, 1, 1)
            elif len(in_date_bits) == 2:
                start_date = datetime.date(in_date_bits[0], in_date_bits[1], 1)
                if in_date_bits[1] != 12:
                    end_date = datetime.date(in_date_bits[0], in_date_bits[1] + 1, 1)
                else:
                    end_date = datetime.date(in_date_bits[0] + 1, 1, 1)
                start_date -= datetime.timedelta(days=7)
                end_date += datetime.timedelta(days=7)
            elif len(in_date_bits) == 3:
                start_date = datetime.date(in_date_bits[0], in_date_bits[1], in_date_bits[2])
                end_date = start_date + datetime.timedelta(days=1)

            if start_date and end_date:
                queryset = queryset.filter(
                    booking_start__lt=end_date,
                    booking_end__gte=start_date
                )
        except ValueError:
            pass

        return queryset
