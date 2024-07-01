document.addEventListener("DOMContentLoaded", function() {
    const baseUrl = 'http://localhost:5000/api';
    const pageSize = 10;
    let currentPage = 1;
    let totalPages = 0;
    let filter = '';

    function showLoader() {
        document.getElementById('loader').style.display = 'block';
    }

    function hideLoader() {
        document.getElementById('loader').style.display = 'none';
    }

    async function fetchChecklistsRealizados(page, filter = '') {
        showLoader();
        try {
            const response = await fetch(`${baseUrl}/checklists_realizados?page=${page}&size=${pageSize}&filter=${filter}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            });

            if (!response.ok) {
                throw new Error('Error al obtener los checklists realizados');
            }

            const data = await response.json();
            const checklists = data.items;
            totalPages = data.totalPages;
            renderChecklists(checklists);
            renderPagination();
        } catch (error) {
            console.error('Error al cargar los checklists realizados:', error);
        } finally {
            hideLoader();
        }
    }

    function renderChecklists(checklists) {
        const tableBody = document.getElementById('checklist-table-body');
        tableBody.innerHTML = '';

        checklists.forEach(checklist => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${checklist.usuario}</td>
                <td>${checklist.codigo_interno}</td>
                <td>${checklist.faena}</td>
                <td>${new Date(checklist.fecha_realizacion).toLocaleString()}</td>
                <td>
                    <button class="btn btn-primary" onclick="verDetalles(${checklist.id_checklist_realizado})">Ver Detalles</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    function renderPagination() {
        const paginationContainer = document.getElementById('pagination-container');
        paginationContainer.innerHTML = '';

        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.classList.add('btn', 'btn-link');
            pageButton.textContent = i;
            pageButton.addEventListener('click', function() {
                currentPage = i;
                fetchChecklistsRealizados(currentPage, filter);
            });

            if (i === currentPage) {
                pageButton.classList.add('active');
            }

            paginationContainer.appendChild(pageButton);
        }
    }

    document.getElementById('searchInput').addEventListener('input', function() {
        filter = this.value.toLowerCase();
        fetchChecklistsRealizados(currentPage, filter);
    });

    fetchChecklistsRealizados(currentPage);

    window.verDetalles = async function(checklistRealizadoId) {
        try {
            const response = await fetch(`${baseUrl}/checklist/${checklistRealizadoId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            });

            if (!response.ok) {
                throw new Error('Error al obtener los detalles del checklist');
            }

            const checklist = await response.json();
            mostrarDetallesModal(checklist);
        } catch (error) {
            console.error('Error al cargar los detalles del checklist:', error);
            alert('Error al cargar los detalles del checklist');
        }
    };

    function mostrarDetallesModal(checklist) {
        const modalContent = `
            <div class="modal fade" id="checklistModal" tabindex="-1" aria-labelledby="checklistModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="checklistModalLabel">Detalles del Checklist</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <p><strong>Usuario:</strong> ${checklist.usuario}</p>
                            <p><strong>Código Interno:</strong> ${checklist.codigo_interno}</p>
                            <p><strong>Faena:</strong> ${checklist.faena}</p>
                            <p><strong>Fecha:</strong> ${new Date(checklist.fecha_realizacion).toLocaleString()}</p>
                            <h5>Componentes:</h5>
                            ${checklist.checklist.componentes.map(componente => `
                                <div>
                                    <p><strong>${componente.nombre}</strong></p>
                                    ${componente.tareas.map(tarea => `
                                        <p>${tarea.nombre}</p>
                                    `).join('')}
                                </div>
                            `).join('')}
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalContent);
        const checklistModal = new bootstrap.Modal(document.getElementById('checklistModal'));
        checklistModal.show();
    }
});