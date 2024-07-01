from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from .models import Formato, Genero, Artista, Album, Compra, Mensaje
from .forms import ArtistaForm, AlbumForm, MensajeForm 

# Create your views here.

def index(request):
    context = {'clase':'index'}
    return render(request, 'discos/index.html', context)

#CRUD de Artistas
@login_required
def crud_artistas(request):
    artistas = Artista.objects.all().order_by('nombre_artista')
    context = {'artistas': artistas, 'clase': 'mantenedores'}
    return render(request, 'discos/artistas_list.html', context)

@login_required
def artistasAdd(request):
    if request.method == "POST":
        form = ArtistaForm(request.POST)
        if form.is_valid():
            form.save()
            nombre = form.cleaned_data.get('nombre_artista')
            mensaje = f"{nombre} ha sido agregado exitosamente"
            return render(request, 'discos/artistas_add.html', {'form': ArtistaForm(), 'mensaje': mensaje, 'clase': 'mantenedores'})
    else:
        form = ArtistaForm()
    return render(request, 'discos/artistas_add.html', {'form': form, 'clase': 'mantenedores'})

@login_required
def artistas_edit(request, pk):
    artista = Artista.objects.get(id_artista=pk)
    if request.method == "POST":
        form = ArtistaForm(request.POST, instance=artista)
        if form.is_valid():
            form.save()
            mensaje = f"Los datos de {artista.nombre_artista} han sido actualizados exitosamente"
            return render(request, 'discos/artistas_edit.html', {'artista': artista, 'mensaje': mensaje, 'form': form, 'clase': 'mantenedores'})
    else:
        form = ArtistaForm(instance=artista)
    return render(request, 'discos/artistas_edit.html', {'artista': artista, 'form': form, 'clase': 'mantenedores'})

@login_required
def artistas_del(request, pk):
    context = {}
    try:
        artista = Artista.objects.get(id_artista=pk)
        artista.delete()
        mensaje = f"{artista.nombre_artista} ha sido eliminado"
        context = {'mensaje': mensaje, 'artistas': Artista.objects.all().order_by('nombre_artista'), 'clase': 'mantenedores'}
        return render(request, 'discos/artistas_list.html', context)
    except Artista.DoesNotExist:
        mensaje = f"ERROR: el id {pk} no existe"
        context = {'mensaje': mensaje, 'artistas': Artista.objects.all().order_by('nombre_artista'), 'clase': 'mantenedores'}
        return render(request, 'discos/artistas_list.html', context)

#CRUD de álbumes    
@login_required
def crud_albums(request):
    albums = Album.objects.all().order_by('id_artista', 'nombre_disco')
    context = {'albums': albums, 'clase': 'mantenedores'}
    return render(request, 'discos/albums_list.html', context)

@login_required
def albumsAdd(request):
    if request.method == "POST":
        form = AlbumForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            nombre = form.cleaned_data.get('nombre_disco')
            mensaje = f"{nombre} ha sido agregado exitosamente"
            return render(request, 'discos/albums_add.html', {'form': AlbumForm(), 'mensaje': mensaje, 'clase': 'mantenedores'})
    else:
        form = AlbumForm()
    return render(request, 'discos/albums_add.html', {'form': form, 'clase': 'mantenedores'})

@login_required
def albums_edit(request, pk):
    album = Album.objects.get(id_album=pk)
    if request.method == "POST":
        form = AlbumForm(request.POST, request.FILES, instance=album)
        if form.is_valid():
            form.save()
            mensaje = f"Los datos del álbum {album.nombre_disco} han sido actualizados exitosamente"
            return render(request, 'discos/albums_edit.html', {'album': album, 'mensaje': mensaje, 'form': form, 'clase': 'mantenedores'})
    else:
        form = AlbumForm(instance=album)
    return render(request, 'discos/albums_edit.html', {'album': album, 'form': form, 'clase': 'mantenedores'})

@login_required
def albums_del(request, pk):
    context = {}
    try:
        album = Album.objects.get(id_album=pk)
        album.delete()
        mensaje = f"El álbum {album.nombre_disco} ha sido eliminado"
        context = {'mensaje': mensaje, 'albums': Album.objects.all().order_by('nombre_disco'), 'clase': 'mantenedores'}
        return render(request, 'discos/albums_list.html', context)
    except Album.DoesNotExist:
        mensaje = f"ERROR: el id {pk} no existe"
        context = {'mensaje': mensaje, 'albums': Album.objects.all().order_by('nombre_disco'), 'clase': 'mantenedores'}
        return render(request, 'discos/albums_list.html', context)
    
#Mensajes
@login_required
def listadoMensajes(request):
    mensajes = Mensaje.objects.all().order_by('-fecha')
    context = {'mensajes': mensajes, 'clase': 'mensajes'}
    return render(request, 'discos/mensajes.html', context)

@login_required
def mensajes_del(request, pk):
    context = {}
    try:
        mensaje = Mensaje.objects.get(id_mensaje=pk)
        mensaje.delete()
        mensajeAlert = f"El mensaje ha sido eliminado"
        context = {'mensaje': mensajeAlert, 'mensajes': Mensaje.objects.all().order_by('-fecha'), 'clase': 'mensajes'}
        return render(request, 'discos/mensajes.html', context)
    except Album.DoesNotExist:
        mensaje = f"ERROR: el id {pk} no existe"
        context = {'mensaje': mensajeAlert, 'mensajes': Mensaje.objects.all().order_by('-fecha'), 'clase': 'mensajes'}
        return render(request, 'discos/mensajes.html', context)
    
def mensajesAdd(request):
    if request.method == "POST":
        form = MensajeForm(request.POST)
        if form.is_valid():
            form.save()
            nombre = form.cleaned_data.get('nombre')
            mensaje = f"{nombre}, tu mensaje ha sido enviado exitosamente. ¡Gracias por comunicarte con nosotros!"
            return render(request, 'discos/contacto.html', {'form': MensajeForm(), 'mensaje': mensaje, 'clase': 'contacto'})
    else:
        form = MensajeForm()
    return render(request, 'discos/contacto.html', {'form': form, 'clase': 'contacto'})

#Discos (para el cliente)
def listado_albums(request):
    albums = Album.objects.all().order_by('id_artista', 'nombre_disco')
    context = {'albums': albums, 'clase': 'discos'}
    return render(request, 'discos/discos.html', context)