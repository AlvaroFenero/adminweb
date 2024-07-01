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
                showError("No se encontró la máquina.");
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
                showError("No se encontró el checklist.");
                return;
            }
            const checklist = checklists[0];
            displayChecklist(checklist);
        } catch (error) {
            showError("Error al buscar la máquina.");
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
                    <input type="text" class="form-control" id="component${index}" value="${componente.nombre || ''}">
                    <button class="btn btn-danger" type="button" onclick="removeComponent(${index})"><i class="fas fa-trash-alt"></i></button>
                </div>
                <div id="tasks${index}">
                    ${componente.tasks.map((task, taskIndex) => `
                        <div class="input-group mb-2">
                            <input type="text" class="form-control" id="task${index}-${taskIndex}" value="${task.nombre || ''}">
                            <button class="btn btn-danger" type="button" onclick="removeTask(${index}, ${taskIndex})"><i class="fas fa-trash-alt"></i></button>
                        </div>
                    `).join('')}
                </div>
                <button type="button" class="btn btn-primary add-task-btn" onclick="addTask(${index})">Agregar Tarea</button>
            `;
            componentsContainer.appendChild(componentDiv);
        });
    }

    async function getChecklistId(codigoInterno) {
        try {
            const response = await fetch(`${baseUrl}/checklists?codigo_interno=${codigoInterno}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Error obteniendo el ID del checklist');
            }

            const data = await response.json();
            if (data.length === 0) {
                throw new Error('Checklist no encontrado');
            }

            return data[0].id_checklist;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async function saveChanges() {
        const codigoInterno = document.getElementById("codigoInterno").value.trim();
        const machineType = document.getElementById("machineType").value;
        const components = [];
        const componentsContainer = document.getElementById("components");

        for (let i = 0; i < componentsContainer.children.length; i++) {
            const componentName = document.getElementById(`component${i}`).value;
            const tasks = [];
            const tasksContainer = document.getElementById(`tasks${i}`);

            for (let j = 0; j < tasksContainer.children.length; j++) {
                const taskInput = tasksContainer.children[j].querySelector('input');
                if (taskInput) {
                    const taskName = taskInput.value;
                    tasks.push({ nombre: taskName, id_tarea: 0, id_componente: 0 });
                }
            }

            components.push({ nombre: componentName, id_componente: 0, tasks: tasks });
        }

        const updatedChecklist = {
            id_tipo_maquina: machineType,
            componentes: components
        };

        showSpinner();
        try {
            const checklistId = await getChecklistId(codigoInterno);

            const response = await fetch(`${baseUrl}/edit_checklist/${checklistId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedChecklist)
            });

            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }

            const result = await response.json();
            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Éxito!',
                    text: 'Checklist actualizado exitosamente.',
                    showConfirmButton: false,
                    timer: 1500
                }).then(() => {
                    window.location.href = '../pages/home.html';
                });
            } else {
                showError(result.error || "Error al actualizar el checklist.");
            }
        } catch (error) {
            showError("Error al actualizar el checklist.");
            console.error(error);
        } finally {
            hideSpinner();
        }
    }

    function addComponent() {
        const componentsContainer = document.getElementById("components");
        const index = componentsContainer.children.length;
        const componentDiv = document.createElement("div");
        componentDiv.classList.add('mb-3');
        componentDiv.innerHTML = `
            <label for="component${index}" class="form-label">Componente:</label>
            <div class="input-group mb-2">
                <input type="text" class="form-control" id="component${index}" value="">
                <button class="btn btn-danger" type="button" onclick="removeComponent(${index})"><i class="fas fa-trash-alt"></i></button>
            </div>
            <div id="tasks${index}"></div>
            <button type="button" class="btn btn-primary add-task-btn" onclick="addTask(${index})">Agregar Tarea</button>
        `;
        componentsContainer.appendChild(componentDiv);
    }

    function addTask(componentIndex) {
        const tasksContainer = document.getElementById(`tasks${componentIndex}`);
        const taskIndex = tasksContainer.children.length;
        const taskDiv = document.createElement("div");
        taskDiv.classList.add('input-group', 'mb-2');
        taskDiv.innerHTML = `
            <input type="text" class="form-control" id="task${componentIndex}-${taskIndex}" value="">
            <button class="btn btn-danger" type="button" onclick="removeTask(${componentIndex}, ${taskIndex})"><i class="fas fa-trash-alt"></i></button>
        `;
        tasksContainer.appendChild(taskDiv);
    }

    function removeComponent(componentIndex) {
        const componentsContainer = document.getElementById("components");
        const componentDiv = componentsContainer.querySelector(`#component${componentIndex}`).parentElement.parentElement;
        if (componentDiv) {
            componentsContainer.removeChild(componentDiv);
        }
    }

    function removeTask(componentIndex, taskIndex) {
        const tasksContainer = document.getElementById(`tasks${componentIndex}`);
        const taskDiv = tasksContainer.querySelector(`#task${componentIndex}-${taskIndex}`).parentElement;
        if (taskDiv) {
            tasksContainer.removeChild(taskDiv);
        }
    }

    function showError(message) {
        const errorDiv = document.getElementById("error");
        errorDiv.style.display = "block";
        errorDiv.textContent = message;
    }

    // Expose functions to global scope
    window.searchMachine = searchMachine;
    window.addComponent = addComponent;
    window.addTask = addTask;
    window.removeComponent = removeComponent;
    window.removeTask = removeTask;
    window.saveChanges = saveChanges;
});
