# Generated by Django 4.1.2 on 2024-07-02 01:31

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('discos', '0002_compra_finalizada'),
    ]

    operations = [
        migrations.RenameField(
            model_name='artista',
            old_name='nacionalidad',
            new_name='pais',
        ),
    ]
