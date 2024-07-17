$(document).ready(function() {
    
    console.log('hola')

    $("#idMensajes").delay(2000).fadeOut("slow");

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

    $('.add-to-cart-button').click(function(event) {
        event.preventDefault(); // Prevent default form submission

        var form = $(this).closest('form'); // Get the closest form element
        var url = form.attr('action'); // Get the form action URL
    
        $.ajax({
            url: url,
            method: 'POST',
            data: form.serialize(), // Serialize form data
            success: function(response) {
                if (response.success) {
                    $('#albumModal').find('.modal-body p').text(response.message);
                    $('#albumModal').modal('show'); // Show the modal with confirmation message
                    actualizarBadgeCarrito();
                } else {
                    console.error('Error al agregar al carrito:', response.message);
                }
            },
            error: function(xhr, status, error) {
                console.error('Error al agregar al carrito:', xhr.responseText);
            }
        });

    });

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
    
});