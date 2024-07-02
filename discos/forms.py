from django import forms
from .models import Formato, Genero, Artista, Album, Compra, Mensaje

from django.forms import ModelForm
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.contrib.auth.models import User

class ArtistaForm(forms.ModelForm):
    class Meta:
        model = Artista
        fields = [
            'nombre_artista', 'pais', 'biografia'
        ]
        labels = {
            'nombre_artista': "Nombre del Artista",
            'pais': "País",
            'biografia': "Biografía",
        }
        widgets = {
            'nombre_artista': forms.TextInput(attrs={'class': 'form-control'}),
            'pais': forms.TextInput(attrs={'class': 'form-control'}),
            'biografia': forms.Textarea(attrs={'class': 'form-control'}),
        }

class AlbumForm(forms.ModelForm):
    class Meta:
        model = Album
        fields = [
            'id_artista', 'nombre_disco', 'fecha_lanzamiento', 
            'precio', 'id_formato', 'id_genero', 'portada'
        ]
        labels = {
            'id_artista': "Artista",
            'nombre_disco': "Nombre del Disco",
            'fecha_lanzamiento': "Fecha de Lanzamiento",
            'precio': "Precio",
            'id_formato': "Formato",
            'id_genero': "Género",
            'portada': "Portada",
        }
        widgets = {
            'id_artista': forms.Select(attrs={'class': 'form-control'}),
            'nombre_disco': forms.TextInput(attrs={'class': 'form-control'}),
            'fecha_lanzamiento': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'precio': forms.NumberInput(attrs={'class': 'form-control'}),
            'id_formato': forms.Select(attrs={'class': 'form-control'}),
            'id_genero': forms.Select(attrs={'class': 'form-control'}),
            'portada': forms.FileInput(attrs={'class': 'form-control'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['id_artista'].queryset = Artista.objects.order_by('nombre_artista')   

class MensajeForm(forms.ModelForm):
    class Meta:
        model = Mensaje
        fields = [
            'nombre', 'correo_electronico', 'mensaje'
        ]
        labels = {
            'nombre': "Nombre",
            'correo_electronico': "Correo Electrónico",
            'mensaje': "Mensaje",
        }
        widgets = {
            'nombre': forms.TextInput(attrs={'class': 'form-control'}),
            'correo_electronico': forms.EmailInput(attrs={'class': 'form-control'}),
            'mensaje': forms.Textarea(attrs={'class': 'form-control'}),
        }