# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('bookings', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='bookableapprover',
            name='bookable',
            field=models.ForeignKey(related_name='approvers', to='bookings.Bookable'),
        ),
    ]
