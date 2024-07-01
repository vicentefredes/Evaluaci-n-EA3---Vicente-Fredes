from django.contrib import admin
from .models import Formato, Genero, Artista, Album, Compra, Mensaje

# Register your models here.
admin.site.register(Formato)
admin.site.register(Genero)
admin.site.register(Artista)
admin.site.register(Album)
admin.site.register(Compra)
admin.site.register(Mensaje)