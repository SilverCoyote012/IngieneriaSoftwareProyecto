document.addEventListener('DOMContentLoaded', () => {
    // Verificar autenticación
    if (!checkAuth()) return;

    const user = getUser();
    document.getElementById('userName').textContent = user.username;

    // Cargar datos iniciales
    loadDonations();
    loadRequests();

    // Formulario de donación
    const donationForm = document.getElementById('donationForm');
    donationForm.addEventListener('submit', handleDonationSubmit);

    // Formulario de solicitud
    const requestForm = document.getElementById('requestForm');
    requestForm.addEventListener('submit', handleRequestSubmit);
});

// Mostrar sección
function showSection(sectionId) {
    // Ocultar todas las secciones
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    // Mostrar la sección seleccionada
    document.getElementById(sectionId).classList.add('active');

    // Actualizar menú activo
    document.querySelectorAll('.menu li a').forEach(link => {
        link.classList.remove('active');
    });
    event.target.classList.add('active');

    // Cargar datos si es necesario
    if (sectionId === 'reports') {
        loadDonations();
        loadRequests();
    }
}

// Manejar envío de donación
async function handleDonationSubmit(e) {
    e.preventDefault();

    const amount = document.getElementById('amount').value;
    const description = document.getElementById('description').value;

    try {
        const response = await fetchWithAuth(`${API_URL}/donations/received`, {
            method: 'POST',
            body: JSON.stringify({ amount, description })
        });

        const data = await response.json();

        if (response.ok) {
            showDonationMessage('¡Gracias por tu donación! Tu apoyo es muy valioso.', 'success');
            e.target.reset();
        } else {
            showDonationMessage(data.error || 'Error al procesar la donación', 'error');
        }
    } catch (error) {
        console.error('Donation error:', error);
        showDonationMessage('Error de conexión', 'error');
    }
}

// Manejar envío de solicitud
async function handleRequestSubmit(e) {
    e.preventDefault();

    const item_type = document.getElementById('itemType').value;
    const quantity = document.getElementById('quantity').value;
    const reason = document.getElementById('reason').value;

    try {
        const response = await fetchWithAuth(`${API_URL}/donations/requests`, {
            method: 'POST',
            body: JSON.stringify({ item_type, quantity, reason })
        });

        const data = await response.json();

        if (response.ok) {
            showRequestMessage('Solicitud enviada exitosamente. Será revisada pronto.', 'success');
            e.target.reset();
        } else {
            showRequestMessage(data.error || 'Error al enviar la solicitud', 'error');
        }
    } catch (error) {
        console.error('Request error:', error);
        showRequestMessage('Error de conexión', 'error');
    }
}

// Cargar donaciones
async function loadDonations() {
    try {
        const response = await fetchWithAuth(`${API_URL}/donations/received`);
        const data = await response.json();

        if (response.ok) {
            displayDonations(data.donations);
        }
    } catch (error) {
        console.error('Error loading donations:', error);
    }
}

// Cargar solicitudes
async function loadRequests() {
    try {
        const response = await fetchWithAuth(`${API_URL}/donations/requests`);
        const data = await response.json();

        if (response.ok) {
            displayRequests(data.requests);
        }
    } catch (error) {
        console.error('Error loading requests:', error);
    }
}

// Mostrar donaciones en tabla
function displayDonations(donations) {
    const tbody = document.querySelector('#receivedTable tbody');
    tbody.innerHTML = '';

    if (donations.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No hay donaciones registradas</td></tr>';
        return;
    }

    donations.forEach(donation => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${donation.username}</td>
            <td>${donation.amount}</td>
            <td>${donation.description || 'Sin descripción'}</td>
            <td>${formatDate(donation.date)}</td>
        `;
        tbody.appendChild(row);
    });
}

// Mostrar solicitudes en tabla
function displayRequests(requests) {
    const tbody = document.querySelector('#requestsTable tbody');
    tbody.innerHTML = '';

    if (requests.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No hay solicitudes registradas</td></tr>';
        return;
    }

    requests.forEach(request => {
        const row = document.createElement('tr');
        const statusBadge = getStatusBadge(request.status);
        
        row.innerHTML = `
            <td>${request.username}</td>
            <td>${request.item_type}</td>
            <td>${request.quantity}</td>
            <td>${request.reason}</td>
            <td>${statusBadge}</td>
            <td>${formatDate(request.date)}</td>
        `;
        tbody.appendChild(row);
    });
}

// Obtener badge de estado
function getStatusBadge(status) {
    const badges = {
        pending: '<span class="badge badge-pending">Pendiente</span>',
        approved: '<span class="badge badge-approved">Aprobada</span>',
        rejected: '<span class="badge badge-rejected">Rechazada</span>'
    };
    return badges[status] || status;
}

// Mostrar reporte específico
function showReport(reportType) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    if (reportType === 'received') {
        document.getElementById('receivedReport').style.display = 'block';
        document.getElementById('requestsReport').style.display = 'none';
    } else {
        document.getElementById('receivedReport').style.display = 'none';
        document.getElementById('requestsReport').style.display = 'block';
    }
}

// Mostrar mensaje de donación
function showDonationMessage(message, type) {
    const messageDiv = document.getElementById('donationMessage');
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';

    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

// Mostrar mensaje de solicitud
function showRequestMessage(message, type) {
    const messageDiv = document.getElementById('requestMessage');
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';

    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}