# 🧪 Guía de Pruebas y Seguridad

Esta guía detalla cómo ejecutar todas las pruebas requeridas para el proyecto.

## 📊 Pruebas Unitarias con Jest

### Ejecutar todas las pruebas

```bash
npm test
```

Este comando ejecutará:
- Todas las pruebas en `backend/tests/`
- Generará reporte de cobertura en la carpeta `coverage/`
- Mostrará resumen de cobertura en la terminal

### Ver reporte de cobertura detallado

```bash
# En macOS/Linux
open coverage/lcov-report/index.html

# En Windows
start coverage/lcov-report/index.html
```

### Pruebas en modo desarrollo (watch)

```bash
npm run test:watch
```

Esto ejecutará las pruebas automáticamente cada vez que guardes cambios.

### Cobertura esperada

El proyecto debe mantener **≥ 80%** de cobertura en:
- ✅ Statements (declaraciones)
- ✅ Branches (ramas)
- ✅ Functions (funciones)
- ✅ Lines (líneas)

### Archivos de prueba incluidos

1. **auth.test.js**: Pruebas de registro y login
   - Registro exitoso
   - Validaciones de entrada
   - Login con credenciales válidas/inválidas
   - Generación de tokens JWT

2. **donations.test.js**: Pruebas de donaciones y solicitudes
   - Crear donaciones
   - Listar donaciones
   - Crear solicitudes
   - Actualizar estado de solicitudes
   - Permisos por rol

3. **users.test.js**: Pruebas de gestión de usuarios
   - CRUD completo de usuarios
   - Cambio de contraseña
   - Validación de permisos

4. **inventory.test.js**: Pruebas de inventario
   - CRUD de items
   - Validaciones de cantidad
   - Permisos de administrador

5. **middleware.test.js**: Pruebas de autenticación
   - Validación de tokens
   - Verificación de roles
   - Manejo de tokens expirados

## 🔐 Pruebas de Seguridad con OWASP ZAP

### Instalación de OWASP ZAP

1. Descarga desde [https://www.zaproxy.org/download/](https://www.zaproxy.org/download/)
2. Instala según tu sistema operativo
3. Ejecuta la aplicación

### Ejecutar escaneo de seguridad

#### Paso 1: Iniciar la aplicación

```bash
npm start
```

Asegúrate de que la aplicación esté corriendo en `http://localhost:3000`

#### Paso 2: Escaneo Automático

1. Abre OWASP ZAP
2. Click en "Automated Scan"
3. Ingresa URL: `http://localhost:3000`
4. Click en "Attack"
5. Espera a que termine (5-10 minutos)

#### Paso 3: Escaneo Manual (más detallado)

1. En ZAP, ve a "Quick Start"
2. Selecciona "Manual Explore"
3. Ingresa URL: `http://localhost:3000`
4. Click en "Launch Browser"
5. Navega por la aplicación:
   - Login
   - Registro
   - Dashboard
   - Panel de admin
6. En ZAP, click derecho en el sitio → "Attack" → "Active Scan"

#### Paso 4: Revisar resultados

Los resultados se muestran por severidad:
- 🔴 **High**: Vulnerabilidades críticas
- 🟠 **Medium**: Vulnerabilidades moderadas
- 🟡 **Low**: Vulnerabilidades menores
- 🔵 **Informational**: Información general

### Vulnerabilidades comunes a verificar

- ✅ **XSS (Cross-Site Scripting)**: Inyección de scripts
- ✅ **SQL Injection**: Inyección SQL
- ✅ **CSRF**: Cross-Site Request Forgery
- ✅ **Security Headers**: Headers de seguridad
- ✅ **Authentication**: Autenticación débil

### Generar reporte

1. En ZAP, ve a "Report" → "Generate HTML Report"
2. Guarda el archivo
3. Documenta las vulnerabilidades encontradas

### Protecciones implementadas

- ✅ Helmet.js para headers de seguridad
- ✅ Rate limiting contra fuerza bruta
- ✅ Queries parametrizadas (prevención SQL injection)
- ✅ Validación de entrada
- ✅ Tokens JWT con expiración
- ✅ CORS configurado

## 📈 Análisis de Calidad con SonarQube

### Opción 1: SonarQube Local

#### Instalación

1. Descarga SonarQube: [https://www.sonarqube.org/downloads/](https://www.sonarqube.org/downloads/)
2. Extrae el archivo
3. Ejecuta:

```bash
# En macOS/Linux
./sonarqube-x.x.x/bin/macosx-universal-64/sonar.sh start

# En Windows
sonarqube-x.x.x\bin\windows-x86-64\StartSonar.bat
```

4. Abre: `http://localhost:9000`
5. Login: admin/admin (cambia la contraseña)

#### Instalar Scanner

```bash
npm install -g sonarqube-scanner
```

#### Ejecutar análisis

```bash
# Generar cobertura primero
npm test

# Ejecutar análisis
sonar-scanner
```

### Opción 2: SonarCloud (más fácil)

#### Configuración

1. Ve a [https://sonarcloud.io](https://sonarcloud.io)
2. Inicia sesión con GitHub
3. Click en "+" → "Analyze new project"
4. Selecciona tu repositorio
5. Sigue las instrucciones para configurar

#### Agregar al CI/CD con GitHub Actions

Crea `.github/workflows/sonarcloud.yml`:

```yaml
name: SonarCloud
on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  sonarcloud:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm test
      - name: SonarCloud Scan
        uses: SonarSource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

### Métricas a revisar

#### 1. **Bugs**
- Errores en el código
- Objetivo: 0 bugs

#### 2. **Code Smells**
- Problemas de mantenibilidad
- Objetivo: < 10 code smells

#### 3. **Duplicación**
- Código duplicado
- Objetivo: < 3%

#### 4. **Cobertura**
- Cobertura de pruebas
- Objetivo: ≥ 80%

#### 5. **Deuda Técnica**
- Tiempo estimado para arreglar issues
- Objetivo: < 1 hora

### Generar reporte

1. En el dashboard de SonarQube/SonarCloud
2. Selecciona tu proyecto
3. Ve a "More" → "Export as PDF"
4. Guarda el reporte

## 📋 Checklist de Evaluación

Antes de entregar el proyecto, verifica:

### Funcionalidad
- [ ] Login funciona correctamente
- [ ] Registro crea usuarios
- [ ] Dashboard de usuario accesible
- [ ] Panel de admin funcional
- [ ] CRUD de usuarios funciona
- [ ] CRUD de donaciones funciona
- [ ] CRUD de inventario funciona
- [ ] Reportes muestran datos

### Pruebas
- [ ] `npm test` pasa todas las pruebas
- [ ] Cobertura ≥ 80%
- [ ] Reporte de cobertura generado

### Seguridad
- [ ] OWASP ZAP ejecutado
- [ ] Vulnerabilidades documentadas
- [ ] Reporte HTML de ZAP guardado
- [ ] No hay vulnerabilidades críticas sin mitigar

### Calidad de Código
- [ ] SonarQube/SonarCloud ejecutado
- [ ] Métricas documentadas
- [ ] Code smells < 10
- [ ] Deuda técnica < 1 hora

### Despliegue
- [ ] Aplicación desplegada en Render
- [ ] URL pública funciona
- [ ] Base de datos PostgreSQL configurada
- [ ] Variables de entorno configuradas

### Documentación
- [ ] README.md completo
- [ ] Instrucciones de instalación claras
- [ ] Guía de despliegue incluida
- [ ] API documentada

## 🎯 Resultados Esperados

### Pruebas Unitarias
```
Test Suites: 5 passed, 5 total
Tests:       50+ passed, 50+ total
Coverage:    Statements: 85%+
             Branches: 80%+
             Functions: 85%+
             Lines: 85%+
```

### OWASP ZAP
- 0 vulnerabilidades críticas (High)
- < 5 vulnerabilidades moderadas (Medium)
- Bajo/Info aceptables con explicación

### SonarQube
- Quality Gate: PASSED
- Bugs: 0
- Code Smells: < 10
- Cobertura: > 80%
- Duplicación: < 3%
- Deuda Técnica: < 1h

## 🐛 Troubleshooting

### Jest no encuentra módulos
```bash
rm -rf node_modules package-lock.json
npm install
```

### OWASP ZAP no detecta la aplicación
- Verifica que la app esté corriendo en localhost:3000
- Desactiva firewall temporalmente
- Usa modo "Safe mode" en ZAP

### SonarQube no genera métricas
- Ejecuta `npm test` primero
- Verifica que existe `coverage/lcov.info`
- Revisa `sonar-project.properties`

### Error de conexión a base de datos
- Verifica que PostgreSQL esté corriendo
- Confirma las credenciales en `.env`
- Crea la base de datos si no existe

## 📞 Soporte

Si encuentras problemas:
1. Revisa los logs en la terminal
2. Verifica las variables de entorno
3. Consulta la documentación oficial de cada herramienta
4. Revisa los issues en GitHub del proyecto

---

**Última actualización**: Septiembre 2024