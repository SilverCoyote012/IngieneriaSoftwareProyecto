document.addEventListener('DOMContentLoaded', () => {
    // Si ya está autenticado, redirigir
    const token = getToken();
    if (token) {
        const user = getUser();
        if (user && user.role === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'dashboard.html';
        }
        return;
    }

    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        // Validación básica
        if (!username || !password) {
            showMessage('errorMessage', 'Por favor completa todos los campos');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Guardar token y usuario
                saveToken(data.token);
                saveUser(data.user);

                showMessage('successMessage', 'Inicio de sesión exitoso. Redirigiendo...', 'success');

                // Redirigir según el rol
                setTimeout(() => {
                    if (data.user.role === 'admin') {
                        window.location.href = 'admin.html';
                    } else {
                        window.location.href = 'dashboard.html';
                    }
                }, 1000);
            } else {
                showMessage('errorMessage', data.error || 'Error al iniciar sesión');
            }
        } catch (error) {
            console.error('Login error:', error);
            showMessage('errorMessage', 'Error de conexión. Verifica tu conexión a internet.');
        }
    });
});