from rest_framework.exceptions import ValidationError
import bookings.models


class UniqueBookingPartValidator(object):
    message = 'This booking overlaps with another.'
    missing_message = 'This field is required.'
    queryset = bookings.models.BookingPart.objects.all()
    fields = ['bookable', 'booking_end', 'booking_start', 'status']

    def __init__(self, message=None):
        self.message = message or self.message
        self.instance = None

    def set_context(self, serializer):
        self.instance = getattr(serializer, 'instance', None)

    def enforce_required_fields(self, attrs):
        if self.instance is not None:
            return

        missing = dict([
            (field_name, self.missing_message) for field_name in self.fields if field_name not in attrs
        ])
        if missing:
            raise ValidationError(missing)

    def filter_queryset(self, attrs, queryset):
        return queryset.filter(
            bookable=attrs.get('bookable', self.instance.bookable if self.instance else None),
            booking_start__lt=attrs.get('booking_end', self.instance.booking_end if self.instance else None),
            booking_end__gt=attrs.get('booking_start', self.instance.booking_start if self.instance else None),
            status='approved'
        ).exclude(
            booking__type='warning'
        )

    def exclude_current_instance(self, attrs, queryset):
        if self.instance is not None:
            return queryset.exclude(pk=self.instance.pk)
        return queryset

    def __call__(self, attrs):
        self.enforce_required_fields(attrs)

        if attrs['status'] != 'approved':
            return  # we don't care if it's not being approved

        booking = attrs.get('booking', self.instance.booking if self.instance else None)
        print(booking.type)
        if booking.type == 'warning':
            return  # we also don't care about conflicts if it's a "warning"

        queryset = self.queryset
        queryset = self.filter_queryset(attrs, queryset)
        queryset = self.exclude_current_instance(attrs, queryset)

        if queryset.exists():
            raise ValidationError(self.message)
