# 🤝 Sistema de Gestión de Donaciones

Aplicación web completa para gestionar donaciones de una asociación solidaria. Incluye autenticación JWT, gestión de usuarios, donaciones, solicitudes e inventario.

## 📋 Características

- ✅ Autenticación con JWT
- ✅ Roles de usuario (Admin y Usuario)
- ✅ Gestión de donaciones recibidas
- ✅ Solicitudes de ayuda
- ✅ Administración de inventario (ropa y calzado)
- ✅ Reportes y estadísticas
- ✅ Pruebas unitarias con Jest (>80% cobertura)
- ✅ Seguridad básica (Helmet, Rate Limiting)
- ✅ Diseño responsive

## 🛠️ Tecnologías

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

## 📁 Estructura del Proyecto

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

## 🚀 Instalación Local

### Prerrequisitos

- Node.js (v14 o superior)
- PostgreSQL (v12 o superior)
- npm o yarn

### Paso 1: Clonar el repositorio

```bash
git clone <tu-repositorio>
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
JWT_SECRET=tu-secreto-super-seguro-cambiar-en-produccion
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

## 🧪 Ejecutar Pruebas

### Todas las pruebas con cobertura

```bash
npm test
```

### Pruebas en modo watch

```bash
npm run test:watch
```

### Ver reporte de cobertura

Después de ejecutar `npm test`, abre:
```bash
open coverage/lcov-report/index.html
```

## 🔐 Pruebas de Seguridad

### OWASP ZAP

1. Descarga e instala [OWASP ZAP](https://www.zaproxy.org/download/)
2. Ejecuta tu aplicación localmente
3. En OWASP ZAP:
   - Click en "Automated Scan"
   - Ingresa la URL: `http://localhost:3000`
   - Click en "Attack"
4. Revisa el reporte generado

### SonarQube

1. Instala SonarQube localmente o usa SonarCloud
2. Instala el scanner:

```bash
npm install -g sonarqube-scanner
```

3. Crea `sonar-project.properties`:

```properties
sonar.projectKey=donation-app
sonar.projectName=Donation Management System
sonar.projectVersion=1.0
sonar.sources=backend,frontend
sonar.exclusions=node_modules/**,coverage/**,backend/tests/**
sonar.javascript.lcov.reportPaths=coverage/lcov.info
```

4. Ejecuta el análisis:

```bash
npm test  # Genera cobertura
sonar-scanner
```

## 🌐 Despliegue en Render

### Paso 1: Preparar el repositorio

1. Asegúrate de que todos los archivos estén en tu repositorio de GitHub
2. Confirma que `.gitignore` excluye `node_modules` y `.env`

### Paso 2: Crear cuenta en Render

1. Ve a [Render.com](https://render.com)
2. Regístrate con tu cuenta de GitHub

### Paso 3: Crear PostgreSQL Database

1. En el dashboard de Render, click en "New +"
2. Selecciona "PostgreSQL"
3. Configura:
   - **Name**: `donation-db`
   - **Database**: `donation_db`
   - **User**: (automático)
   - **Region**: Elige el más cercano
   - **Plan**: Free
4. Click en "Create Database"
5. **Guarda la "Internal Database URL"** que aparece en la página

### Paso 4: Crear Web Service

1. En el dashboard, click en "New +"
2. Selecciona "Web Service"
3. Conecta tu repositorio de GitHub
4. Configura:
   - **Name**: `donation-app`
   - **Region**: Mismo que la base de datos
   - **Branch**: `main`
   - **Root Directory**: (dejar vacío)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### Paso 5: Configurar Variables de Entorno

En la sección "Environment" del Web Service, agrega:

```
NODE_ENV=production
DATABASE_URL=<pega-la-internal-database-url-de-render>
JWT_SECRET=<genera-un-secreto-aleatorio-seguro>
PORT=3000
```

Para generar un JWT_SECRET seguro:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Paso 6: Desplegar

1. Click en "Create Web Service"
2. Render automáticamente:
   - Clonará tu repositorio
   - Instalará dependencias
   - Iniciará la aplicación
3. La URL de tu aplicación aparecerá como: `https://donation-app.onrender.com`

### Paso 7: Verificar el despliegue

1. Abre la URL de tu aplicación
2. Intenta iniciar sesión con:
   - Username: `admin`
   - Password: `admin123`

## 📊 API Endpoints

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

## 🔒 Seguridad Implementada

- **Autenticación JWT** con tokens de 24 horas
- **Bcrypt** para hash de contraseñas (10 rounds)
- **Helmet.js** para headers de seguridad HTTP
- **Rate Limiting** (100 requests por 15 minutos)
- **CORS** configurado
- **Validación de entrada** en todos los endpoints
- **Prevención de SQL Injection** con queries parametrizadas
- **Roles y permisos** (Admin/User)

## 📝 Notas Importantes

### Para desarrollo local
- La aplicación usa PostgreSQL. Asegúrate de tenerlo instalado y corriendo
- Las pruebas usan mocks de la base de datos, no necesitas conexión real

### Para producción en Render
- El plan Free de Render hiberna la aplicación después de 15 minutos de inactividad
- La base de datos Free tiene límite de 90 días
- La primera carga puede ser lenta (cold start)

### Métricas de Calidad

El proyecto cumple con:
- ✅ Cobertura de pruebas > 80%
- ✅ Sin vulnerabilidades críticas (OWASP ZAP)
- ✅ Code smells < 10 (SonarQube)
- ✅ Deuda técnica < 1 hora

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es de uso académico.

## 👥 Contacto

Para soporte o preguntas sobre el proyecto, contacta al equipo de desarrollo.

---

**Nota**: Este es un proyecto académico con fines educativos. No debe usarse en producción sin revisiones de seguridad adicionales.