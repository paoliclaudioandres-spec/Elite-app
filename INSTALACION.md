# 📱 ÉLITE Rides — Guía de Instalación PWA

## ¿Qué es esta app?
ÉLITE Rides es una **Progressive Web App (PWA)** — funciona como app nativa en cualquier dispositivo,
sin necesidad de App Store ni Play Store.

---

## 🚀 Cómo instalar

### 📱 Android (Chrome)
1. Abrí el archivo `index.html` desde un servidor web (o usa una app como "Simple HTTP Server")
2. Tocá el menú ⋮ (tres puntos) en Chrome
3. Seleccioná **"Agregar a pantalla de inicio"** o **"Instalar app"**
4. Tocá **Instalar** → ¡Listo! Aparece en tu pantalla como cualquier app

### 🍎 iPhone / iPad (Safari)
1. Abrí la URL en **Safari** (no funciona en Chrome en iOS)
2. Tocá el botón de **compartir** (□↑) en la barra inferior
3. Seleccioná **"Agregar a pantalla de inicio"**
4. Poné el nombre que quieras → **Agregar**

### 💻 PC / Mac (Chrome o Edge)
1. Abrí la URL en Chrome o Edge
2. En la barra de dirección, buscá el ícono **⊕** (instalar)
3. Hacé clic en **Instalar**
4. La app se abre en su propia ventana sin barra del navegador

---

## 🌐 Cómo servir el archivo localmente

### Opción 1 — Python (recomendado, ya viene instalado)
```bash
# En la carpeta de la app, ejecutá:
python3 -m http.server 8080
# Luego abrí: http://localhost:8080
```

### Opción 2 — Node.js
```bash
npx serve .
```

### Opción 3 — Hosting gratuito
Subí la carpeta a cualquiera de estos servicios gratuitos:
- **Netlify Drop**: arrastrá la carpeta a netlify.com/drop
- **Vercel**: `vercel deploy`
- **GitHub Pages**: subí a un repo público

---

## 📂 Archivos incluidos

| Archivo | Descripción |
|---------|-------------|
| `index.html` | App principal (toda la lógica y UI) |
| `manifest.json` | Configuración de la PWA (nombre, ícono, colores) |
| `sw.js` | Service Worker (permite uso offline) |
| `icon-192.svg` | Ícono para Android y pantalla de inicio |
| `icon-512.svg` | Ícono de alta resolución para splash screen |

---

## ✨ Funcionalidades

- ✅ **Funciona offline** — gracias al Service Worker
- ✅ **Instalable** en Android, iPhone, Mac y PC
- ✅ **Sin barra del navegador** — pantalla completa como app nativa
- ✅ **Splash screen** automático en Android
- ✅ **Ícono personalizado** en pantalla de inicio
- ✅ **Notificaciones push** (infraestructura lista para activar)

---

## 🔐 Credenciales de demo
- Usuario: `admin`
- Contraseña: `1234`

---

## 📞 Soporte
Para integrar Google Maps API real o conectar WhatsApp Business API,
contactá al desarrollador.
