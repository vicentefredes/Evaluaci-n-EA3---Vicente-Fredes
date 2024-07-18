$(document).ready(function() {

    // FUNCIONES PARA EL SITIO EN GENERAL

        // Fade-out para mensajes de confirmación
        $("#idMensajes").delay(2000).fadeOut("slow");

        // MANEJO DE CSRF TOKEN
            // Obtener el CSRF token de Django
            var csrftoken = getCookie('csrftoken'); 

            // Función para obtener el token CSRF
            function getCookie(name) {
                var cookieValue = null;
                if (document.cookie && document.cookie !== '') {
                    var cookies = document.cookie.split(';');
                    for (var i = 0; i < cookies.length; i++) {
                        var cookie = cookies[i].trim();
                        // Verificar que la cookie empiece con el nombre deseado
                        if (cookie.substring(0, name.length + 1) === (name + '=')) {
                            cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                            break;
                        }
                    }
                }
                return cookieValue;
            }

            // Verificar y agregar el token CSRF en los headers de las solicitudes AJAX
            function csrfSafeMethod(method) {
                // estos métodos no requieren CSRF
                return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
            }

            $.ajaxSetup({
                beforeSend: function(xhr, settings) {
                    if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                        xhr.setRequestHeader("X-CSRFToken", csrftoken);
                    }
                }
            });
        // FIN MANEJO DE CSRF TOKEN

        // Función para actualizar el badge con la cantidad de álbumes en el carrito
        function actualizarBadgeCarrito() {
            $.ajax({
                url: "obtener_discos_en_carrito",  // URL para obtener la cantidad de álbumes
                type: "GET",
                success: function(data) {
                    var cantidadAlbumes = data.cantidad_albumes;
                    if (cantidadAlbumes > 0) {
                        $("#orderBadge").text(cantidadAlbumes);  // Actualizar el texto del badge con la cantidad de álbumes
                        $("#orderBadge").removeClass("d-none");  // Mostrar el badge si hay álbumes en el carrito
                    } else {
                        $("#orderBadge").addClass("d-none");  // Ocultar el badge si no hay álbumes en el carrito
                    }
                },
                error: function(xhr, status, error) {
                    console.error("Error al obtener la cantidad de álbumes en el carrito:", error);
                }
            });
        }

        // Llamar a la función al cargar la página
        actualizarBadgeCarrito();
    
    // FIN DE FUNCIONES PARA EL SITIO EN GENERAL

    //--------------------------------------------------------------------------------------------

    // MANEJO DE FILTROS EN MANTENEDOR DE ARTISTAS

        // Aplicación de filtros - A partir de respuesta JSON retornada por la vista 'buscar_artistas'
        function fetchArtistas(query, country, page = 1) {
            fetch(`/buscar_artistas/?q=${query}&country=${country}&page=${page}`)
                .then(response => response.json())
                .then(data => {
                    var tableBody = document.getElementById('artistasTable'); 
                    tableBody.innerHTML = ''; // Se 'limpia' la tabla del listado
                    if (data.artistas.length === 0) { // Si no hay concidencias, contenido se reemplaza por un mensaje indicando que no se ha encontrado nada
                        tableBody.innerHTML = '<tr><td colspan="8">No se encontraron artistas.</td></tr>';
                    } else { // Si hay concidencias, se generan nuevamente los tr con los datos del JSON
                        data.artistas.forEach(artista => {
                            var biografia = artista.biografia ? artista.biografia : 'Sin biografía';
                            var row = `<tr>
                                <td>${artista.nombre_artista}</td>
                                <td>${artista.pais}</td>
                                <td class="col-biografia">${biografia}</td>
                                <td class="td-update equal-width"><a href="/artistas_edit/${artista.id_artista}">Modificar</a></td>
                                <td class="td-delete equal-width"><a href="/artistas_del/${artista.id_artista}?q=${query}&country=${country}&page=${page}">Eliminar</a></td>         
                            </tr>`;
                            tableBody.innerHTML += row;
                        });
                    }
                    
                    // Actualizar la paginación
                    var pagination = document.querySelector('.pagination');
                    pagination.innerHTML = '';
        
                    if (data.pagination.has_previous) {
                        pagination.innerHTML += `<li class="page-item">
                            <a class="page-link" href="javascript:void(0);" onclick="fetchArtistas('${data.pagination.query}', '${data.pagination.country}', 1)" aria-label="Primera">
                                <span aria-hidden="true">&laquo;</span>
                                <span class="sr-only">Primera</span>
                            </a>
                        </li>`;
                        pagination.innerHTML += `<li class="page-item">
                            <a class="page-link" href="javascript:void(0);" onclick="fetchArtistas('${data.pagination.query}', '${data.pagination.country}', ${data.pagination.previous_page_number})" aria-label="Anterior">
                                <span aria-hidden="true">&lt;</span>
                                <span class="sr-only">Anterior</span>
                            </a>
                        </li>`;
                    }
        
                    data.pagination.page_range.forEach(num => {
                        if (data.pagination.current_page == num) {
                            pagination.innerHTML += `<li class="page-item active" aria-current="page"><span class="page-link">${num}</span></li>`;
                        } else {
                            pagination.innerHTML += `<li class="page-item"><a class="page-link" href="javascript:void(0);" onclick="fetchArtistas('${data.pagination.query}', '${data.pagination.country}', ${num})">${num}</a></li>`;
                        }
                    });
        
                    if (data.pagination.has_next) {
                        pagination.innerHTML += `<li class="page-item">
                            <a class="page-link" href="javascript:void(0);" onclick="fetchArtistas('${data.pagination.query}', '${data.pagination.country}', ${data.pagination.next_page_number})" aria-label="Siguiente">
                                <span aria-hidden="true">&gt;</span>
                                <span class="sr-only">Siguiente</span>
                            </a>
                        </li>`;
                        pagination.innerHTML += `<li class="page-item">
                            <a class="page-link" href="javascript:void(0);" onclick="fetchArtistas('${data.pagination.query}', '${data.pagination.country}', ${data.pagination.num_pages})" aria-label="Última">
                                <span aria-hidden="true">&raquo;</span>
                                <span class="sr-only">Última</span>
                            </a>
                        </li>`;
                    }
                });
        }

        // Aseguramos que la función esté disponible globalmente
        window.fetchArtistas = fetchArtistas; 

        // Obtención del filtros en el html
        var searchInputMantArtista = document.getElementById('searchInputMantArtista');
        var countrySelect = document.getElementById('countrySelect');
    
        // Llamados a la función de filtrado cuando se ingresen valores en los filtros
        if (searchInputMantArtista && countrySelect) {
            searchInputMantArtista.addEventListener('keyup', function() {
                var query = this.value;
                var country = countrySelect.value;
                fetchArtistas(query, country);
            });
        
            countrySelect.addEventListener('change', function() {
                var query = searchInputMantArtista.value;
                var country = this.value;
                fetchArtistas(query, country);
            });
        } else {
            console.error('Uno o más elementos no se encontraron en el DOM.');
        }

    // FIN MANEJO DE FILTROS EN MANTENEDOR DE ARTISTAS

    //--------------------------------------------------------------------------------------------

    // MANEJO DE FILTROS EN MANTENEDOR DE ÁLBUMES

        // Función para evitar que se pierda el formato de fechas deseado tras filtros **Aplica tanto para el mantenedor como para el catálogo de álbumes
        function formatDate(dateStr) {
            // Dividir la cadena de fecha en partes
            var parts = dateStr.split('-');
            var year = parts[0];
            var month = parts[1] - 1; // Los meses en JavaScript van de 0 a 11
            var day = parts[2];
        
            // Crear una nueva fecha en la zona horaria local
            var date = new Date(year, month, day);
        
            var formattedDay = ('0' + date.getDate()).slice(-2);
            var formattedMonth = ('0' + (date.getMonth() + 1)).slice(-2);
            var formattedYear = date.getFullYear();
        
            return `${formattedDay}/${formattedMonth}/${formattedYear}`;
        }

        // Aplicación de filtros - A partir de respuesta JSON retornada por la vista 'buscar_albums'
        function fetchAlbumsMantenedor(query, formato, genero, page = 1) {
            fetch(`/buscar_albums/?q=${query}&formato=${formato}&genero=${genero}&page=${page}`)
                .then(response => response.json())
                .then(data => {
                    var tableBody = document.getElementById('albumsTable');
                    tableBody.innerHTML = ''; // Se 'limpia' la tabla del listado
                    if (data.albums.length === 0) { // Si no hay concidencias, contenido se reemplaza por un mensaje indicando que no se ha encontrado nada
                        tableBody.innerHTML = '<tr><td colspan="8">No se encontraron álbumes.</td></tr>';
                    } else { // Si hay concidencias, se generan nuevamente los tr con los datos del JSON
                        data.albums.forEach(album => {
                            var row = `<tr>
                                <td>${album.id_artista}</td>
                                <td>${album.nombre_disco}</td>
                                <td>${album.id_genero}</td>
                                <td>${formatDate(album.fecha_lanzamiento)}</td>
                                <td>$${album.precio}</td>
                                <td>${album.id_formato}</td>
                                <td>${album.stock}</td>
                                <td class="td-update equal-width"><a href="/albums_edit/${album.id_album}">Modificar</a></td>
                                <td class="td-delete equal-width"><a href="/albums_del/${album.id_album}?q=${query}&formato=${formato}&genero=${genero}&page=${page}">Eliminar</a></td>
                            </tr>`;
                            tableBody.innerHTML += row;
                        });
                    }
    
                    // Actualizar la paginación
                    var pagination = document.querySelector('.pagination');
                    pagination.innerHTML = '';
    
                    if (data.pagination.has_previous) {
                        pagination.innerHTML += `<li class="page-item">
                            <a class="page-link" href="javascript:void(0);" onclick="fetchAlbumsMantenedor('${data.pagination.query}', '${data.pagination.formato}', '${data.pagination.genero}', 1)" aria-label="Primera">
                                <span aria-hidden="true">&laquo;</span>
                                <span class="sr-only">Primera</span>
                            </a>
                        </li>`;
                        pagination.innerHTML += `<li class="page-item">
                            <a class="page-link" href="javascript:void(0);" onclick="fetchAlbumsMantenedor('${data.pagination.query}', '${data.pagination.formato}', '${data.pagination.genero}', ${data.pagination.previous_page_number})" aria-label="Anterior">
                                <span aria-hidden="true">&lt;</span>
                                <span class="sr-only">Anterior</span>
                            </a>
                        </li>`;
                    }
    
                    data.pagination.page_range.forEach(num => {
                        if (data.pagination.current_page == num) {
                            pagination.innerHTML += `<li class="page-item active" aria-current="page"><span class="page-link">${num}</span></li>`;
                        } else {
                            pagination.innerHTML += `<li class="page-item"><a class="page-link" href="javascript:void(0);" onclick="fetchAlbumsMantenedor('${data.pagination.query}', '${data.pagination.formato}', '${data.pagination.genero}', ${num})">${num}</a></li>`;
                        }
                    });
    
                    if (data.pagination.has_next) {
                        pagination.innerHTML += `<li class="page-item">
                            <a class="page-link" href="javascript:void(0);" onclick="fetchAlbumsMantenedor('${data.pagination.query}', '${data.pagination.formato}', '${data.pagination.genero}', ${data.pagination.next_page_number})" aria-label="Siguiente">
                                <span aria-hidden="true">&gt;</span>
                                <span class="sr-only">Siguiente</span>
                            </a>
                        </li>`;
                        pagination.innerHTML += `<li class="page-item">
                            <a class="page-link" href="javascript:void(0);" onclick="fetchAlbumsMantenedor('${data.pagination.query}', '${data.pagination.formato}', '${data.pagination.genero}', ${data.pagination.num_pages})" aria-label="Última">
                                <span aria-hidden="true">&raquo;</span>
                                <span class="sr-only">Última</span>
                            </a>
                        </li>`;
                    }
                });
        }

        // Aseguramos que la función esté disponible globalmente
        window.fetchAlbumsMantenedor = fetchAlbumsMantenedor;
    
        // Obtención del filtros en el html
        var searchInputMantAlbum = document.getElementById('searchInputMantAlbum');
        var formatoSelectMant = document.getElementById('formatoSelectMant');
        var generoSelectMant = document.getElementById('generoSelectMant');
    
        // Llamados a la función de filtrado cuando se ingresen valores en los filtros
        if (searchInputMantAlbum && formatoSelectMant && generoSelectMant) {
            searchInputMantAlbum.addEventListener('keyup', function() {
                var query = this.value;
                var formato = formatoSelectMant.value;
                var genero = generoSelectMant.value;
                fetchAlbumsMantenedor(query, formato, genero);
            });
        
            formatoSelectMant.addEventListener('change', function() {
                var query = searchInputMantAlbum.value;
                var formato = this.value;
                var genero = generoSelectMant.value;
                fetchAlbumsMantenedor(query, formato, genero);
            });
        
            generoSelectMant.addEventListener('change', function() {
                var query = searchInputMantAlbum.value;
                var formato = formatoSelectMant.value;
                var genero = this.value;
                fetchAlbumsMantenedor(query, formato, genero);
            });
        } else {
            console.error('Uno o más elementos no se encontraron en el DOM.');
        }

    // FIN MANEJO DE FILTROS EN MANTENEDOR DE ÁLBUMES

    //--------------------------------------------------------------------------------------------

    // MANEJO DE FILTROS Y MODAL EN EL CATÁLOGO DE ÁLBUMES

        // Aplicación de filtros - A partir de respuesta JSON retornada por la vista 'buscar_albums'
        function fetchAlbumsCatalogo(query, formato, genero, page = 1) {
            fetch(`/buscar_catalogo_albums/?q=${query}&formato=${formato}&genero=${genero}&page=${page}`)
                .then(response => response.json())
                .then(data => {
                    var albumsContainer = document.getElementById('albumsContainer');
                    albumsContainer.innerHTML = ''; // Se 'limpia' el contenedor con los cards de los álbumes
                    if (data.albums.length === 0) { // Si no hay concidencias, contenido se reemplaza por un mensaje indicando que no se ha encontrado nada
                        albumsContainer.innerHTML = '<p style="color:black; font-weight:bold; font-size: 20px;">No se encontraron álbumes.</p>';
                    } else { // Si hay concidencias, se generan nuevamente los cards con los datos del JSON
                        data.albums.forEach(album => {
                            var albumCard = `<div class="col-sm-6 col-md-6 col-lg-4 col-xl-3">
                                <div class="card mb-4">
                                    <img class="card-img-top" src="${album.portada}" alt="${album.nombre_disco}">
                                    <div class="card-body">
                                        <h3 class="card-title">${album.id_artista} - ${album.nombre_disco}</h3>
                                        <ul>
                                            <li>Género: ${album.id_genero}</li>
                                            <li>Formato: ${album.id_formato}</li>
                                            <li>Lanzamiento: ${formatDate(album.fecha_lanzamiento)}</li>
                                            <li>Precio: $${album.precio}</li>
                                        </ul>
                                        ${album.stock > 0 ? 
                                        `<form id="addToCartForm_${album.id_album}" method="POST" action="/agregar_al_carrito/${album.id_album}/">
                                            <input type="hidden" name="csrfmiddlewaretoken" value="${csrftoken}">
                                            <button type="submit" class="btn btn-secondary add-to-cart-button">Agregar a Carrito</button>
                                        </form>` : 
                                        '<p class="text-danger">Agotado</p>'}
                                    </div>
                                </div>
                            </div>`;
                            albumsContainer.innerHTML += albumCard;
                        });
                    }
        
                    // Actualizar la paginación
                    var paginationContainer = document.getElementById('paginationContainer');
                    paginationContainer.innerHTML = '';
        
                    if (data.pagination.has_previous) {
                        paginationContainer.innerHTML += `<li class="page-item">
                            <a class="page-link" href="javascript:void(0);" aria-label="Previous" onclick="fetchAlbumsCatalogo('${query}', '${formato}', '${genero}', ${data.pagination.previous_page_number})">
                                <span aria-hidden="true">&laquo;</span>
                                <span class="sr-only">Previous</span>
                            </a>
                        </li>`;
                    } else {
                        paginationContainer.innerHTML += `<li class="page-item disabled">
                            <a class="page-link" href="javascript:void(0);" aria-label="Previous">
                                <span aria-hidden="true">&laquo;</span>
                                <span class="sr-only">Previous</span>
                            </a>
                        </li>`;
                    }
        
                    data.pagination.page_range.forEach(num => {
                        paginationContainer.innerHTML += `<li class="page-item ${data.pagination.current_page === num ? 'active' : ''}">
                            <a class="page-link" href="javascript:void(0);" onclick="fetchAlbumsCatalogo('${query}', '${formato}', '${genero}', ${num})">${num}</a>
                        </li>`;
                    });
        
                    if (data.pagination.has_next) {
                        paginationContainer.innerHTML += `<li class="page-item">
                            <a class="page-link" href="javascript:void(0);" aria-label="Next" onclick="fetchAlbumsCatalogo('${query}', '${formato}', '${genero}', ${data.pagination.next_page_number})">
                                <span aria-hidden="true">&raquo;</span>
                                <span class="sr-only">Next</span>
                            </a>
                        </li>`;
                    } else {
                        paginationContainer.innerHTML += `<li class="page-item disabled">
                            <a class="page-link" href="javascript:void(0);" aria-label="Next">
                                <span aria-hidden="true">&raquo;</span>
                                <span class="sr-only">Next</span>
                            </a>
                        </li>`;
                    }
                })
                .catch(error => {
                    console.error('Error fetching albums:', error);
                });
        }
        
        // Asegurarse de que la función esté disponible globalmente
        window.fetchAlbumsCatalogo = fetchAlbumsCatalogo;

        // Obtención del filtros en el html
        var searchInputCatAlbum = document.getElementById('searchInputCatAlbum');
        var formatoSelectCat = document.getElementById('formatoSelectCat');
        var generoSelectCat = document.getElementById('generoSelectCat');
        
        // Llamados a la función de filtrado cuando se ingresen valores en los filtros
        if (searchInputCatAlbum && formatoSelectCat && generoSelectCat) {
            searchInputCatAlbum.addEventListener('keyup', function() {
                var query = this.value;
                var formato = formatoSelectCat.value;
                var genero = generoSelectCat.value;
                fetchAlbumsCatalogo(query, formato, genero);  
            });
        
            formatoSelectCat.addEventListener('change', function() {
                var query = searchInputCatAlbum.value;
                var formato = this.value;
                var genero = generoSelectCat.value;
                fetchAlbumsCatalogo(query, formato, genero);  
            });
        
            generoSelectCat.addEventListener('change', function() {
                var query = searchInputCatAlbum.value;
                var formato = formatoSelectCat.value;
                var genero = this.value;
                fetchAlbumsCatalogo(query, formato, genero);  
            });
            } else {
            console.error('Uno o más elementos no se encontraron en el DOM.');
        }
        

        // jQuery para manejar el evento click del botón "Agregar a Carrito"
        $(document).on('click', '.add-to-cart-button', function(event) {
            event.preventDefault(); // Prevenir el envío predeterminado del formulario

            var form = $(this).closest('form'); // Obtener el formulario más cercano
            var url = form.attr('action'); // Obtener la URL de acción del formulario

            $.ajax({
                url: url,
                method: 'POST',
                data: form.serialize(), // Serializar los datos del formulario
                success: function(response) {
                    if (response.success) {
                        $('#albumModal').find('.modal-body p').text(response.message);
                        $('#albumModal').modal('show'); // Mostrar el modal con el mensaje de confirmación
                        actualizarBadgeCarrito(); // Actualizar el contador del carrito
                    } else {
                        console.error('Error al agregar al carrito:', response.message);
                    }
                },
                error: function(xhr, status, error) {
                    console.error('Error al agregar al carrito:', xhr.responseText);
                }
            });
        });

    // FIN MANEJO DE FILTROS Y MODAL EN EL CATÁLOGO DE ÁLBUMES

    //--------------------------------------------------------------------------------------------

    // VALIDACIÓN FRONT-END DE FORMULARIOS

        // Constante para controlar que se cumpla formato de correo electrónico - que tenga @ y posteriormente un punto (django valida solo la @)
        const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        // Función para controlar envío de campos requeridos vacíos (incluyendo casos donde se envíen solo espacios en blanco)
        function validarCampoVacio(campo, mensajeError, idError) {
            let valor = campo.val().trim();
            if (valor === '') {
                campo.addClass("is-invalid");
                idError.text(mensajeError).show();
                return false;
            } else {
                campo.removeClass("is-invalid");
                idError.hide();
                return true;
            }
        }

        // FORMULARIO DE REGISTRO DE USUARIO
            // Validación del nombre de usuario
            var usernameDisponible = false; // Variable que indica disponibilidad 
            $("#nombreusuario").focusout(function () { // Se controla ingreso una vez se haya dejado de escribir en la campo y se haya pasado a otro
                let nombre = $(this).val().trim();
                if (nombre === '') { // Marcar como inválido cuando se deja vacío, al ser un campo obligatorio
                    $(this).addClass("is-invalid");
                    $("#nombreError").text("El nombre de usuario no puede estar vacío").show();
                    usernameDisponible = false;
                } else {
                    $(this).removeClass("is-invalid");
                    $("#nombreError").hide();
                    $.ajax({ // Se comprueba disponibilidad del nombre de usuario, a partir de JSON retornado por la vista 'chequear_disponibilidad'
                        url: "chequear_disponibilidad",
                        data: {
                            'username': nombre
                        },
                        dataType: 'json',
                        success: function (data) {
                            if (data.is_taken) { // Se marca campo como inválido si se ingresa un usuario que ya está en uso
                                $("#nombreusuario").addClass("is-invalid");
                                $("#nombreError").text("El nombre de usuario ya está en uso.").show();
                                usernameDisponible = false;
                            } else { // Si el usuario está disponible, se marca variable como 'True'
                                $("#nombreusuario").removeClass("is-invalid");
                                $("#nombreError").hide();
                                usernameDisponible = true;
                            }
                        }
                    });
                }
            });

            $("#first_name").focusout(function () { // Se controla ingreso una vez se haya dejado de escribir en la campo y se haya pasado a otro
                validarCampoVacio($(this), "El nombre no puede estar vacío", $("#firstNameError"));
            });

            $("#last_name").focusout(function () { // Se controla ingreso una vez se haya dejado de escribir en la campo y se haya pasado a otro
                validarCampoVacio($(this), "El apellido no puede estar vacío", $("#lastNameError"));
            });

            $("#email").focusout(function () { // Se controla ingreso una vez se haya dejado de escribir en la campo y se haya pasado a otro
                let email = $(this).val();
                if (email.trim() !== '' && !formatoCorreo.test(email)) { // Se controla tanto que no esté vacío como que cumpla con el formato
                    $(this).addClass("is-invalid");
                    $("#emailError").text("Por favor, ingrese un correo electrónico válido").show();
                } else {
                    $(this).removeClass("is-invalid");
                    $("#emailError").hide();
                }
            });

            $("#password").focusout(function () { // Se controla ingreso una vez se haya dejado de escribir en la campo y se haya pasado a otro
                let password = $(this).val(); // Obtener valor de contraseña
                let nombre = $("#nombreusuario").val(); // Obtener valor del nombre de usuario para que pueda ser comparado con la contraseña
                if (password.length < 8) { // Controlar que cumpla con logitud mínima
                    $(this).addClass("is-invalid");
                    $("#passwordError").text("La contraseña debe tener al menos 8 caracteres").show();
                } else if (!isNaN(password)) { // Controlar que no sea compuesto de puros números
                    $(this).addClass("is-invalid");
                    $("#passwordError").text("La contraseña no puede ser solo numérica").show();
                } else if (password === nombre) { // Controlar que no sea igual al nombre de usuario
                    $(this).addClass("is-invalid");
                    $("#passwordError").text("La contraseña no puede ser igual al nombre de usuario").show();
                } else {
                    $(this).removeClass("is-invalid");
                    $("#passwordError").hide();
                }
            });

            // Validación final del formulario antes de enviar
            $("#registroForm").on("submit", function (e) { 
                // Variable que verifica si el formulario en su totalidad es válido
                let isValid = true;

                // Valida que los campos no estén vacíos, de lo contrario, isValid pasa a ser False
                isValid &= validarCampoVacio($("#nombreusuario"), "El nombre de usuario no puede estar vacío", $("#nombreError"));
                isValid &= validarCampoVacio($("#first_name"), "El nombre no puede estar vacío", $("#firstNameError"));
                isValid &= validarCampoVacio($("#last_name"), "El apellido no puede estar vacío", $("#lastNameError"));

                // Validación de correo electrónico - que no esté vacío y que cumpla con formato
                let email = $("#email").val().trim();
                if (email === '' || !formatoCorreo.test(email)) {
                    $("#email").addClass("is-invalid");
                    $("#emailError").text("Por favor, ingrese un correo electrónico válido").show();
                    isValid = false;
                } else {
                    $("#email").removeClass("is-invalid");
                    $("#emailError").hide();
                }

                // Validación de contraseña - longitud, integridad, que sea alfanumérica
                let password = $("#password").val();
                let nombre = $("#nombreusuario").val();
                if (password.length < 8 || !isNaN(password) || password === nombre) {
                    $("#password").addClass("is-invalid");
                    if (password.length < 8) {
                        $("#passwordError").text("La contraseña debe tener al menos 8 caracteres").show();
                    } else if (!isNaN(password)) {
                        $("#passwordError").text("La contraseña no puede ser solo numérica").show();
                    } else if (password === nombre) {
                        $("#passwordError").text("La contraseña no puede ser igual al nombre de usuario").show();
                    }
                    isValid = false;
                } else {
                    $("#password").removeClass("is-invalid");
                    $("#passwordError").hide();
                }

                // Validar que nombre de usuario no esté en uso
                if (!usernameDisponible) {
                    $("#nombreusuario").addClass("is-invalid");
                    $("#nombreError").text("El nombre de usuario ya está en uso.").show();
                    isValid = false;
                }

                // Verificación final del formulario completo - si no es valido, informará mediante alert que hay errores
                if (!isValid) {
                    e.preventDefault();
                    alert("Por favor, corrige los errores antes de enviar el formulario.");
                }
            });
        // FIN FORMULARIO DE REGISTRO DE USUARIO

        // FORMULARIO DE CONTACTO

            // Validar que nombre no esté vacío
            $("#id_nombre").focusout(function () { // Se ejecuta apenas usuario termine de escribir y pase a otro campo
                let nombre = $(this).val();
                if (nombre.trim() === '') {
                    $("#id_nombre").addClass("is-invalid");
                    $("#nombreError").text("El campo de nombre no puede estar vacío.").show();
                } else {
                    $("#id_nombre").removeClass("is-invalid");
                    $("#nombreError").hide();
                }
            });

            // Validar que correo electrónico no esté vacío y que cumpla con el formato
            $("#id_correo_electronico").focusout(function () { // Se ejecuta apenas usuario termine de escribir y pase a otro campo
                let correo = $(this).val();
                if (correo.trim() !== '' && !formatoCorreo.test(correo)) {
                    $("#id_correo_electronico").addClass("is-invalid");
                    $("#correoError").text("Formato de correo electrónico inválido").show();
                } else {
                    $("#id_correo_electronico").removeClass("is-invalid");
                    $("#correoError").hide();
                }
            });

            // Validad que mensaje no esté vacío
            $("#id_mensaje").focusout(function () { // Se ejecuta apenas usuario termine de escribir y pase a otro campo
                let mensaje = $(this).val();
                if (mensaje.trim() === '') {
                    $("#id_mensaje").addClass("is-invalid");
                    $("#mensajeError").text("El mensaje no puede estar vacío.").show();
                } else {
                    $("#id_nombre").removeClass("is-invalid");
                    $("#mensajeError").hide();
                }
            });
        
            // Validación final del formulario antes de enviar
            $("#btnEnviarForm").click(function (event) {
                let nombre = $("#id_nombre").val();
                let correo = $("#id_correo_electronico").val();
                let mensaje = $("#id_mensaje").val();
                let formularioValido = true; // Variable que verifica si el formulario en su totalidad es válido

                // Validar que nombre no esté vacío
                if (nombre.trim() == '') {
                    $("id_nombre").addClass("is-invalid");
                    formularioValido = false;
                }
            
                // Validar que correo electrónico no esté vacío y que cumpla con el formato
                if (correo.trim() == '') {
                    $("#id_correo_electronico").addClass("is-invalid");
                    formularioValido = false;
                } else if (!formatoCorreo.test(correo)) {
                    $("#id_correo_electronico").addClass("is-invalid");
                    formularioValido = false;
                }
            
                // Validar que mensaje no esté vacío
                if (mensaje.trim() == '') {
                    $("#id_mensaje").addClass("is-invalid");
                    formularioValido = false;
                }
            
                // Verificación final del formulario completo - si no es valido, informará mediante alert que hay errores
                if (!formularioValido) {
                    event.preventDefault();
                    alert("Por favor, corrige los errores antes de enviar el formulario.");
                }
            });
        
            // Campos no deben estar marcados como inválidos mientras tenga focus
            $("input, textarea").focus(function () {
                $(this).removeClass("is-invalid");
            });
        // FIN FORMULARIO DE CONTACTO

    // FIN VALIDACIÓN FRONT-END DE FORMULARIOS

});