# Instrucciones Basicas del Proyecto

## 1) Requisitos previos

- Node.js `22.14.0`
- Backend de la API corriendo (por defecto en `http://localhost:3000/v1`)
- Para Android: Android Studio instalado previamente

## 2) Instalacion y ejecucion (Web)

1. Instalar dependencias:

```bash
npm install
```

2. Copiar el archivo de entorno:

```bash
# Linux/macOS
cp .env.example .env

# Windows PowerShell
Copy-Item .env.example .env
```
o copiar el archivo .env compartido en el correo

3. Ajustar `API_URL` en `.env` (ejemplo local):

```env
API_URL=http://localhost:3000/v1
```

4. Generar `environment.ts` desde `.env`:

```bash
npm run config
```

5. Levantar la app en desarrollo:

```bash
npm start
```

## 3) Flujo para Mobile (Android)

Para probar en celular, la API debe estar expuesta en una URL publica.

1. Exponer API con ngrok (recomendado por configuracion sencilla):

```bash
ngrok http 3000
```

2. Tomar la URL HTTPS publica de ngrok y actualizar `.env`:

```env
API_URL=https://TU_URL_NGROK/v1
```

3. Regenerar variables de entorno:

```bash
npm run config
```

4. Ejecutar build Android completo:

```bash
npm run build-android
```

Este comando hace build web, sincroniza Capacitor y abre Android Studio automaticamente.

## 4) Ejecutar en dispositivo fisico

1. Conectar el celular por USB.
2. Activar `Opciones de desarrollador` y `Depuracion USB`.
3. En Android Studio, seleccionar el dispositivo y ejecutar la app.
