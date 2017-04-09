from __future__ import unicode_literals
from django.core.exceptions import ValidationError
from django.utils.encoding import python_2_unicode_compatible
from django.utils import timezone
import django.db.models.signals
from django.core.mail import send_mail
from django.dispatch import receiver

from django.db import models
from django.conf import settings

from model_utils import Choices
import model_utils.fields


class TableLockerMixin(object):
    def lock_table(self, mode='ACCESS EXCLUSIVE'):
        from django.db import connection
        cursor = connection.cursor()
        cursor.execute(
            'LOCK TABLE {} IN {} MODE'.format(self._meta.db_table, mode)
        )


@python_2_unicode_compatible
class Bookable(models.Model):
    TYPE = Choices('room', )
    type = model_utils.fields.StatusField(choices_name='TYPE', db_index=True)
    name = models.CharField(max_length=100, blank=False, null=False)
    notes = models.TextField(blank=True, null=False)

    booking_start = models.DateTimeField(null=True, blank=True)
    booking_end = models.DateTimeField(null=True, blank=True)

    @property
    def active_approvers(self):
        return self.approvers.filter(
            authority_start__lt=timezone.now(),
            authority_end__gt=timezone.now()
        )

    def __str__(self):
        return "{} ({})".format(self.name, self.type)


@python_2_unicode_compatible
class BookableApprover(models.Model):
    bookable = models.ForeignKey(Bookable, null=False, related_name='approvers')
    approver = models.ForeignKey(settings.AUTH_USER_MODEL, null=False)

    authority_start = models.DateTimeField(null=False, blank=False)
    authority_end = models.DateTimeField(null=False, blank=False)

    def __str__(self):
        return "{} - authority over {} from {} to {}".format(self.approver, self.bookable, self.authority_start,
                                                             self.authority_end)


@python_2_unicode_compatible
class Booking(models.Model):
    TYPE = Choices('booking', 'warning', 'unavailable')
    type = model_utils.fields.StatusField(choices_name='TYPE', db_index=True)

    creator = models.ForeignKey(settings.AUTH_USER_MODEL, null=False, blank=False)
    created_date = models.DateTimeField(auto_now_add=True, null=False, blank=False)

    name = models.CharField(max_length=100, blank=False, null=False)
    description = models.TextField(blank=True, null=False)

    def __str__(self):
        return "{}: {} by {}".format(self.type, self.name, self.creator)


@python_2_unicode_compatible
class BookingPart(TableLockerMixin, models.Model):
    STATUS = Choices('pending_approval', 'approved', 'rejected', 'cancelled')
    status = model_utils.fields.StatusField()

    booking = models.ForeignKey(Booking, null=False, blank=False)
    bookable = models.ForeignKey(Bookable, null=False, blank=False)
    created_date = models.DateTimeField(auto_now_add=True, null=False, blank=False)

    booking_start = models.DateTimeField(null=False, blank=False)
    booking_end = models.DateTimeField(null=False, blank=True)

    def validate_unique(self, exclude=None):
        super(BookingPart, self).validate_unique(exclude)

        if self.status == BookingPart.STATUS.approved:
            # we need to ensure that there are no active bookings for this!
            self.lock_table('SHARE ROW EXCLUSIVE')
            overlapping_bookings = BookingPart.objects.filter(
                bookable=self.bookable, booking_start__lt=self.booking_end, booking_end__gt=self.booking_start
            )
            overlapping_bookings = overlapping_bookings.exclude(
                booking__type='warning'
            )

            if not self._state.adding and self.pk is not None:
                overlapping_bookings = overlapping_bookings.exclude(pk=self.pk)

            if overlapping_bookings:
                raise ValidationError({
                    'booking_start': ['This booking overlaps with an existing booking'],
                    'booking_end': ['This booking overlaps with an existing booking'],
                })

    @property
    def potential_overlaps(self):
        overlapping_bookings = BookingPart.objects.filter(
            bookable=self.bookable, booking_start__lt=self.booking_end, booking_end__gt=self.booking_start
        )
        if self.pk is not None:
            overlapping_bookings = overlapping_bookings.exclude(pk=self.pk)
        return overlapping_bookings

    def __str__(self):
        return "{}: {} to {} on {}".format(self.status, self.booking_start, self.booking_end, self.bookable)


@receiver(django.db.models.signals.post_save, sender=BookingPart)
def post_booking_save(sender, instance, created, **kwargs):
    if not created:
        return
    booking = instance.booking
    approver_emails = instance.bookable.active_approvers.values_list('approver__email', flat=True)

    send_mail(
        '[ICUMedia Room Bookings] New Booking: {}'.format(booking.name),
        """Hi!

{} ({}) has created a new booking:

https://room-bookings.media.su.ic.ac.uk/bookings/{}

Please approve or reject it at your earliest convenience.

Thanks,
Mr. Room Bookings""".format(booking.creator.get_full_name(), booking.creator.username, booking.id),
        'mediatech@imperial.ac.uk',
        list(approver_emails),
    )
