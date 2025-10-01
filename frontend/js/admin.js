document.addEventListener('DOMContentLoaded', () => {
    // Verificar autenticación y rol de admin
    if (!checkAuth()) return;
    if (!checkAdmin()) return;

    const user = getUser();
    document.getElementById('userName').textContent = user.username;

    // Cargar datos iniciales
    loadUsers();
    loadDonations();
    loadRequests();
    loadInventory();
    loadStats();

    // Event listeners para formularios
    document.getElementById('editUserForm').addEventListener('submit', handleEditUser);
    document.getElementById('addItemForm').addEventListener('submit', handleAddItem);
    document.getElementById('editItemForm').addEventListener('submit', handleEditItem);
});

// Mostrar sección
function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');

    document.querySelectorAll('.menu li a').forEach(link => {
        link.classList.remove('active');
    });
    event.target.classList.add('active');

    // Recargar datos según la sección
    if (sectionId === 'users') loadUsers();
    if (sectionId === 'donations') {
        loadDonations();
        loadRequests();
    }
    if (sectionId === 'inventory') loadInventory();
    if (sectionId === 'reports') loadStats();
}

// ========== GESTIÓN DE USUARIOS ==========

async function loadUsers() {
    try {
        const response = await fetchWithAuth(`${API_URL}/users`);
        const data = await response.json();

        if (response.ok) {
            displayUsers(data.users);
        }
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

function displayUsers(users) {
    const tbody = document.querySelector('#usersTable tbody');
    tbody.innerHTML = '';

    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td><span class="badge ${user.role === 'admin' ? 'badge-approved' : 'badge-pending'}">${user.role}</span></td>
            <td>${formatDate(user.created_at)}</td>
            <td>
                <button class="btn btn-small btn-secondary" onclick="openEditUserModal(${user.id})">Editar</button>
                <button class="btn btn-small btn-danger" onclick="deleteUser(${user.id})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function openEditUserModal(userId) {
    try {
        const response = await fetchWithAuth(`${API_URL}/users/${userId}`);
        const data = await response.json();

        if (response.ok) {
            const user = data.user;
            document.getElementById('editUserId').value = user.id;
            document.getElementById('editUsername').value = user.username;
            document.getElementById('editEmail').value = user.email;
            document.getElementById('editRole').value = user.role;

            document.getElementById('editUserModal').classList.add('active');
        }
    } catch (error) {
        console.error('Error loading user:', error);
    }
}

async function handleEditUser(e) {
    e.preventDefault();

    const userId = document.getElementById('editUserId').value;
    const username = document.getElementById('editUsername').value;
    const email = document.getElementById('editEmail').value;
    const role = document.getElementById('editRole').value;

    try {
        const response = await fetchWithAuth(`${API_URL}/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify({ username, email, role })
        });

        if (response.ok) {
            alert('Usuario actualizado exitosamente');
            closeModal('editUserModal');
            loadUsers();
        } else {
            const data = await response.json();
            alert(data.error || 'Error al actualizar usuario');
        }
    } catch (error) {
        console.error('Error updating user:', error);
        alert('Error de conexión');
    }
}

async function deleteUser(userId) {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;

    try {
        const response = await fetchWithAuth(`${API_URL}/users/${userId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Usuario eliminado exitosamente');
            loadUsers();
        } else {
            const data = await response.json();
            alert(data.error || 'Error al eliminar usuario');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error de conexión');
    }
}

// ========== GESTIÓN DE DONACIONES ==========

function showDonationTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    if (tab === 'received') {
        document.getElementById('receivedTab').style.display = 'block';
        document.getElementById('requestsTab').style.display = 'none';
    } else {
        document.getElementById('receivedTab').style.display = 'none';
        document.getElementById('requestsTab').style.display = 'block';
    }
}

async function loadDonations() {
    try {
        const response = await fetchWithAuth(`${API_URL}/donations/received`);
        const data = await response.json();

        if (response.ok) {
            displayDonationsTable(data.donations);
        }
    } catch (error) {
        console.error('Error loading donations:', error);
    }
}

function displayDonationsTable(donations) {
    const tbody = document.querySelector('#donationsTable tbody');
    tbody.innerHTML = '';

    if (donations.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No hay donaciones</td></tr>';
        return;
    }

    donations.forEach(donation => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${donation.id}</td>
            <td>${donation.username}</td>
            <td>${donation.amount}</td>
            <td>${donation.description || 'N/A'}</td>
            <td>${formatDate(donation.date)}</td>
            <td>
                <button class="btn btn-small btn-danger" onclick="deleteDonation(${donation.id})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function deleteDonation(id) {
    if (!confirm('¿Eliminar esta donación?')) return;

    try {
        const response = await fetchWithAuth(`${API_URL}/donations/received/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Donación eliminada');
            loadDonations();
        }
    } catch (error) {
        console.error('Error deleting donation:', error);
    }
}

async function loadRequests() {
    try {
        const response = await fetchWithAuth(`${API_URL}/donations/requests`);
        const data = await response.json();

        if (response.ok) {
            displayRequestsTable(data.requests);
        }
    } catch (error) {
        console.error('Error loading requests:', error);
    }
}

function displayRequestsTable(requests) {
    const tbody = document.querySelector('#requestsTable tbody');
    tbody.innerHTML = '';

    if (requests.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No hay solicitudes</td></tr>';
        return;
    }

    requests.forEach(request => {
        const row = document.createElement('tr');
        const statusBadge = getStatusBadge(request.status);
        
        row.innerHTML = `
            <td>${request.id}</td>
            <td>${request.username}</td>
            <td>${request.item_type}</td>
            <td>${request.quantity}</td>
            <td>${request.reason}</td>
            <td>${statusBadge}</td>
            <td>${formatDate(request.date)}</td>
            <td>
                <select onchange="updateRequestStatus(${request.id}, this.value)" class="btn-small">
                    <option value="">Cambiar estado...</option>
                    <option value="pending">Pendiente</option>
                    <option value="approved">Aprobar</option>
                    <option value="rejected">Rechazar</option>
                </select>
                <button class="btn btn-small btn-danger" onclick="deleteRequest(${request.id})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function updateRequestStatus(id, status) {
    if (!status) return;

    try {
        const response = await fetchWithAuth(`${API_URL}/donations/requests/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });

        if (response.ok) {
            alert('Estado actualizado');
            loadRequests();
        }
    } catch (error) {
        console.error('Error updating status:', error);
    }
}

async function deleteRequest(id) {
    if (!confirm('¿Eliminar esta solicitud?')) return;

    try {
        const response = await fetchWithAuth(`${API_URL}/donations/requests/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Solicitud eliminada');
            loadRequests();
        }
    } catch (error) {
        console.error('Error deleting request:', error);
    }
}

// ========== GESTIÓN DE INVENTARIO ==========

async function loadInventory() {
    try {
        const response = await fetchWithAuth(`${API_URL}/inventory`);
        const data = await response.json();

        if (response.ok) {
            displayInventory(data.inventory);
        }
    } catch (error) {
        console.error('Error loading inventory:', error);
    }
}

function displayInventory(items) {
    const tbody = document.querySelector('#inventoryTable tbody');
    tbody.innerHTML = '';

    if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No hay items en inventario</td></tr>';
        return;
    }

    items.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.id}</td>
            <td>${item.item_name}</td>
            <td>${item.category}</td>
            <td>${item.quantity}</td>
            <td>${item.size || 'N/A'}</td>
            <td>${formatDate(item.last_updated)}</td>
            <td>
                <button class="btn btn-small btn-secondary" onclick="openEditItemModal(${item.id})">Editar</button>
                <button class="btn btn-small btn-danger" onclick="deleteItem(${item.id})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function showAddItemModal() {
    document.getElementById('addItemModal').classList.add('active');
}

async function handleAddItem(e) {
    e.preventDefault();

    const item_name = document.getElementById('itemName').value;
    const category = document.getElementById('category').value;
    const quantity = document.getElementById('itemQuantity').value;
    const size = document.getElementById('size').value;

    try {
        const response = await fetchWithAuth(`${API_URL}/inventory`, {
            method: 'POST',
            body: JSON.stringify({ item_name, category, quantity, size })
        });

        if (response.ok) {
            alert('Item agregado exitosamente');
            closeModal('addItemModal');
            e.target.reset();
            loadInventory();
        }
    } catch (error) {
        console.error('Error adding item:', error);
    }
}

async function openEditItemModal(itemId) {
    try {
        const response = await fetchWithAuth(`${API_URL}/inventory/${itemId}`);
        const data = await response.json();

        if (response.ok) {
            const item = data.item;
            document.getElementById('editItemId').value = item.id;
            document.getElementById('editItemName').value = item.item_name;
            document.getElementById('editCategory').value = item.category;
            document.getElementById('editItemQuantity').value = item.quantity;
            document.getElementById('editSize').value = item.size || '';

            document.getElementById('editItemModal').classList.add('active');
        }
    } catch (error) {
        console.error('Error loading item:', error);
    }
}

async function handleEditItem(e) {
    e.preventDefault();

    const itemId = document.getElementById('editItemId').value;
    const item_name = document.getElementById('editItemName').value;
    const category = document.getElementById('editCategory').value;
    const quantity = document.getElementById('editItemQuantity').value;
    const size = document.getElementById('editSize').value;

    try {
        const response = await fetchWithAuth(`${API_URL}/inventory/${itemId}`, {
            method: 'PUT',
            body: JSON.stringify({ item_name, category, quantity, size })
        });

        if (response.ok) {
            alert('Item actualizado exitosamente');
            closeModal('editItemModal');
            loadInventory();
        }
    } catch (error) {
        console.error('Error updating item:', error);
    }
}

async function deleteItem(itemId) {
    if (!confirm('¿Eliminar este item?')) return;

    try {
        const response = await fetchWithAuth(`${API_URL}/inventory/${itemId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Item eliminado');
            loadInventory();
        }
    } catch (error) {
        console.error('Error deleting item:', error);
    }
}

// ========== ESTADÍSTICAS ==========

async function loadStats() {
    try {
        const [usersRes, donationsRes, requestsRes, inventoryRes] = await Promise.all([
            fetchWithAuth(`${API_URL}/users`),
            fetchWithAuth(`${API_URL}/donations/received`),
            fetchWithAuth(`${API_URL}/donations/requests`),
            fetchWithAuth(`${API_URL}/inventory`)
        ]);

        const users = await usersRes.json();
        const donations = await donationsRes.json();
        const requests = await requestsRes.json();
        const inventory = await inventoryRes.json();

        document.getElementById('totalUsers').textContent = users.users?.length || 0;
        document.getElementById('totalDonations').textContent = donations.donations?.length || 0;
        
        const pending = requests.requests?.filter(r => r.status === 'pending').length || 0;
        document.getElementById('pendingRequests').textContent = pending;
        
        const totalItems = inventory.inventory?.reduce((sum, item) => sum + parseInt(item.quantity), 0) || 0;
        document.getElementById('totalInventory').textContent = totalItems;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// ========== UTILIDADES ==========

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function getStatusBadge(status) {
    const badges = {
        pending: '<span class="badge badge-pending">Pendiente</span>',
        approved: '<span class="badge badge-approved">Aprobada</span>',
        rejected: '<span class="badge badge-rejected">Rechazada</span>'
    };
    return badges[status] || status;
}