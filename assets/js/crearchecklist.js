$(document).ready(function () {
    const apiUrl = 'http://localhost:5000/api';
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
    };

    // Función para mostrar spinner
    function showSpinner() {
        $('#spinner').show();
    }

    // Función para ocultar spinner
    function hideSpinner() {
        $('#spinner').hide();
    }

    // Función para mostrar notificación
    function showNotification(message, type) {
        Swal.fire({
            text: message,
            icon: type,
            timer: 2000,
            showConfirmButton: false,
            position: 'bottom-end'
        });
    }

    // Función para agregar un componente
    function addComponent() {
        const componentHtml = `
            <div class="component mb-4">
                <h4>Componente</h4>
                <div class="input-group mb-3">
                    <input type="text" class="form-control component-name" placeholder="Nombre del Componente">
                    <button class="btn btn-outline-danger remove-component-btn" type="button"><i class="fa fa-trash"></i></button>
                    <button class="btn btn-outline-primary edit-component-btn" type="button" style="display:none;"><i class="fa fa-pencil-alt"></i></button>
                </div>
                <div class="tasksContainer">
                    <div class="input-group mb-3 task">
                        <input type="text" class="form-control task-name" placeholder="Nombre de la Tarea">
                        <button class="btn btn-outline-danger remove-task-btn" type="button"><i class="fa fa-trash"></i></button>
                        <button class="btn btn-outline-primary edit-task-btn" type="button" style="display:none;"><i class="fa fa-pencil-alt"></i></button>
                    </div>
                </div>
                <button type="button" class="btn btn-primary add-task-btn">Agregar Tarea</button>
            </div>`;
        $('#componentsContainer').append(componentHtml);
    }

    // Función para eliminar un componente
    function removeComponent(element) {
        $(element).closest('.component').remove();
    }

    // Función para agregar una tarea
    function addTask(element) {
        const taskHtml = `
            <div class="input-group mb-3 task">
                <input type="text" class="form-control task-name" placeholder="Nombre de la Tarea">
                <button class="btn btn-outline-danger remove-task-btn" type="button"><i class="fa fa-trash"></i></button>
                <button class="btn btn-outline-primary edit-task-btn" type="button" style="display:none;"><i class="fa fa-pencil-alt"></i></button>
            </div>`;
        $(element).closest('.component').find('.tasksContainer').append(taskHtml);
    }

    // Función para eliminar una tarea
    function removeTask(element) {
        $(element).closest('.task').remove();
    }

    // Evento para agregar componente
    $('#addComponentBtn').click(function () {
        addComponent();
    });

    // Evento delegado para eliminar componente
    $(document).on('click', '.remove-component-btn', function () {
        removeComponent(this);
    });

    // Evento delegado para agregar tarea
    $(document).on('click', '.add-task-btn', function () {
        addTask(this);
    });

    // Evento delegado para eliminar tarea
    $(document).on('click', '.remove-task-btn', function () {
        removeTask(this);
    });

    // Evento delegado para confirmar el texto de un componente
    $(document).on('blur', '.component-name', function () {
        $(this).prop('readonly', true);
        $(this).siblings('.edit-component-btn').show();
    });

    // Evento delegado para confirmar el texto de una tarea
    $(document).on('blur', '.task-name', function () {
        $(this).prop('readonly', true);
        $(this).siblings('.edit-task-btn').show();
    });

    // Evento delegado para editar el texto de un componente
    $(document).on('click', '.edit-component-btn', function () {
        $(this).siblings('.component-name').prop('readonly', false).focus();
        $(this).hide();
    });

    // Evento delegado para editar el texto de una tarea
    $(document).on('click', '.edit-task-btn', function () {
        $(this).siblings('.task-name').prop('readonly', false).focus();
        $(this).hide();
    });

    // Evento para enviar el formulario
    $('#checklistForm').submit(async function (e) {
        e.preventDefault();
        showSpinner();

        const checklistData = {
            nombre: $('#machineType').val(),
            id_tipo_maquina: $('#machineType').prop('selectedIndex') + 1,
            codigo_interno: $('#code').val(),
            componentes: []
        };

        $('.component').each(function () {
            const component = {
                nombre: $(this).find('.component-name').val(),
                tasks: []
            };
            $(this).find('.task').each(function () {
                const task = {
                    nombre: $(this).find('.task-name').val()
                };
                component.tasks.push(task);
            });
            checklistData.componentes.push(component);
        });

        try {
            const response = await fetch(`${apiUrl}/create_checklist`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(checklistData)
            });

            const data = await response.json();
            if (response.status === 201) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Éxito!',
                    text: 'Checklist creado exitosamente.',
                    showConfirmButton: false,
                    timer: 1500
                }).then(() => {
                    window.location.href = '../pages/home.html';
                });
                $('#checklistForm')[0].reset();
                $('#componentsContainer').empty();
                addComponent(); // Agregar el primer componente vacío
            } else {
                showNotification(data.error || 'Error al crear el checklist', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('Error al conectarse al servidor', 'error');
        } finally {
            hideSpinner();
        }
    });

    // Inicializar con un componente
    $('#componentsContainer').empty(); // Asegurarse de que esté vacío antes de agregar
    addComponent();
});
