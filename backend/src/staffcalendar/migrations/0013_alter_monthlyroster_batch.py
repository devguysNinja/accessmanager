# Generated by Django 3.2.23 on 2024-03-06 01:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('staffcalendar', '0012_auto_20240305_1831'),
    ]

    operations = [
        migrations.AlterField(
            model_name='monthlyroster',
            name='batch',
            field=models.CharField(max_length=100),
        ),
    ]
