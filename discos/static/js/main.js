$(document).ready(function() {

    //GENERAL
        $("#idMensajes").delay(2000).fadeOut("slow");

        // Obtener el CSRF token de Django
        var csrftoken = getCookie('csrftoken'); 



        // Función para obtener el token CSRF
        function getCookie(name) {
            var cookieValue = null;
            if (document.cookie && document.cookie !== '') {
                var cookies = document.cookie.split(';');
                for (var i = 0; i < cookies.length; i++) {
                    var cookie = cookies[i].trim();
                    // Does this cookie string begin with the name we want?
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

    // MANEJO DE FILTROS EN MANTENEDOR DE ARTISTAS
        function fetchArtistas(query, country, page = 1) {
            fetch(`/buscar_artistas/?q=${query}&country=${country}&page=${page}`)
                .then(response => response.json())
                .then(data => {
                    var tableBody = document.getElementById('artistasTable');
                    tableBody.innerHTML = '';
                    if (data.artistas.length === 0) {
                        tableBody.innerHTML = '<tr><td colspan="8">No se encontraron artistas.</td></tr>';
                    } else {
                        data.artistas.forEach(artista => {
                            var biografia = artista.biografia ? artista.biografia : 'Sin biografía';
                            var row = `<tr>
                                <td>${artista.nombre_artista}</td>
                                <td>${artista.pais}</td>
                                <td class="col-biografia">${biografia}</td>
                                <td class="td-update equal-width"><a href="/artistas_edit/${artista.id_artista}">Modificar</a></td>
                                <td class="td-delete equal-width"><a href="/artistas_del/${artista.id_artista}">Eliminar</a></td>         
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

        var searchInputMantArtista = document.getElementById('searchInputMantArtista');
        var countrySelect = document.getElementById('countrySelect');
    
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


    // MANEJO DE FILTROS EN MANTENEDOR DE ÁLBUMES
        function fetchAlbumsMantenedor(query, formato, genero, page = 1) {
            fetch(`/buscar_albums/?q=${query}&formato=${formato}&genero=${genero}&page=${page}`)
                .then(response => response.json())
                .then(data => {
                    var tableBody = document.getElementById('albumsTable');
                    tableBody.innerHTML = '';
                    if (data.albums.length === 0) {
                        tableBody.innerHTML = '<tr><td colspan="8">No se encontraron álbumes.</td></tr>';
                    } else {
                        data.albums.forEach(album => {
                            var row = `<tr>
                                <td>${album.id_artista}</td>
                                <td>${album.nombre_disco}</td>
                                <td>${album.id_genero}</td>
                                <td>${album.fecha_lanzamiento}</td>
                                <td>$${album.precio}</td>
                                <td>${album.id_formato}</td>
                                <td>${album.stock}</td>
                                <td class="td-update equal-width"><a href="/albums/edit/${album.id_album}">Modificar</a></td>
                                <td class="td-delete equal-width"><a href="/albums/del/${album.id_album}">Eliminar</a></td>
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
    
        var searchInputMantAlbum = document.getElementById('searchInputMantAlbum');
        var formatoSelectMant = document.getElementById('formatoSelectMant');
        var generoSelectMant = document.getElementById('generoSelectMant');
    
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

    // MANEJO DE FILTROS Y MODAL EN EL CATÁLOGO DE ÁLBUMES
        function fetchAlbumsCatalogo(query, formato, genero, page = 1) {
            fetch(`/buscar_catalogo_albums/?q=${query}&formato=${formato}&genero=${genero}&page=${page}`)
                .then(response => response.json())
                .then(data => {
                    var albumsContainer = document.getElementById('albumsContainer');
                    albumsContainer.innerHTML = '';
                    if (data.albums.length === 0) {
                        albumsContainer.innerHTML = '<p>No se encontraron álbumes.</p>';
                    } else {
                        data.albums.forEach(album => {
                            var albumCard = `<div class="col-sm-6 col-md-6 col-lg-4 col-xl-3">
                                <div class="card mb-4">
                                    <img class="card-img-top" src="${album.portada}" alt="${album.nombre_disco}">
                                    <div class="card-body">
                                        <h3 class="card-title">${album.id_artista} - ${album.nombre_disco}</h3>
                                        <ul>
                                            <li>Género: ${album.id_genero}</li>
                                            <li>Formato: ${album.id_formato}</li>
                                            <li>Lanzamiento: ${album.fecha_lanzamiento}</li>
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
        
        // Asegurarse de que la función fetchAlbumsCatalogo esté disponible globalmente
        window.fetchAlbumsCatalogo = fetchAlbumsCatalogo;

        var searchInputCatAlbum = document.getElementById('searchInputCatAlbum');
        var formatoSelectCat = document.getElementById('formatoSelectCat');
        var generoSelectCat = document.getElementById('generoSelectCat');
        
        if (searchInputCatAlbum && formatoSelectCat && generoSelectCat) {
            searchInputCatAlbum.addEventListener('keyup', function() {
                var query = this.value;
                var formato = formatoSelectCat.value;
                var genero = generoSelectCat.value;
                fetchAlbumsCatalogo(query, formato, genero);  // Asegúrate de usar la función correcta para el catálogo
            });
        
            formatoSelectCat.addEventListener('change', function() {
                var query = searchInputCatAlbum.value;
                var formato = this.value;
                var genero = generoSelectCat.value;
                fetchAlbumsCatalogo(query, formato, genero);  // Asegúrate de usar la función correcta para el catálogo
            });
        
            generoSelectCat.addEventListener('change', function() {
                var query = searchInputCatAlbum.value;
                var formato = formatoSelectCat.value;
                var genero = this.value;
                fetchAlbumsCatalogo(query, formato, genero);  // Asegúrate de usar la función correcta para el catálogo
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
                        console.log("se ha ejecutado la actualización de badge")
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


    // VALIDACIÓN FRONT-END DE FORMULARIOS
        const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

        var usernameDisponible = false;

        $("#nombreusuario").focusout(function () {
            let nombre = $(this).val().trim();
            if (nombre === '') {
                $(this).addClass("is-invalid");
                $("#nombreError").text("El nombre de usuario no puede estar vacío").show();
                usernameDisponible = false;
            } else {
                $(this).removeClass("is-invalid");
                $("#nombreError").hide();
                $.ajax({
                    url: "chequear_disponibilidad",
                    data: {
                        'username': nombre
                    },
                    dataType: 'json',
                    success: function (data) {
                        if (data.is_taken) {
                            $("#nombreusuario").addClass("is-invalid");
                            $("#nombreError").text("El nombre de usuario ya está en uso.").show();
                            usernameDisponible = false;
                        } else {
                            $("#nombreusuario").removeClass("is-invalid");
                            $("#nombreError").hide();
                            usernameDisponible = true;
                        }
                    }
                });
            }
        });

        $("#first_name").focusout(function () {
            validarCampoVacio($(this), "El nombre no puede estar vacío", $("#firstNameError"));
        });

        $("#last_name").focusout(function () {
            validarCampoVacio($(this), "El apellido no puede estar vacío", $("#lastNameError"));
        });

        $("#email").focusout(function () {
            let email = $(this).val();
            if (email.trim() !== '' && !formatoCorreo.test(email)) {
                $(this).addClass("is-invalid");
                $("#emailError").text("Por favor, ingrese un correo electrónico válido").show();
            } else {
                $(this).removeClass("is-invalid");
                $("#emailError").hide();
            }
        });

        $("#password").focusout(function () {
            let password = $(this).val();
            let nombre = $("#nombreusuario").val();
            if (password.length < 8) {
                $(this).addClass("is-invalid");
                $("#passwordError").text("La contraseña debe tener al menos 8 caracteres").show();
            } else if (!isNaN(password)) {
                $(this).addClass("is-invalid");
                $("#passwordError").text("La contraseña no puede ser solo numérica").show();
            } else if (password === nombre) {
                $(this).addClass("is-invalid");
                $("#passwordError").text("La contraseña no puede ser igual al nombre de usuario").show();
            } else {
                $(this).removeClass("is-invalid");
                $("#passwordError").hide();
            }
        });

        // Validar el formulario antes de enviar
        $("#registroForm").on("submit", function (e) {
            let isValid = true;

            isValid &= validarCampoVacio($("#nombreusuario"), "El nombre de usuario no puede estar vacío", $("#nombreError"));
            isValid &= validarCampoVacio($("#first_name"), "El nombre no puede estar vacío", $("#firstNameError"));
            isValid &= validarCampoVacio($("#last_name"), "El apellido no puede estar vacío", $("#lastNameError"));

            let email = $("#email").val().trim();
            if (email === '' || !formatoCorreo.test(email)) {
                $("#email").addClass("is-invalid");
                $("#emailError").text("Por favor, ingrese un correo electrónico válido").show();
                isValid = false;
            } else {
                $("#email").removeClass("is-invalid");
                $("#emailError").hide();
            }

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

            if (!usernameDisponible) {
                $("#nombreusuario").addClass("is-invalid");
                $("#nombreError").text("El nombre de usuario ya está en uso.").show();
                isValid = false;
            }

            if (!isValid) {
                e.preventDefault();
                alert("Por favor, corrige los errores antes de enviar el formulario.");
            }
        });
        

        $("#id_nombre").focusout(function () {
            let nombre = $(this).val();
            if (nombre.trim() === '') {
            $("#id_nombre").addClass("is-invalid");
            $("#nombreError").text("El campo de nombre no puede estar vacío.").show();
            } else {
            $("#id_nombre").removeClass("is-invalid");
            $("#nombreError").hide();
            }
        });

        $("#id_correo_electronico").focusout(function () {
        let correo = $(this).val();
        if (correo.trim() !== '' && !formatoCorreo.test(correo)) {
            $("#id_correo_electronico").addClass("is-invalid");
            $("#correoError").text("Formato de correo electrónico inválido").show();
        } else {
            $("#id_correo_electronico").removeClass("is-invalid");
            $("#correoError").hide();
        }
        });

        $("#id_mensaje").focusout(function () {
            let mensaje = $(this).val();
            if (mensaje.trim() === '') {
            $("#id_mensaje").addClass("is-invalid");
            $("#mensajeError").text("El mensaje no puede estar vacío.").show();
            } else {
            $("#id_nombre").removeClass("is-invalid");
            $("#mensajeError").hide();
            }
        });
    
        $("#btnEnviarForm").click(function (event) {
        let correo = $("#id_correo_electronico").val();
        let mensaje = $("#id_mensaje").val();
        let formularioValido = true;
    
        if (correo.trim() == '') {
            $("#id_correo_electronico").addClass("is-invalid");
            formularioValido = false;
        } else if (!formatoCorreo.test(correo)) {
            $("#id_correo_electronico").addClass("is-invalid");
            formularioValido = false;
        }
    
        if (mensaje.trim() == '') {
            $("#id_mensaje").addClass("is-invalid");
            formularioValido = false;
        }
    
        if (!formularioValido) {
            event.preventDefault();
            alert("Por favor, corrige los errores antes de enviar el formulario.");
        }
        });
    
        $("input, textarea").focus(function () {
        $(this).removeClass("is-invalid");
        });

    // FIN VALIDACIÓN FRONT-END DE FORMULARIOS
});