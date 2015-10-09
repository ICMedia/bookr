# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings
import model_utils.fields


class Migration(migrations.Migration):
	dependencies = [
		migrations.swappable_dependency(settings.AUTH_USER_MODEL),
	]

	operations = [
		migrations.CreateModel(
			name='Bookable',
			fields=[
				('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
				('type', model_utils.fields.StatusField(default=b'room', max_length=100, db_index=True,
														no_check_for_status=True, choices=[(b'room', b'room')])),
				('name', models.CharField(max_length=100)),
				('notes', models.TextField(blank=True)),
				('booking_start', models.DateTimeField(null=True, blank=True)),
				('booking_end', models.DateTimeField(null=True, blank=True)),
			],
		),
		migrations.CreateModel(
			name='BookableApprover',
			fields=[
				('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
				('authority_start', models.DateTimeField()),
				('authority_end', models.DateTimeField()),
				('approver', models.ForeignKey(to=settings.AUTH_USER_MODEL)),
				('bookable', models.ForeignKey(to='bookings.Bookable')),
			],
		),
		migrations.CreateModel(
			name='Booking',
			fields=[
				('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
				('type', model_utils.fields.StatusField(default=b'booking', max_length=100, db_index=True,
														no_check_for_status=True,
														choices=[(b'booking', b'booking'), (b'warning', b'warning'),
																 (b'unavailable', b'unavailable')])),
				('created_date', models.DateTimeField(auto_now_add=True)),
				('name', models.CharField(max_length=100)),
				('description', models.TextField(blank=True)),
				('creator', models.ForeignKey(to=settings.AUTH_USER_MODEL)),
			],
		),
		migrations.CreateModel(
			name='BookingPart',
			fields=[
				('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
				('status',
				 model_utils.fields.StatusField(default=b'pending_approval', max_length=100, no_check_for_status=True,
												choices=[(b'pending_approval', b'pending_approval'),
														 (b'approved', b'approved'), (b'rejected', b'rejected'),
														 (b'cancelled', b'cancelled')])),
				('created_date', models.DateTimeField(auto_now_add=True)),
				('booking_start', models.DateTimeField()),
				('booking_end', models.DateTimeField(blank=True)),
				('bookable', models.ForeignKey(to='bookings.Bookable')),
				('booking', models.ForeignKey(to='bookings.Booking')),
			],
		),
	]
