# Generated by Django 3.2.23 on 2024-04-04 01:01

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('staffcalendar', '0020_auto_20240327_1156'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='monthlyroster',
            options={'verbose_name_plural': 'Duty Roster'},
        ),
        migrations.AlterModelOptions(
            name='shifttype',
            options={'verbose_name_plural': 'Shift Types'},
        ),
        migrations.AlterModelOptions(
            name='workday',
            options={'ordering': ['day_code'], 'verbose_name_plural': 'Work Days'},
        ),
    ]
