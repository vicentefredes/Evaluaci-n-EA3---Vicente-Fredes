from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class Formato(models.Model):
    id_formato  = models.AutoField(db_column='idFormato', primary_key=True) 
    formato     = models.CharField(max_length=20, blank=False, null=False, unique=True)

    def __str__(self):
        return str(self.formato)
    
class Genero(models.Model):
    id_genero  = models.AutoField(db_column='idGenero', primary_key=True) 
    genero     = models.CharField(max_length=20, blank=False, null=False, unique=True)

    def __str__(self):
        return str(self.genero)

class Artista(models.Model):
    id_artista = models.AutoField(db_column='idArtista', primary_key=True) 
    nombre_artista = models.CharField(max_length=100, null=False, blank=False)
    pais = models.CharField(max_length=30, null=False, blank=False)
    biografia = models.TextField(null=True, blank=True)

    def __str__(self):
        return str(self.nombre_artista)
    class Meta:
        unique_together = [['nombre_artista', 'pais']]
    
    def unique_error_message(self, *args, **kwargs):
        return "Ya existe un artista con este nombre en este país."

class Album(models.Model):
    id_album = models.AutoField(db_column='idAlbum', primary_key=True) 
    id_artista = models.ForeignKey('Artista',on_delete=models.CASCADE, db_column='idArtista')
    nombre_disco = models.CharField(max_length=100, null=False, blank=False)
    fecha_lanzamiento = models.DateField(null=False, blank=False)
    precio = models.IntegerField(null=False, blank=False)
    id_formato = models.ForeignKey('Formato',on_delete=models.CASCADE, db_column='idFormato')  
    id_genero = models.ForeignKey('Genero',on_delete=models.CASCADE, db_column='idGenero')  
    portada = models.ImageField(upload_to="media/", default=None)
    stock = models.IntegerField(null=True, default=0)

    def __str__(self):
        return str(self.id_artista) + " - " + str(self.nombre_disco)
    class Meta:
        unique_together = [['id_artista', 'nombre_disco', 'fecha_lanzamiento', 'precio', 'id_formato', 'id_genero']]
    
    def unique_error_message(self, *args, **kwargs):
        return "Ya existe este producto en la base de datos."
class Compra(models.Model):
    id_compra = models.AutoField(db_column='idCompra', primary_key=True) 
    id_usuario = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, db_column='idUsuario')
    fecha = models.DateTimeField(auto_now_add=True)
    discos = models.ManyToManyField('Album', related_name='compras')
    finalizada = models.BooleanField(default=False, db_column='finalizada')

    def __str__(self):
        return f"Compra {self.id_compra} - {self.fecha}"
class Mensaje(models.Model):
    id_mensaje = models.AutoField(db_column='idMensaje', primary_key=True) 
    nombre = models.CharField(max_length=100, null=False, blank=False)
    correo_electronico = models.EmailField(max_length=254, null=False, blank=False)
    mensaje = models.TextField(null=False, blank=False)
    fecha = models.DateTimeField(auto_now_add=True)
    leido = models.BooleanField(default=False, db_column='leido')

    def __str__(self):
        return f"Mensaje de {self.nombre} - {self.fecha}"