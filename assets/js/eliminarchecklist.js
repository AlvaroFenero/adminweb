document.addEventListener("DOMContentLoaded", function() {
    const baseUrl = 'http://localhost:5000/api';
    const token = localStorage.getItem('token'); // Obtener el token del localStorage

    function showSpinner() {
        document.getElementById("spinner").style.display = "block";
    }

    function hideSpinner() {
        document.getElementById("spinner").style.display = "none";
    }

    async function searchMachine() {
        const codigoInterno = document.getElementById("codigoInterno").value.trim();
        if (!codigoInterno) {
            showError("Por favor, ingresa un código interno.");
            return;
        }
        showSpinner();
        try {
            const response = await fetch(`${baseUrl}/maquinas?codigo_interno=${codigoInterno}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }

            const maquinas = await response.json();
            if (maquinas.length === 0) {
                Swal.fire({
                    icon: 'warning',
                    title: 'No encontrado',
                    text: 'No se encontró el checklist asignado a la máquina.',
                    showConfirmButton: true,
                });
                return;
            }
            const maquina = maquinas[0];
            const checklistResponse = await fetch(`${baseUrl}/checklists?codigo_interno=${maquina.codigo_interno}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!checklistResponse.ok) {
                throw new Error('Error en la respuesta del servidor');
            }

            const checklists = await checklistResponse.json();
            if (checklists.length === 0) {
                Swal.fire({
                    icon: 'warning',
                    title: 'No encontrado',
                    text: 'No se encontró el checklist asignado a la máquina.',
                    showConfirmButton: true,
                });
                return;
            }
            const checklist = checklists[0];
            displayChecklist(checklist);
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al buscar la máquina.',
                showConfirmButton: true,
            });
            console.error(error);
        } finally {
            hideSpinner();
        }
    }

    function displayChecklist(checklist) {
        document.getElementById("checklistForm").style.display = "block";
        document.getElementById("machineType").value = checklist.id_tipo_maquina || '';
        const componentsContainer = document.getElementById("components");
        componentsContainer.innerHTML = '';

        checklist.componentes.forEach((componente, index) => {
            const componentDiv = document.createElement("div");
            componentDiv.classList.add('mb-3');
            componentDiv.innerHTML = `
                <label for="component${index}" class="form-label">Componente:</label>
                <div class="input-group mb-2">
                    <input type="text" class="form-control" id="component${index}" value="${componente.nombre || ''}" disabled>
                </div>
                <div id="tasks${index}">
                    ${componente.tasks.map((task, taskIndex) => `
                        <div class="input-group mb-2">
                            <input type="text" class="form-control" id="task${index}-${taskIndex}" value="${task.nombre || ''}" disabled>
                        </div>
                    `).join('')}
                </div>
            `;
            componentsContainer.appendChild(componentDiv);
        });
    }

    async function deleteChecklist() {
        const codigoInterno = document.getElementById("codigoInterno").value.trim();
        if (!codigoInterno) {
            Swal.fire({
                icon: 'warning',
                title: 'Advertencia',
                text: 'Por favor, ingresa un código interno.',
                showConfirmButton: true,
            });
            return;
        }

        Swal.fire({
            title: '¿Estás seguro?',
            text: "Esta acción no se puede deshacer.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                showSpinner();
                try {
                    const response = await fetch(`${baseUrl}/eliminar_checklist?codigo_interno=${codigoInterno}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (!response.ok) {
                        throw new Error('Error en la respuesta del servidor');
                    }

                    Swal.fire({
                        icon: 'success',
                        title: '¡Eliminado!',
                        text: 'El checklist y todos sus componentes y tareas han sido eliminados.',
                        showConfirmButton: false,
                        timer: 1500
                    }).then(() => {
                        window.location.href = '../pages/home.html';
                    });
                } catch (error) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Error al eliminar el checklist.',
                        showConfirmButton: true,
                    });
                    console.error(error);
                } finally {
                    hideSpinner();
                }
            }
        });
    }

    // Expose functions to global scope
    window.searchMachine = searchMachine;
    window.deleteChecklist = deleteChecklist;
});
