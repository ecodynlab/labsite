# Generated by Django 4.1 on 2023-01-20 23:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('WebApp', '0002_alter_station_station_elev_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='measurement',
            name='measurement_date',
            field=models.DateField(auto_now_add=True, help_text='Measurement Date'),
        ),
    ]