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
    path('listadoMensajes', views.listadoMensajes, name='mensajes'),
    path('mensajesAdd', views.mensajesAdd, name='contacto'),
    path('mensajes_del/<int:pk>', views.mensajes_del, name='mensajes_del'),
    path('discos', views.listado_albums, name='discos')
]
