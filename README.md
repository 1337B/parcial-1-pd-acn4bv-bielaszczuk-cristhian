# FleetSafety

Aplicación web que calcula y muestra una **velocidad máxima segura** para el conductor según:
- Condiciones climáticas en tiempo real (Open-Meteo).
- Tipo de camino (asfalto / ripio / tierra).
- Momento del día (día / noche).
- Reglas y límites configurados por un administrador.

## ¿Qué problema resuelve?

En flotas pequeñas y medianas, los conductores suelen carecer de una referencia **dinámica** de velocidad segura que contemple clima y contexto. FleetSafety ofrece una recomendación clara, explicable y configurable, reduciendo incidentes y estandarizando criterios operativos.

## ¿Para quién está pensado?

- **Conductores (Driver):** ven un tablero simple, **solo lectura**, con la velocidad segura y su justificación.
- **Administradores (Admin):** definen base de velocidad, tipo de superficie, momento del día y **ubicación por defecto**; además habilitan (forzado) el uso de clima externo.

## Funcionalidades clave

- **Velocidad segura en tiempo real:** motor de reglas (`SpeedRule`) que combina ajustes del admin + clima.
- **Clima online con soporte offline:** integra Open-Meteo; si no hay red usa el **último clima conocido** desde el historial.
- **Historial de cálculos:** cada recálculo agrega un ítem con hora, valor y factores aplicados.
- **Configuración del administrador:** base, superficie, día/noche y **coordenadas obligatorias**; todo persistido en `localStorage`.
- **Autenticación local:** login/register de demo (persistido en `localStorage`) con roles `admin` y `driver`.
- **Driver read-only:** el conductor **no edita** nada; puede **recalcular** para refrescar clima y resultado.

## Tecnologías y stack

- **Lenguaje:** TypeScript.
- **Framework:** Next.js (App Router).
- **UI:** Tailwind CSS (tema oscuro, componentes propios).
- **Datos remotos:** Open-Meteo (fetch + JSON).
- **Estado/React:** hooks (`useState`, `useEffect`), custom hook `useWeather`.
- **Persistencia local:** `localStorage` (wrapper `safeStorage`).
- **Build/Dev:** Next.js (pnpm/npm), ESLint.
- **Convención de commits:** `[#ISSUE][FEATURE|TASK|HOTFIX] Mensaje`.

## Arquitectura (capas)

- `src/services/weather`
  - `OpenMeteoClient`: fetch asíncrono (HTTP) + manejo de errores.
  - `WeatherMapper`: mapeo de respuesta → `WeatherSnapshot`.
- `src/domain`
  - Modelos y enums (`Surface`, `DayPeriod`, `WeatherSnapshot`, `SpeedConfig`).
  - `SpeedRule`: clase que aplica factores (superficie, día/noche, precipitación, viento) y redondeo a 5 km/h.
- `src/hooks`
  - `useWeather`: obtiene clima con **refresh**, maneja **offline** y fallback a último clima del historial.
- `src/lib`
  - `storage/safeStorage`: wrapper tipado de `localStorage`.
  - `mappers/*`: labels y factores de dominio (superficie/día/precipitación).
  - `math/roundToNearest`, `debounce`.
- `src/contexts`
  - `AuthContext`: sesión local (no productiva), seedea un admin de demo.
- `src/app`
  - Rutas: `/login`, `/register`, `/home`, `/admin`, `/driver`.
  - `ProtectedRoute`: guardas por rol; `/admin` sólo admin, `/driver` usuario autenticado.

## Estructura del proyecto

src/

├─ app/

│ ├─ login/ page.tsx

│ ├─ register/ page.tsx

│ ├─ home/ page.tsx

│ ├─ admin/ page.tsx

│ ├─ driver/ page.tsx

│ ├─ layout.tsx

│ └─ globals.css

├─ components/

│ ├─ ui/ (AppHeader, BackButton, EmptyState, Skeletons, ...)

│ └─ auth/ProtectedRoute.tsx

├─ contexts/ AuthContext.tsx

├─ domain/ (Road.ts, Weather.ts, SpeedConfig.ts, SpeedRule.ts, index.ts)

├─ hooks/ useWeather.ts

├─ lib/

│ ├─ storage/ safeStorage.ts

│ ├─ mappers/ (surfaceLabel.ts, dayPeriodLabel.ts, precipitationLabel.ts)

│ └─ math/ roundToNearest.ts

└─ services/

└─ weather/ (openMeteoClient.ts, WeatherMapper.ts, index.ts)

## Cómo ejecutar

# Requisitos: Node 18+
pnpm install          # o npm install
pnpm dev              # o npm run dev
# abrir http://localhost:3000
Cuentas demo

Admin: admin@fleetsafety.com / admin123

Driver: registro desde /register y elegí rol driver.

Nota: la autenticación es sólo para demo y usa localStorage. No utilizar en producción.

Convención de ramas y commits
Ramas: feature/NN-nombre, task/NN-nombre, hotfix/NN-nombre

Commits: [#ISSUE][FEATURE|TASK|HOTFIX] Mensaje
Ej.: [#12][FEATURE] Driver dashboard: runtime history cards

Más info
Ver la Wiki del repo para arquitectura, pantallas y mapeo de requisitos de la cátedra.
