# RSC Chain — Plataforma Web Completa

Bienvenido a la plataforma oficial de RSC Chain: una solución avanzada, segura y sin fronteras para minería, wallet, staking y marketplace P2P de RSC.

## 🚀 ¿Qué incluye este proyecto?
- **Frontend profesional y responsive**: HTML, CSS y JS puro, con animaciones, dark mode, accesibilidad y UX moderna.
- **Wallet no-custodial**: Clave privada solo en el navegador, backup seguro, balance y transacciones reales.
- **Staking avanzado**: Pools, validadores, delegación real y recompensas.
- **Marketplace P2P**: Compra/venta de RSC sin KYC, órdenes reales, filtros y chat.
- **Mining web**: Minado real desde el navegador, solo con wallet activa.
- **Backend Node.js/Express**: Proxy seguro a la blockchain oficial, validación y manejo de errores.

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

## 📞 Soporte
¿Dudas o problemas? Escribe a [soporte@rscchain.com](mailto:soporte@rscchain.com)

---

¡Gracias por usar RSC Chain! Sin bancos, sin fronteras, sin límites. 