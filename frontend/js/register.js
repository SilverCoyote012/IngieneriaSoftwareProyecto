document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validaciones
        if (!username || !email || !password || !confirmPassword) {
            showMessage('errorMessage', 'Por favor completa todos los campos');
            return;
        }

        if (password !== confirmPassword) {
            showMessage('errorMessage', 'Las contraseñas no coinciden');
            return;
        }

        if (password.length < 6) {
            showMessage('errorMessage', 'La contraseña debe tener al menos 6 caracteres');
            return;
        }

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showMessage('errorMessage', 'Por favor ingresa un email válido');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Guardar token y usuario
                saveToken(data.token);
                saveUser(data.user);

                showMessage('successMessage', 'Registro exitoso. Redirigiendo...', 'success');

                // Redirigir al dashboard
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                showMessage('errorMessage', data.error || 'Error al registrar usuario');
            }
        } catch (error) {
            console.error('Registration error:', error);
            showMessage('errorMessage', 'Error de conexión. Verifica tu conexión a internet.');
        }
    });
});