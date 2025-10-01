# Sistema de Gestión de Donaciones

Aplicación web completa para gestionar donaciones de una asociación solidaria. Incluye autenticación JWT, gestión de usuarios, donaciones, solicitudes e inventario.

## Características

- Autenticación con JWT
- Roles de usuario (Admin y Usuario)
- Gestión de donaciones recibidas
- Solicitudes de ayuda
- Administración de inventario (ropa y calzado)
- Reportes y estadísticas
- Pruebas unitarias con Jest (>80% cobertura)
- Seguridad básica (Helmet, Rate Limiting)
- Diseño responsive

## Tecnologías

**Backend:**
- Node.js
- Express.js
- PostgreSQL
- JWT (jsonwebtoken)
- bcryptjs

**Frontend:**
- HTML5
- CSS3
- JavaScript (Vanilla)

**Pruebas:**
- Jest
- Supertest

## Estructura del Proyecto

```
donation-app/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── donations.js
│   │   └── inventory.js
│   ├── tests/
│   │   ├── auth.test.js
│   │   ├── donations.test.js
│   │   ├── users.test.js
│   │   ├── inventory.test.js
│   │   └── middleware.test.js
│   └── server.js
├── frontend/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   ├── auth.js
│   │   ├── login.js
│   │   ├── register.js
│   │   ├── dashboard.js
│   │   └── admin.js
│   ├── index.html
│   ├── register.html
│   ├── dashboard.html
│   └── admin.html
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## Instalación Local

### Prerrequisitos

- Node.js (v14 o superior)
- PostgreSQL (v12 o superior)
- npm o yarn

### Paso 1: Clonar el repositorio

```bash
git clone https://github.com/SilverCoyote012/IngieneriaSoftwareProyecto
cd donation-app
```

### Paso 2: Instalar dependencias

```bash
npm install
```

### Paso 3: Configurar base de datos PostgreSQL

Crea una base de datos en PostgreSQL:

```bash
psql -U postgres
CREATE DATABASE donation_db;
\q
```

### Paso 4: Configurar variables de entorno

Copia el archivo `.env.example` a `.env`:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus datos:

```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/donation_db
JWT_SECRET=secreto
```

### Paso 5: Ejecutar la aplicación

```bash
# Modo desarrollo (con nodemon)
npm run dev

# Modo producción
npm start
```

La aplicación estará disponible en `http://localhost:3000`

### Credenciales por defecto

- **Usuario Admin:**
  - Username: `admin`
  - Password: `admin123`

## Ejecutar Pruebas

### Todas las pruebas con cobertura

```bash
npm test
```

## API Endpoints

### Autenticación

- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión

### Usuarios (Admin)

- `GET /api/users` - Obtener todos los usuarios
- `GET /api/users/:id` - Obtener un usuario
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario
- `POST /api/users/change-password` - Cambiar contraseña

### Donaciones

- `POST /api/donations/received` - Crear donación
- `GET /api/donations/received` - Listar donaciones
- `DELETE /api/donations/received/:id` - Eliminar donación (Admin)
- `POST /api/donations/requests` - Crear solicitud
- `GET /api/donations/requests` - Listar solicitudes
- `PATCH /api/donations/requests/:id` - Actualizar estado (Admin)
- `DELETE /api/donations/requests/:id` - Eliminar solicitud (Admin)

### Inventario

- `GET /api/inventory` - Listar inventario
- `GET /api/inventory/:id` - Obtener item
- `POST /api/inventory` - Crear item (Admin)
- `PUT /api/inventory/:id` - Actualizar item (Admin)
- `DELETE /api/inventory/:id` - Eliminar item (Admin)

## Seguridad Implementada

- **Autenticación JWT** con tokens de 24 horas
- **Bcrypt** para hash de contraseñas (10 rounds)
- **Helmet.js** para headers de seguridad HTTP
- **Rate Limiting** (100 requests por 15 minutos)
- **CORS** configurado
- **Validación de entrada** en todos los endpoints
- **Prevención de SQL Injection** con queries parametrizadas
- **Roles y permisos** (Admin/User)

## Notas Importantes

### Para desarrollo local
- La aplicación usa PostgreSQL. Asegúrate de tenerlo instalado y corriendo
- Las pruebas usan mocks de la base de datos, no necesitas conexión real

### Para producción en Render
- El plan Free de Render hiberna la aplicación después de 15 minutos de inactividad
- La base de datos Free tiene límite de 90 días
- La primera carga puede ser lenta

---

**Nota**: Este es un proyecto académico con fines educativos. No debe usarse en producción sin revisiones de seguridad adicionales.