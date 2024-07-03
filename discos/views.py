from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import views as auth_views
from django.contrib.auth.views import LoginView
from django.contrib.auth.forms import AuthenticationForm
from .models import Formato, Genero, Artista, Album, Compra, Mensaje
from .forms import ArtistaForm, AlbumForm, MensajeForm 
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.db.models import Sum

# Create your views here.

def custom_login(request):
    if request.method == 'POST':
        return auth_views.LoginView.as_view(template_name='discos/login.html')(request)
    else:
        form = AuthenticationForm()
        context = {'clase': 'login', 'form': form} 
        return render(request, 'discos/login.html', context)
    
def index(request):
    context = {'clase':'index'}
    return render(request, 'discos/index.html', context)

#CRUD de Artistas
@login_required
def crud_artistas(request):
    artistas = Artista.objects.all().order_by('nombre_artista')
    paginator = Paginator(artistas, 25)

    page = request.GET.get('page')

    try:
        artistas = paginator.page(page)
    except PageNotAnInteger:
        artistas = paginator.page(1)
    except EmptyPage:
        artistas = paginator.page(paginator.num_pages)

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
    albums = Album.objects.all().order_by('id_artista__nombre_artista', 'nombre_disco')
    paginator = Paginator(albums, 25)

    page = request.GET.get('page')

    try:
        albums = paginator.page(page)
    except PageNotAnInteger:
        albums = paginator.page(1)
    except EmptyPage:
        albums = paginator.page(paginator.num_pages)


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
    except Mensaje.DoesNotExist:
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

@login_required
def cambiar_estado(request, pk):
    mensaje = Mensaje.objects.get(id_mensaje=pk)
    if mensaje.leido == True:
        mensaje.leido = False
    else: 
        mensaje.leido = True
    mensaje.save()
    return redirect('mensajes')


#Discos (para el cliente)
def listado_albums(request):
    albums = Album.objects.all().order_by('id_artista__nombre_artista', 'nombre_disco')
    paginator = Paginator(albums, 12)  

    page = request.GET.get('page')

    try:
        albums = paginator.page(page)
    except PageNotAnInteger:
        albums = paginator.page(1)
    except EmptyPage:
        albums = paginator.page(paginator.num_pages)

    context = {'albums': albums, 'clase': 'discos'}
    return render(request, 'discos/discos.html', context)

# Vista para agregar productos al carrito
def agregar_al_carrito(request, fk_album):
    album = Album.objects.get(id_album=fk_album)
    
    if request.user.is_authenticated:
        # Usuario autenticado: obtener o crear la compra en progreso del usuario
        compra, created = Compra.objects.get_or_create(id_usuario=request.user, finalizada=False)
        if created:
            print("Se creó una nueva compra para el usuario autenticado.")
    else:
        # Usuario invitado: verificar si hay una compra en la sesión
        compra_id = request.session.get('id_compra')
        if compra_id:
            compra = Compra.objects.filter(id_compra=compra_id, finalizada=False).first()
            if not compra:
                # Si no hay una compra válida en la sesión, crear una nueva
                compra = Compra.objects.create(id_usuario=None, finalizada=False)
                print("Se creó una nueva compra para un usuario invitado.")
        else:
            # Si no hay 'id_compra' en la sesión, crear una nueva compra
            compra = Compra.objects.create(id_usuario=None, finalizada=False)
            print("Se creó una nueva compra para un usuario invitado.")

    # Agregar el álbum a la compra
    compra.discos.add(album)
    print(f"Álbum {album.nombre_disco} agregado a la compra {compra.id_compra}.")

    # Asignar el ID de compra a la sesión
    request.session['id_compra'] = compra.id_compra

    # Redirigir a la misma página de listado de álbumes
    return redirect('discos')

# Vista para mostrar el carrito de compras
def carrito_compra(request):
    if request.user.is_authenticated:
        # Usuario autenticado: obtener o crear la compra en progreso del usuario
        compra = Compra.objects.filter(id_usuario=request.user, finalizada=False).first()
        # Si hay una compra en la sesión para usuario invitado, transferir a usuario autenticado
        compra_invitado = Compra.objects.filter(id_compra=request.session.get('id_compra'), finalizada=False).first()
        if compra_invitado and not compra:
            compra_invitado.id_usuario = request.user
            compra_invitado.save()
            request.session['id_compra'] = compra_invitado.id_compra
            compra = compra_invitado
    else:
        # Usuario invitado: obtener la compra usando la sesión, o crear una nueva si no existe
        compra_id = request.session.get('id_compra')
        compra = Compra.objects.filter(id_compra=compra_id, finalizada=False).first()
        if not compra:
            compra = Compra.objects.create(id_usuario=None, finalizada=False)
            request.session['id_compra'] = compra.id_compra
            print(f"Se creó una nueva compra para un usuario invitado con id_compra: {compra.id_compra}")

    if compra:
        total_price = sum(album.precio for album in compra.discos.all())
        context = {
            'compra': compra,
            'total_price': total_price,
            'clase':'carrito'
        }
    else:
        context = {'compra': None, 'clase':'carrito'} 

    return render(request, 'discos/carrito.html', context)

def confirmar_compra(request, pk):
    compra = Compra.objects.get(id_compra=pk)
    compra.finalizada = True
    compra.save()
    return redirect('carrito')

def eliminar_del_carrito(request, id_compra, id_album):
    compra = Compra.objects.get(id_compra=id_compra)
    album = Album.objects.get(id_album=id_album)
    
    # Verificar que el álbum esté en la compra del usuario actual
    if compra.discos.filter(id_album=id_album).exists():
        compra.discos.remove(album)
    
    # Verificar si la compra está vacía y eliminarla si es necesario
    if compra.discos.count() == 0:
        compra.delete()
    
    # Redireccionar de vuelta al carrito
    return redirect('carrito')

@login_required
def perfil(request):
    user = request.user
    
    # Obtener las compras finalizadas del usuario
    compras = Compra.objects.filter(id_usuario=user, finalizada=True).order_by('-fecha')
    
    for compra in compras:
        # Calcular el precio total de los discos comprados en esta compra
        total_price = compra.discos.aggregate(total=Sum('precio'))['total']
        compra.total_price = total_price if total_price else 0  # Añadir el precio total como atributo a la compra
    
    context = {
        'clase': 'perfil',
        'compras': compras,
    }

    return render(request, 'discos/perfil.html', context)