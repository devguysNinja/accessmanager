# Generated by Django 3.2.23 on 2024-03-06 11:34

import datetime
from django.db import migrations, models
from django.utils.timezone import utc


class Migration(migrations.Migration):

    dependencies = [
        ('staffcalendar', '0014_alter_monthlyroster_batch'),
    ]

    operations = [
        migrations.RenameField(
            model_name='monthlyroster',
            old_name='start_date',
            new_name='shift_date',
        ),
        migrations.RenameField(
            model_name='monthlyroster',
            old_name='work_days',
            new_name='work_day',
        ),
        migrations.AddField(
            model_name='monthlyroster',
            name='week_start_date',
            field=models.DateField(default=datetime.datetime(2024, 3, 6, 11, 34, 17, 749074, tzinfo=utc)),
            preserve_default=False,
        ),
        # migrations.AlterUniqueTogether(
        #     name='monthlyroster',
        #     unique_together={('shift_date', 'work_day', 'shift')},
        # ),
    ]
