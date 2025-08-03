# RSC Chain Web

Una interfaz web moderna para la blockchain RSC Chain conectada a la API de producción.

## 🚀 Características

- **Wallet No-Custodial**: Crear y gestionar wallets directamente en el navegador
- **Minería Real**: Conectar con la blockchain para minar RSC tokens
- **Staking Avanzado**: Delegar tokens a validadores y pools de staking
- **Trading P2P**: Intercambiar RSC tokens de forma descentralizada
- **Datos en Tiempo Real**: Estadísticas actualizadas de la blockchain
- **Interfaz Moderna**: Diseño responsive y animaciones fluidas

## 🔗 Conexión con Blockchain

La web está conectada a la API de producción de RSC Chain:
```
https://rsc-chain-production.up.railway.app/
```

### Endpoints Principales

- **Wallet**: `/api/wallet/*` - Crear wallets, consultar balance, enviar transacciones
- **Mining**: `/api/mining/*` - Iniciar/detener minería, consultar recompensas
- **Staking**: `/api/staking/*` - Delegar, retirar delegaciones, consultar pools
- **P2P**: `/api/p2p/*` - Crear órdenes, ejecutar trades, consultar transacciones
- **Blockchain**: `/api/blockchain/*` - Estadísticas generales, información de red

## 🛠️ Instalación

### Backend
```bash
cd backend
npm install
npm start
```

### Frontend
Simplemente abre `index.html` en tu navegador o usa un servidor local:
```bash
# Con Python
python -m http.server 8000

# Con Node.js
npx serve .
```

## 📱 Funcionalidades

### Wallet
- ✅ Crear wallet no-custodial
- ✅ Consultar balance real
- ✅ Enviar transacciones
- ✅ Historial de transacciones
- ✅ Generar QR code
- ✅ Ocultar/mostrar balance

### Mining
- ✅ Iniciar sesión de minería (24h)
- ✅ Consultar estado de minería
- ✅ Obtener recompensas reales
- ✅ Historial de sesiones
- ✅ Timer de cooldown

### Staking
- ✅ Ver pools de staking
- ✅ Delegar tokens
- ✅ Retirar delegaciones
- ✅ Consultar validadores
- ✅ Historial de delegaciones
- ✅ Gráficos de rendimiento

### P2P Trading
- ✅ Crear órdenes de compra/venta
- ✅ Ejecutar trades
- ✅ Chat entre traders
- ✅ Historial de transacciones
- ✅ Filtros y búsqueda
- ✅ Gráficos de precios

## 🔧 Configuración

### Variables de Entorno
```bash
# Backend
PORT=4000
BLOCKCHAIN_API=https://rsc-chain-production.up.railway.app/
```

### Personalización
- Modificar `assets/css/` para cambiar estilos
- Editar `assets/js/` para funcionalidad personalizada
- Actualizar `backend/routes.js` para nuevos endpoints

## 📊 Datos Reales

Todos los datos mostrados en la web provienen de la blockchain real:
- Balances de wallets
- Transacciones confirmadas
- Estadísticas de staking
- Órdenes P2P activas
- Información de validadores
- Precios y volúmenes

## 🔒 Seguridad

- **No-Custodial**: Las claves privadas nunca salen del navegador
- **Validación**: Todas las transacciones se validan en el backend
- **HTTPS**: Conexión segura con la API de blockchain
- **Sanitización**: Validación de inputs en frontend y backend

## 🚀 Despliegue

### Producción
```bash
# Backend en Railway/Heroku
git push heroku main

# Frontend en Netlify/Vercel
npm run build
```

### Desarrollo
```bash
# Backend con hot reload
npm run dev

# Frontend con live server
npx live-server
```

## 📈 Monitoreo

- Logs de transacciones en consola
- Métricas de rendimiento
- Errores de API capturados
- Estadísticas de uso

---

## 📁 Estructura del proyecto

```
rsc-web/
  ├── assets/           # CSS, JS, imágenes y datos
  ├── backend/          # Backend Node.js/Express (API)
  ├── index.html        # Landing principal
  ├── wallet.html       # Wallet
  ├── staking.html      # Staking
  ├── p2p.html          # Marketplace P2P
  ├── mine.html         # Minado
  └── ...
```

---

## 🖥️ Deploy y uso

### Backend (API)
1. Ve a la carpeta backend:
   ```bash
   cd backend
   ```
2. Instala dependencias:
   ```bash
   npm install
   ```
3. Inicia el servidor:
   ```bash
   npm start
   ```
   El backend escuchará en el puerto 4000 por defecto.

### Frontend
- Puedes servirlo con cualquier servidor estático (Vercel, Netlify, Nginx, Apache, etc).
- Asegúrate de que el frontend haga las peticiones a `/api` (el backend debe estar en el mismo dominio o usar proxy/rewrite en producción).

### Variables de entorno
- Cambia el puerto con la variable `PORT` en el backend si lo necesitas.
- Si el endpoint de la blockchain cambia, actualízalo en `backend/routes.js`.

---

## 🔗 Endpoints principales del backend

### Wallet
- `GET /api/wallet/balance?address=0x...` — Balance real de la wallet
- `GET /api/wallet/transactions?address=0x...` — Historial real de transacciones

### Mining
- `POST /api/mining/start` — Inicia minado para una wallet

### Staking
- `GET /api/staking/pools` — Pools de staking
- `GET /api/staking/validators` — Validadores recomendados
- `POST /api/staking/delegate` — Delegar tokens (staking)

### P2P
- `GET /api/p2p/orders` — Lista órdenes de compra/venta
- `POST /api/p2p/orders` — Crear nueva orden P2P

---

## ✅ Checklist de producción
- [x] Responsividad y dark mode
- [x] Accesibilidad y navegación por teclado
- [x] Validaciones y feedback en formularios
- [x] Notificaciones claras y accesibles
- [x] Seguridad: clave privada solo en navegador
- [x] Integración real con blockchain
- [x] Backend seguro y validado
- [x] Animaciones y microinteracciones
- [x] Onboarding y tutoriales para usuarios nuevos

---

## 🛡️ Recomendaciones finales
- Haz pruebas reales en móvil y escritorio.
- Usa Lighthouse para auditar accesibilidad y performance.
- Configura HTTPS y CORS en producción.
- Haz backup de la clave privada de cada wallet antes de operar.

---

## 🤝 Contribuir

1. Fork el repositorio
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🆘 Soporte

- **Documentación**: Revisa los comentarios en el código
- **Issues**: Reporta bugs en GitHub Issues
- **Discord**: Únete a nuestro servidor para soporte en vivo

---

**RSC Chain Web** - Conectando el futuro de las finanzas descentralizadas 🌐⚡ 