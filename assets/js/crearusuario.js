$(document).ready(function () {
    const apiUrl = 'http://localhost:5000/api';
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
    };

    function showSpinner() {
        $('#spinner').show();
    }

    function hideSpinner() {
        $('#spinner').hide();
    }

    function showNotification(message, type) {
        Swal.fire({
            text: message,
            icon: type,
            timer: 2000,
            showConfirmButton: false,
            position: 'bottom-end'
        });
    }

    function loadUsuarios() {
        showSpinner();
        $.ajax({
            url: `${apiUrl}/usuarios`,
            method: 'GET',
            headers: headers,
            success: function (usuarios) {
                hideSpinner();
                const usuariosContainer = $('#usuariosContainer');
                usuariosContainer.empty();
                usuarios.forEach(usuario => {
                    const usuarioHtml = `
                        <div class="card mb-3">
                            <div class="card-body">
                                <h5 class="card-title">${usuario.email}</h5>
                                <p class="card-text">Tipo de usuario: ${usuario.tipo_usuario}</p>
                                <button class="btn btn-warning btn-sm" onclick="editarUsuario(${usuario.id_usuario})">Editar</button>
                                <button class="btn btn-danger btn-sm" onclick="eliminarUsuario(${usuario.id_usuario})">Eliminar</button>
                                <button class="btn btn-info btn-sm" onclick="cambiarContrasena(${usuario.id_usuario})">Cambiar Contraseña</button>
                            </div>
                        </div>`;
                    usuariosContainer.append(usuarioHtml);
                });
            },
            error: function () {
                hideSpinner();
                showNotification('Error al cargar la lista de usuarios', 'error');
            }
        });
    }

    $('#crearUsuarioForm').submit(function (e) {
        e.preventDefault();
        showSpinner();

        const nuevoUsuario = {
            email: $('#email').val(),
            password: $('#password').val(),
            tipo_usuario: $('#tipo_usuario').val()
        };

        $.ajax({
            url: `${apiUrl}/crear_usuario`,
            method: 'POST',
            headers: headers,
            data: JSON.stringify(nuevoUsuario),
            success: function () {
                hideSpinner();
                showNotification('Usuario creado exitosamente', 'success');
                $('#crearUsuarioForm')[0].reset();
                loadUsuarios();
            },
            error: function () {
                hideSpinner();
                showNotification('Error al crear el usuario', 'error');
            }
        });
    });

    window.editarUsuario = function (idUsuario) {
        Swal.fire({
            title: 'Editar permisos de usuario',
            input: 'select',
            inputOptions: {
                user: 'Usuario',
                admin: 'Administrador'
            },
            inputPlaceholder: 'Seleccione el tipo de usuario',
            showCancelButton: true,
            confirmButtonText: 'Guardar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                showSpinner();
                $.ajax({
                    url: `${apiUrl}/editar_permisos/${idUsuario}`,
                    method: 'PATCH',
                    headers: headers,
                    data: JSON.stringify({ tipo_usuario: result.value }),
                    success: function () {
                        hideSpinner();
                        showNotification('Permisos de usuario actualizados', 'success');
                        loadUsuarios();
                    },
                    error: function () {
                        hideSpinner();
                        showNotification('Error al actualizar permisos', 'error');
                    }
                });
            }
        });
    };

    window.eliminarUsuario = function (idUsuario) {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "Esta acción no se puede deshacer",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                showSpinner();
                $.ajax({
                    url: `${apiUrl}/eliminar_usuario/${idUsuario}`,
                    method: 'DELETE',
                    headers: headers,
                    success: function () {
                        hideSpinner();
                        showNotification('Usuario eliminado exitosamente', 'success');
                        loadUsuarios();
                    },
                    error: function () {
                        hideSpinner();
                        showNotification('Error al eliminar el usuario', 'error');
                    }
                });
            }
        });
    };

    window.cambiarContrasena = function (idUsuario) {
        Swal.fire({
            title: 'Cambiar contraseña de usuario',
            input: 'password',
            inputPlaceholder: 'Ingrese la nueva contraseña',
            showCancelButton: true,
            confirmButtonText: 'Guardar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                showSpinner();
                $.ajax({
                    url: `${apiUrl}/cambiar_contraseña/${idUsuario}`,
                    method: 'PATCH',
                    headers: headers,
                    data: JSON.stringify({ nueva_contraseña: result.value }),
                    success: function () {
                        hideSpinner();
                        showNotification('Contraseña actualizada exitosamente', 'success');
                    },
                    error: function () {
                        hideSpinner();
                        showNotification('Error al actualizar la contraseña', 'error');
                    }
                });
            }
        });
    };

    loadUsuarios();
});
