from django import forms
from .models import Formato, Genero, Artista, Album, Compra, Mensaje
from django.forms import ModelForm
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.contrib.auth.models import User
from datetime import date
from django.core.exceptions import ValidationError

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
            'nombre_artista': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Ejemplo: Blur'}),
            'pais': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Ejemplo: Inglaterra'}),
            'biografia': forms.Textarea(attrs={'class': 'form-control', 'placeholder':'Ejemplo: Blur es una banda británica de rock formada en 1988 en Londres.'}),
        }
        error_messages = {
            'nombre_artista': {
                'required': "El campo es obligatorio.",
            },
            'pais': {
                'required': "El campo es obligatorio.",
        }
    }

class AlbumForm(forms.ModelForm):
    class Meta:
        model = Album
        fields = [
            'id_artista', 'nombre_disco', 'fecha_lanzamiento', 
            'precio', 'id_formato', 'id_genero', 'stock', 'portada'
        ]
        labels = {
            'id_artista': "Artista",
            'nombre_disco': "Nombre del Disco",
            'fecha_lanzamiento': "Fecha de Lanzamiento",
            'precio': "Precio",
            'id_formato': "Formato",
            'id_genero': "Género",
            'stock': "Stock",
            'portada': "Portada"
        }
        widgets = {
            'id_artista': forms.Select(attrs={'class': 'form-control'}),
            'nombre_disco': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Ejemplo: Brat'}),
            'fecha_lanzamiento': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'precio': forms.NumberInput(attrs={'class': 'form-control', 'placeholder': 'Ejemplo: 5000'}),
            'id_formato': forms.Select(attrs={'class': 'form-control'}),
            'id_genero': forms.Select(attrs={'class': 'form-control'}),
            'stock': forms.NumberInput(attrs={'class': 'form-control'}),
            'portada': forms.FileInput(attrs={'class': 'form-control'}),
        }
        error_messages = {
            'nombre_disco': {
                'required': "El campo es obligatorio.",
            },
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['id_artista'].queryset = Artista.objects.order_by('nombre_artista')  
        self.fields['id_genero'].queryset = Genero.objects.order_by('genero')  

    def clean_precio(self):
        precio = self.cleaned_data['precio']
        if precio < 0:
            raise ValidationError("El precio no puede ser negativo.")
        return precio
    
    def clean_stock(self):
        stock = self.cleaned_data['stock']
        if stock < 0:
            raise ValidationError("El precio no puede ser negativo.")
        return stock

    def clean_fecha_lanzamiento(self):
        fecha_lanzamiento = self.cleaned_data['fecha_lanzamiento']
        if fecha_lanzamiento > date.today():
            raise ValidationError("La fecha de lanzamiento no puede ser una fecha futura.")
        return fecha_lanzamiento

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
            'nombre': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Nombre'}),
            'correo_electronico': forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'usuario@mail.com'}),
            'mensaje': forms.Textarea(attrs={'class': 'form-control', 'placeholder': 'Tu mensaje aquí...'}),
        }
        error_messages = {
            'nombre': {
                'required': "El campo es obligatorio.",
            },
            'mensaje': {
                'required': "El campo es obligatorio.",
            },
        }