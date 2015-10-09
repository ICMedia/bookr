from django.contrib import admin

from . import models

admin.site.register(models.Bookable)
admin.site.register(models.BookableApprover)
admin.site.register(models.Booking)
admin.site.register(models.BookingPart)
