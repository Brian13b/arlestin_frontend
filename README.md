# 💧 Arlestin Logística

![Estado](https://img.shields.io/badge/Estado-En_Producci%C3%B3n-success)
![Versión](https://img.shields.io/badge/Versi%C3%B3n-1.0.0-blue)
![PWA](https://img.shields.io/badge/PWA-Ready-f31260)
![React](https://img.shields.io/badge/React-Vite-61dafb?logo=react)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css)

**Arlestin** es una solución integral multiplataforma (Progressive Web App) diseñada para modernizar y optimizar la logística de empresas distribuidoras de agua (sifones y bidones). 

Permite a los choferes gestionar sus rutas de reparto en la calle sin depender de una conexión a internet constante, llevar un control estricto de los envases prestados y cobrar en múltiples formatos, mientras la administración audita la caja en tiempo real.

---

## ✨ Características Principales

### 🚚 Gestión de Repartos "En Vivo"
* **Rutas Dinámicas:** Creación de hojas de ruta predefinidas con capacidad de reordenamiento (drag & drop / flechas) en tiempo real.
* **Excepciones Diarias:** Posibilidad de omitir clientes o agregar "paradas excepcionales" sobre la marcha según la demanda del día.
* **Offline-First (PWA):** Soporte para instalación como aplicación nativa en iOS/Android y funcionamiento sin internet en zonas de baja cobertura.

### 📦 Punto de Venta y Control de Envases
* **Calculadora Integrada:** Cobros mixtos (Efectivo, Transferencia, Fiado/A Cuenta) y aplicación de descuentos promocionales.
* **Trazabilidad de Envases:** Sistema inteligente que calcula el neto de envases (dejados vs. retirados) y actualiza el stock prestado de cada cliente de forma automática.
* **Resumen de Viaje:** Liquidación de ruta automatizada al finalizar el recorrido para facilitar la rendición del chofer.

### 👥 Administración y Portal de Clientes
* **Auditoría de Caja:** Historial detallado por día y acumulados del mes, separado por método de pago.
* **Gestión de Clientes:** Fichas completas con historial de saldos, geolocalización básica y generación automática de PIN de acceso.
* **Portal de Auto-Gestión:** Los clientes pueden ingresar con su teléfono y PIN para auditar sus deudas, revisar sus envases prestados y realizar pedidos vía WhatsApp.

---

## 🛠️ Tecnologías Utilizadas

### Frontend
* **Core:** React 18 + Vite
* **Estilos:** Tailwind CSS
* **Navegación:** React Router DOM
* **Iconografía:** Lucide React
* **PWA:** `vite-plugin-pwa` (Service Workers, Workbox)
* **Peticiones:** Axios

### Backend (API)
* **Framework:** Python / FastAPI
* **Base de Datos:** PostgreSQL
* **ORM:** SQLAlchemy
* **Autenticación:** JWT (JSON Web Tokens)

---

## 👨‍💻 Autores
Un producto desarrollado por **GB Soluciones Digitales**.

**Desarrollador Principal**: Brian Battauz (@Brian13b)

---