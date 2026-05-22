# CompuTR

Aplicación de venta de computadores con frontend estático y backend Node/Express.

## Estructura

- `frontend/`: sitio estático (`index.html`, `script.js`, `styles.css`, `config.js`)
- `backend/`: API Express (`server.js`)

## Desarrollo local

1. Instalar dependencias del backend:
   ```bash
   cd backend
   npm install
   ```
2. Iniciar backend:
   ```bash
   npm start
   ```
3. Abrir `frontend/index.html` en navegador o ir a `http://localhost:3001`.

En local, el frontend usa automáticamente `http://localhost:3001`.

## Configurar URL de API para producción

Editar `frontend/config.js`:

```js
window.APP_CONFIG = {
  apiBaseUrl: 'https://YOUR-BACKEND.amazonaws.com'
};
```

- En `localhost` se sigue usando `http://localhost:3001`.
- Fuera de `localhost`, se usa `apiBaseUrl`.

## Despliegue en AWS

### 1) Backend en Elastic Beanstalk (Node.js)

1. Desde AWS Console, crear entorno Elastic Beanstalk (plataforma Node.js).
2. Empaquetar y subir el contenido de `backend/` (incluye `package.json`, `server.js`, `Procfile`).
3. Elastic Beanstalk ejecutará `npm start` (`web: npm start` en `Procfile`).
4. Tomar la URL pública del entorno (ejemplo: `https://mi-api.us-east-1.elasticbeanstalk.com`).

> La API mantiene los endpoints existentes:
> - `GET /computadores`
> - `GET /computadores/:id`
> - `POST /ventas`
> - `GET /ventas`
> - `POST /reset`

### 2) Frontend en Amazon S3 (sitio estático)

1. Crear bucket S3 para hosting estático.
2. Habilitar **Static website hosting** (index: `index.html`).
3. Subir archivos de `frontend/`.
4. Dar permisos públicos de lectura al bucket/objetos (o usar CloudFront + OAC).

### 3) Conectar frontend con backend

1. Editar `frontend/config.js` con la URL pública de Elastic Beanstalk.
2. Volver a subir `frontend/config.js` al bucket S3.
3. Verificar en navegador que el frontend consume la API desplegada.
