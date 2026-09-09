# E-SPORT Control

API REST y panel web para gestionar torneos de futbol E-SPORT.

## Tecnologias

- Node.js LTS, Express y Sequelize.
- MySQL como base de datos relacional.
- JWT y bcryptjs para autenticacion.
- React y Vite para el panel web.

## Instalacion y ejecucion

1. Ejecuta `npm install`.
2. Configura `.env` con `PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` y `JWT_SECRET`.
3. Ejecuta `sql/schema.sql` en MySQL.
4. Ejecuta `npm run dev`.
5. Abre `http://localhost:5173`; la API usa `http://localhost:3000/api`.

## Arquitectura de seis capas

La peticion sigue **Routes -> Middlewares -> Controllers -> Services -> Repositories -> Models**.

- `server/ApiRoutes.js`: endpoints, sin logica de negocio.
- `server/middleware/`: JWT, roles, validaciones y errores.
- `server/controllers/`: entrada y respuesta HTTP.
- `server/services/`: reglas de negocio.
- `server/repositories/`: unico acceso a Sequelize y a la base de datos.
- `server/models/ModelosModel.js`: entidades, claves y relaciones.

## Endpoints

- `GET /api/health`: estado de la API.
- `POST /api/auth/register`: registra `nombre`, `email`, `password` y `rol` opcional.
- `POST /api/auth/login`: recibe `email` y `password`, y devuelve JWT.
- `GET /api/dashboard`: resumen de torneos, equipos y partidos.
- `GET /api/torneos` y `POST /api/torneos` (administrador).
- `POST /api/equipos` (delegado).
- `POST /api/equipos/:id_equipo/jugadores` (delegado).
- `GET /api/inscripciones` (administrador o delegado).
- `POST /api/torneos/:id_torneo/equipos/:id_equipo/inscripcion` (delegado).
- `PATCH /api/inscripciones/:id_inscripcion` (administrador, estado `Aprobado` o `Rechazado`).
- `GET /api/partidos`.
- `POST /api/partidos` (administrador).
- `PATCH /api/partidos/:id_partido/resultado` (administrador).
- `GET /api/torneos/:id_torneo/tabla-posiciones`: calcula puntos, partidos y diferencia de goles.

Los endpoints protegidos requieren `Authorization: Bearer <token>`.

Ejemplo de registro:

```json
{
  "nombre": "Ana Delegada",
  "email": "ana@example.com",
  "password": "clave-segura",
  "rol": "Delegado"
}
```

Ejemplo de resultado:

```json
{
  "goles_local": 3,
  "goles_visita": 1
}
```

## Modelo relacional

`usuarios` se relaciona 1:N con `equipos`; `equipos` 1:N con `jugadores`; `torneos` y `equipos` N:M mediante `inscripciones_torneo`; `torneos` 1:N con `partidos`, que referencia el equipo local y visitante. Las claves foraneas y la restriccion unica torneo-equipo estan en `sql/schema.sql`.

## Convenciones y Gitflow

Las columnas usan `snake_case`, las funciones `camelCase` y los archivos de capas PascalCase con sufijo: `TorneoService.js`, `TorneoController.js`, `TorneoRepository.js` y `AuthMiddleware.js`.

`main` contiene versiones estables, `develop` integra el trabajo y cada funcionalidad se desarrolla en `feature/nombre-funcionalidad`. Los cambios llegan a `develop` mediante Pull Request revisado; antes de entregar, `develop` se integra a `main`. Cada integrante debe conservar sus commits y Pull Requests para evidenciar participacion equitativa.

## Entregables de sustentacion

El equipo debe preparar un video corto y una presentacion oficial que demuestren el registro/login, permisos por rol, gestion de equipos y jugadores, inscripciones, fixture, resultados, tabla de posiciones y el flujo de seis capas. Todos los integrantes deben asistir y poder explicar sus decisiones tecnicas. Estos entregables y su evidencia de GitHub no pueden generarse automaticamente desde el codigo.
