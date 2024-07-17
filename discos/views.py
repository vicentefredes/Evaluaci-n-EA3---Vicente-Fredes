from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.db import IntegrityError
from django.db.models import Sum, Count, Q
from datetime import date
from django.urls import reverse
import json
from django.http import JsonResponse, HttpResponse, HttpResponseBadRequest, HttpResponseRedirect
from .models import Genero, Formato, Artista, Album, Compra, Mensaje
from .forms import ArtistaForm, AlbumForm, MensajeForm 


# Create your views here.

def custom_login(request):
    if request.user.is_authenticated:
        return redirect('index')

    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('index')  # Redirigir a la página deseada después del inicio de sesión exitoso
        else:
            messages.error(request, 'Nombre de usuario o contraseña incorrectos.')
    
    # Si el método no es POST o hubo un error, mostrar el formulario de inicio de sesión
    context = {'clase': 'entrar'}
    return render(request, 'discos/login.html', context)


def registro(request):
    if request.user.is_authenticated:
        return redirect('index')

    error_message = None
    nombre = request.POST.get("nombre", "")  # Obtener el nombre de usuario del POST o vacío si no está presente
    email = request.POST.get("email", "")    # Obtener el email del POST o vacío si no está presente
    first_name = request.POST.get("first_name", "")  # Obtener el nombre del POST o vacío si no está presente
    last_name = request.POST.get("last_name", "")    # Obtener el apellido del POST o vacío si no está presente
    
    if request.method == "POST":
        password = request.POST.get("password")
        
        try:
            user = User.objects.create_user(username=nombre, email=email, password=password,
                                            first_name=first_name, last_name=last_name)
            user.save()
            context = {"clase": "entrar", "mensaje": "Tu nuevo usuario ha sido registrado"}
            return render(request, 'discos/registro.html', context)
        
        except IntegrityError:
            return HttpResponseBadRequest("El nombre de usuario de usuario ya está en uso.")
        except ValueError as e:
            if str(e) == "The given username must be set":
                return HttpResponseBadRequest("El nombre de usuario es obligatorio.")
            else:
                raise e
    
    # Si el método no es POST o hubo un error de integridad, mostrar el formulario con los datos ingresados y el mensaje de error si existe
    context = {"clase": "entrar", "nombre": nombre, "email": email, "first_name": first_name, "last_name": last_name}
    return render(request, 'discos/registro.html', context)

def chequear_disponibilidad(request):
    username = request.GET.get('username', None)
    data = {
        'is_taken': User.objects.filter(username__iexact=username).exists()
    }
    return JsonResponse(data)

@login_required
def modificar_perfil(request):
    user = request.user

    if request.method == "POST":
        nombre = request.POST.get("nombre")
        email = request.POST.get("email")
        first_name = request.POST.get("first_name")
        last_name = request.POST.get("last_name")
        password = request.POST.get("password")

        user.username = nombre
        user.email = email
        user.first_name = first_name
        user.last_name = last_name

        if password:
            user.set_password(password)
        
        try:
            user.save()
            return redirect('perfil')  # Asumiendo que tienes una vista llamada 'perfil' para mostrar la información del usuario
        except IntegrityError:
            return HttpResponseBadRequest("El nombre de usuario ya está en uso.")
        except ValueError as e:
            if str(e) == "The given username must be set":
                return HttpResponseBadRequest("El nombre de usuario es obligatorio.")
            else:
                raise e

    context = {
        'clase' : 'perfil',
        "nombre": user.username,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name
    }
    return render(request, 'discos/modificar_perfil.html', context)

def index(request):
    # Obtener la cantidad total de artistas
    total_artistas = Artista.objects.count()

    # Obtener la cantidad total de álbumes
    total_albumes = Album.objects.count()

    # Obtener la cantidad total de géneros
    total_generos = Genero.objects.count()

    # Obtener la cantidad total de compras finalizadas
    total_compras = Compra.objects.filter(finalizada=True).count()

    # Resto de las consultas para las estadísticas detalladas
    artistas_por_pais = Artista.objects.exclude(pais='N/A').values('pais').annotate(num_artistas=Count('id_artista'))
    albumes_por_formato = Album.objects.values('id_formato__formato').annotate(num_albumes=Count('id_formato'))
    albumes_por_genero = Album.objects.values('id_genero__genero').annotate(num_albumes=Count('id_genero'))
    estadisticas_por_decada = albums_por_decada()

    # Novedades para index de cliente
    novedades = Album.objects.order_by('-id_album')[:5]

    context = {
        'clase': 'index',
        'total_artistas': total_artistas,
        'total_albumes': total_albumes,
        'total_generos': total_generos,
        'total_compras': total_compras,
        'artistas_por_pais': artistas_por_pais,
        'albumes_por_formato': albumes_por_formato,
        'albumes_por_genero': albumes_por_genero,
        'estadisticas_por_decada': estadisticas_por_decada,
        'novedades':novedades
    }
    return render(request, 'discos/index.html', context)


def albums_por_decada():
    # Define los rangos de las décadas
    decades = [
        (date(1920, 1, 1), date(1929, 12, 31)),
        (date(1930, 1, 1), date(1939, 12, 31)),
        (date(1940, 1, 1), date(1949, 12, 31)),
        (date(1950, 1, 1), date(1959, 12, 31)),
        (date(1960, 1, 1), date(1969, 12, 31)),
        (date(1970, 1, 1), date(1979, 12, 31)),
        (date(1980, 1, 1), date(1989, 12, 31)),
        (date(1990, 1, 1), date(1999, 12, 31)),
        (date(2000, 1, 1), date(2009, 12, 31)),
        (date(2010, 1, 1), date(2019, 12, 31)),
        (date(2020, 1, 1), date(2029, 12, 31))
    ]
    
    # Lista para almacenar los resultados por década
    resultados = []
    
    # Itera sobre cada década y cuenta los álbumes
    for start_date, end_date in decades:
        # Filtra los álbumes por la fecha de lanzamiento dentro de la década
        num_albumes = Album.objects.filter(fecha_lanzamiento__range=(start_date, end_date)).count()
        
        decada_texto = f"{start_date.year}s"

        # Añade el resultado a la lista
        resultados.append({
            'decada': decada_texto,
            'num_albumes': num_albumes
        })
    
    return resultados

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

    # Obtener todos los países para el filtro
    paises = Artista.objects.values_list('pais', flat=True).distinct().order_by('pais')

    context = {'artistas': artistas, 'paises': paises, 'clase': 'mantenedores'}
    return render(request, 'discos/artistas_list.html', context)


@login_required
def buscar_artistas(request):
    query = request.GET.get('q', '')
    country = request.GET.get('country', '')
    
    artistas = Artista.objects.all().order_by('nombre_artista')
    
    if query:
        artistas = artistas.filter(nombre_artista__icontains=query)
    
    if country:
        artistas = artistas.filter(pais=country)

    paginator = Paginator(artistas, 25)
    page = request.GET.get('page')

    try:
        artistas_page = paginator.page(page)
    except PageNotAnInteger:
        artistas_page = paginator.page(1)
    except EmptyPage:
        artistas_page = paginator.page(paginator.num_pages)
    
    artistas_data = [{
        'id_artista': artista.id_artista,
        'nombre_artista': artista.nombre_artista,
        'pais': artista.pais,
        'biografia': artista.biografia,
    } for artista in artistas_page]

    pagination_data = {
        'has_previous': artistas_page.has_previous(),
        'previous_page_number': artistas_page.previous_page_number() if artistas_page.has_previous() else None,
        'has_next': artistas_page.has_next(),
        'next_page_number': artistas_page.next_page_number() if artistas_page.has_next() else None,
        'num_pages': paginator.num_pages,
        'page_range': list(paginator.page_range),
        'current_page': artistas_page.number,
        'query': query,
        'country': country,
    }

    return JsonResponse({'artistas': artistas_data, 'pagination': pagination_data})

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
    try:
        artista = Artista.objects.get(id_artista=pk)
        artista.delete()
        return redirect('crud_artistas')
    except Artista.DoesNotExist:
        return redirect('crud_artistas')

#CRUD de álbumes    
@login_required
def crud_albums(request):
    albums = Album.objects.all().order_by('id_artista__nombre_artista', 'nombre_disco')
    
    # Obtener todos los formatos para el filtro
    formatos = Formato.objects.all().order_by('formato')

    # Obtener todos los géneros para el filtro
    generos = Genero.objects.all().order_by('genero')

    paginator = Paginator(albums, 25)
    page = request.GET.get('page')

    try:
        albums = paginator.page(page)
    except PageNotAnInteger:
        albums = paginator.page(1)
    except EmptyPage:
        albums = paginator.page(paginator.num_pages)

    context = {
        'albums': albums,
        'formatos': formatos,
        'generos': generos,
        'clase': 'mantenedores'
    }

    return render(request, 'discos/albums_list.html', context)

def buscar_albums(request):
    try:
        query = request.GET.get('q', '')
        formato_id = request.GET.get('formato')
        genero_id = request.GET.get('genero')

        print(formato_id)
        print(genero_id)

        albums = Album.objects.all().order_by('id_artista__nombre_artista', 'nombre_disco')

        if query:
            albums = albums.filter(Q(nombre_disco__icontains=query) | Q(id_artista__nombre_artista__icontains=query))

        if formato_id:
            albums = albums.filter(id_formato=formato_id)

        if genero_id:
            albums = albums.filter(id_genero=genero_id)

        paginator = Paginator(albums, 25)
        page_number = request.GET.get('page')

        try:
            albums_page = paginator.page(page_number)
        except PageNotAnInteger:
            albums_page = paginator.page(1)
        except EmptyPage:
            albums_page = paginator.page(paginator.num_pages)

        albums_data = [{
            'id_album': album.id_album,
            'nombre_disco': album.nombre_disco,
            'id_artista': album.id_artista.nombre_artista if album.id_artista else '',
            'fecha_lanzamiento': album.fecha_lanzamiento.strftime('%Y-%m-%d') if album.fecha_lanzamiento else '',
            'precio': album.precio,
            'id_formato': album.id_formato.formato if album.id_formato else '',
            'id_genero': album.id_genero.genero if album.id_genero else '',
            'portada': album.portada.url if album.portada else '',
            'stock': album.stock,
        } for album in albums_page]

        pagination_data = {
            'has_previous': albums_page.has_previous(),
            'previous_page_number': albums_page.previous_page_number() if albums_page.has_previous() else None,
            'has_next': albums_page.has_next(),
            'next_page_number': albums_page.next_page_number() if albums_page.has_next() else None,
            'num_pages': paginator.num_pages,
            'page_range': list(paginator.page_range),
            'current_page': albums_page.number,
            'query': query,
            'formato': formato_id,
            'genero': genero_id,
        }

        return JsonResponse({'albums': albums_data, 'pagination': pagination_data})

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

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
    try:
        album = Album.objects.get(id_album=pk)
        album.delete()
        return redirect('crud_albums')
    except Album.DoesNotExist:
        return redirect('crud_albums')

#Mensajes
@login_required
def listadoMensajes(request):
    mensajes = Mensaje.objects.all().order_by('-fecha')
    paginator = Paginator(mensajes, 25)

    page = request.GET.get('page')

    try:
        mensajes = paginator.page(page)
    except PageNotAnInteger:
        mensajes = paginator.page(1)
    except EmptyPage:
        mensajes = paginator.page(paginator.num_pages)

    context = {'mensajes': mensajes, 'clase': 'mensajes'}
    return render(request, 'discos/mensajes.html', context)

@login_required
def mensajes_del(request, pk):
    try:
        mensaje = Mensaje.objects.get(id_mensaje=pk)
        mensaje.delete()
        return redirect('mensajes')
    except Mensaje.DoesNotExist:
        return redirect('mensajes')
    
def mensajesAdd(request):
    if request.method == "POST":
        form = MensajeForm(request.POST)
        if form.is_valid():
            form.save()
            nombre = form.cleaned_data.get('nombre')
            mensaje = f"{nombre}, tu mensaje ha sido enviado exitosamente. ¡Gracias por comunicarte con nosotros!"
            return render(request, 'discos/contacto.html', {'form': MensajeForm(), 'mensaje': mensaje, 'clase': 'contacto'})
    else:
        if request.user.is_authenticated:
            # Usuario autenticado: prellenar campos 'Nombre' y 'Correo Electrónico'
            initial_data = {'nombre': request.user.get_full_name(), 'correo_electronico': request.user.email}
            form = MensajeForm(initial=initial_data)
        else:
            # Invitado: formulario vacío
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

    formatos = Formato.objects.all().order_by('formato')
    generos = Genero.objects.all().order_by('genero')

    paginator = Paginator(albums, 12)  

    page = request.GET.get('page')

    try:
        albums = paginator.page(page)
    except PageNotAnInteger:
        albums = paginator.page(1)
    except EmptyPage:
        albums = paginator.page(paginator.num_pages)

    # Leer flag de la sesión y eliminarlo
    album_agregado = request.session.pop('album_agregado', False)
    album_nombre = request.session.pop('album_nombre', '')

    context = {'albums': albums, 'formatos':formatos, 'generos':generos, 'clase': 'discos', 'album_agregado': album_agregado, 'album_nombre': album_nombre}
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

    # Asignar el ID de compra a la sesión
    request.session['id_compra'] = compra.id_compra

    response_data = {
        'success': True,
        'message': f"¡El álbum {album.id_artista} - {album.nombre_disco} ({album.id_formato}) ha sido agregado al carrito con éxito!",
    }

    return HttpResponse(json.dumps(response_data), content_type='application/json')

# Vista para mostrar el carrito de compras
def carrito_compra(request):
    mensaje = request.GET.get('mensaje', None)

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

    if compra:
        total_price = sum(album.precio for album in compra.discos.all())
        context = {
            'compra': compra,
            'total_price': total_price,
            'mensaje': mensaje,
            'clase':'carrito'
        }
    else:
        context = {'compra': None, 'clase':'carrito', 'mensaje': mensaje} 

    return render(request, 'discos/carrito.html', context)

def confirmar_compra(request, pk):
    compra = Compra.objects.get(id_compra=pk)
    compra.finalizada = True
    compra.save()

    for album in compra.discos.all():
        if album.stock is not None and album.stock > 0:
            album.stock -= 1
            album.save()

    mensaje = "Tu compra ha sido confirmada exitosamente. ¡Gracias por su preferencia!"
    return HttpResponseRedirect(reverse('carrito') + f'?mensaje={mensaje}')

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

def obtener_discos_en_carrito(request):
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

    if compra:
        cantidad_albumes = compra.discos.count()
    else:
        cantidad_albumes = 0

    data = {
        'cantidad_albumes': cantidad_albumes
    }
    return JsonResponse(data)