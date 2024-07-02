from django.urls import path
from . import views

urlpatterns = [
    path('index', views.index, name='index'),
    path('crud_artistas', views.crud_artistas, name='crud_artistas'),
    path('artistasAdd', views.artistasAdd, name='artistasAdd'),
    path('artistas_edit/<int:pk>', views.artistas_edit, name='artistas_edit'),
    path('artistas_del/<int:pk>', views.artistas_del, name='artistas_del'),
    path('crud_albums', views.crud_albums, name='crud_albums'),
    path('albumsAdd', views.albumsAdd, name='albumsAdd'),
    path('albums_edit/<int:pk>', views.albums_edit, name='albums_edit'),
    path('albums_del/<int:pk>', views.albums_del, name='albums_del'),
    path('mensajes', views.listadoMensajes, name='mensajes'),
    path('contacto', views.mensajesAdd, name='contacto'),
    path('mensajes_del/<int:pk>', views.mensajes_del, name='mensajes_del'),
    path('mensajes/cambiar_estado/<int:pk>/', views.cambiar_estado, name='cambiar_estado'),
    path('discos', views.listado_albums, name='discos'),
    path('agregar_al_carrito/<int:fk_album>/', views.agregar_al_carrito, name='agregar_al_carrito'),
    path('carrito', views.carrito_compra, name='carrito'),
    path('eliminar-del-carrito/<int:id_compra>/<int:id_album>/', views.eliminar_del_carrito, name='eliminar_del_carrito'),
    path('confirmar_compra/<int:pk>/', views.confirmar_compra, name='confirmar_compra'),
]
