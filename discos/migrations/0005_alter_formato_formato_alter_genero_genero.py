# Generated by Django 4.1.2 on 2024-07-02 01:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('discos', '0004_alter_album_unique_together_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='formato',
            name='formato',
            field=models.CharField(max_length=20, unique=True),
        ),
        migrations.AlterField(
            model_name='genero',
            name='genero',
            field=models.CharField(max_length=20, unique=True),
        ),
    ]
