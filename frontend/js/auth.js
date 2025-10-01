// Configuración de la API
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : '/api';

// Función para obtener el token del almacenamiento
function getToken() {
    return sessionStorage.getItem('token');
}

// Función para guardar el token
function saveToken(token) {
    sessionStorage.setItem('token', token);
}

// Función para guardar información del usuario
function saveUser(user) {
    sessionStorage.setItem('user', JSON.stringify(user));
}

// Función para obtener información del usuario
function getUser() {
    const userStr = sessionStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

// Función para limpiar sesión
function clearSession() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
}

// Función para cerrar sesión
function logout() {
    clearSession();
    window.location.href = 'index.html';
}

// Función para verificar autenticación
function checkAuth() {
    const token = getToken();
    if (!token) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// Función para verificar rol de administrador
function checkAdmin() {
    const user = getUser();
    if (!user || user.role !== 'admin') {
        window.location.href = 'dashboard.html';
        return false;
    }
    return true;
}

// Función para hacer peticiones autenticadas
async function fetchWithAuth(url, options = {}) {
    const token = getToken();
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
        ...options,
        headers
    });
    
    // Si recibimos un 401 o 403, redirigir al login
    if (response.status === 401 || response.status === 403) {
        clearSession();
        window.location.href = 'index.html';
        throw new Error('Unauthorized');
    }
    
    return response;
}

// Función para mostrar mensajes
function showMessage(elementId, message, type = 'error') {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.className = type === 'error' ? 'error-message' : 'success-message';
        element.style.display = 'block';
        
        // Ocultar después de 5 segundos
        setTimeout(() => {
            element.style.display = 'none';
        }, 5000);
    }
}

// Función para formatear fecha
function formatDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('es-MX', options);
}

// Función para formatear moneda
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(amount);
}