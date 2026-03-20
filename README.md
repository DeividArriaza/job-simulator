# Job Simulator — REST CRUD API

API REST con operaciones CRUD completas para gestionar ofertas de trabajo. Construida sin frameworks, utilizando únicamente el módulo nativo `http` de Node.js y PostgreSQL como base de datos relacional. Todo el sistema se levanta con un solo comando mediante Docker Compose.

---

## Tecnologías utilizadas

| Tecnología | Uso |
|---|---|
| **Node.js 20** | Runtime del servidor, usando el módulo nativo `http` (sin Express ni frameworks) |
| **PostgreSQL 16** | Base de datos relacional para persistencia |
| **pg (node-postgres)** | Driver nativo para conectar Node.js con PostgreSQL |
| **Docker** | Containerización de cada servicio |
| **Docker Compose** | Orquestación de los contenedores (API + base de datos) |

---

## Estructura del proyecto

```
job-simulator/
├── backend/
│   ├── config/
│   │   └── db.js              # Conexión a PostgreSQL y lógica de reintentos
│   ├── routes/
│   │   └── jobs.js            # Rutas CRUD, validaciones y queries SQL
│   ├── server.js              # Punto de entrada: servidor HTTP y CORS
│   ├── Dockerfile             # Imagen del backend (Node 20 Alpine)
│   └── package.json           # Dependencias del proyecto
├── frontend/                  # Cliente web pre-construido (HTML + JS + Tailwind)
│   ├── public/
│   │   ├── index.html         # Vista listado
│   │   ├── create.html        # Formulario de creación
│   │   ├── show.html          # Vista detalle
│   │   ├── edit.html          # Formulario de edición
│   │   └── js/
│   │       ├── config.js      # URL de la API y nombre del recurso
│   │       ├── api.js         # Cliente fetch para consumir la API
│   │       ├── index.js       # Lógica de la vista listado
│   │       ├── create.js      # Lógica del formulario de creación
│   │       ├── show.js        # Lógica de la vista detalle
│   │       └── edit.js        # Lógica del formulario de edición
│   ├── Dockerfile             # Imagen del frontend (Nginx)
│   └── nginx.conf             # Configuración del servidor web
├── docker-compose.yml         # Orquestación de todos los servicios
├── init.sql                   # Script de inicialización de la base de datos
├── .env.example               # Plantilla de variables de entorno
└── .gitignore                 # Archivos excluidos del repositorio
```

---

## Cómo funciona

### Arquitectura

El sistema se compone de dos servicios Docker independientes que se comunican entre sí a través de una red interna de Docker:

1. **db** — Contenedor de PostgreSQL 16 que ejecuta el script `init.sql` automáticamente al primer arranque para crear la tabla y cargar datos de ejemplo.
2. **api** — Contenedor de Node.js que expone la API REST en el puerto 8080. Espera a que PostgreSQL esté listo antes de aceptar conexiones (healthcheck + reintentos).

### Servidor HTTP sin framework

El servidor está construido directamente sobre `http.createServer()` de Node.js. El ruteo se implementa manualmente parseando la URL y el método HTTP de cada petición. No se utiliza Express, Fastify, Koa ni ningún otro framework.

### CORS

La API responde con headers `Access-Control-Allow-Origin: *` en todas las peticiones, y maneja las peticiones preflight `OPTIONS` que el navegador envía antes de peticiones con body (POST, PUT, PATCH).

### Conexión a la base de datos

El módulo `backend/config/db.js` crea un pool de conexiones usando las variables de entorno. Incluye una función de reintentos que intenta conectarse hasta 10 veces con intervalos de 2 segundos, ya que PostgreSQL tarda unos segundos en estar disponible dentro de Docker.

### Validaciones

Todos los campos son requeridos y se validan estrictamente por tipo:

- `campo1`, `campo2`, `campo3` — deben ser `string`
- `campo4` — debe ser `integer` (número entero)
- `campo5` — debe ser `float` (número decimal)
- `campo6` — debe ser `boolean`

Las validaciones se aplican en POST y PUT (todos los campos obligatorios) y en PATCH (solo los campos enviados).

---

## Esquema del recurso

| Campo  | Tipo    | Restricciones              |
|--------|---------|----------------------------|
| id     | integer | primary key, autoincrement |
| campo1 | string  | requerido                  |
| campo2 | string  | requerido                  |
| campo3 | string  | requerido                  |
| campo4 | integer | requerido                  |
| campo5 | float   | requerido                  |
| campo6 | boolean | requerido                  |

### Dominio elegido

El recurso representa **ofertas de trabajo**:

| Campo  | Significado     |
|--------|-----------------|
| campo1 | Título del puesto |
| campo2 | Empresa          |
| campo3 | Ubicación        |
| campo4 | Salario          |
| campo5 | Calificación     |
| campo6 | Remoto           |

---

## Endpoints

| Método | Ruta          | Descripción                  | Código éxito |
|--------|---------------|------------------------------|--------------|
| GET    | /jobs         | Listar todos los registros   | 200          |
| GET    | /jobs/:id     | Obtener un registro por ID   | 200          |
| POST   | /jobs         | Crear un nuevo registro      | 201          |
| PUT    | /jobs/:id     | Actualizar registro completo | 200          |
| PATCH  | /jobs/:id     | Actualización parcial        | 200          |
| DELETE | /jobs/:id     | Eliminar un registro         | 204          |

### Códigos de error

| Código | Significado                                    |
|--------|------------------------------------------------|
| 400    | JSON inválido, campos requeridos faltantes o tipos incorrectos |
| 404    | Recurso no encontrado                          |
| 405    | Método HTTP no permitido                       |
| 500    | Error interno del servidor                     |

---

## Requisitos previos

- [Docker](https://www.docker.com/) instalado
- [Docker Compose](https://docs.docker.com/compose/) disponible (incluido en Docker Desktop)

---

## Instalación y ejecución

```bash
git clone git@github.com:DeividArriaza/job-simulator.git
cd job-simulator
docker compose up --build
```

La API estará disponible en `http://localhost:8080` y la base de datos se inicializa automáticamente con 5 registros de ejemplo.

Para detener los servicios:

```bash
docker compose down
```

Para eliminar también los datos persistidos:

```bash
docker compose down -v
```

---

## Variables de entorno

Las variables se configuran dentro del `docker-compose.yml`. El archivo `.env.example` documenta las variables necesarias:

| Variable     | Descripción                      |
|-------------|----------------------------------|
| DB_HOST     | Host de la base de datos         |
| DB_PORT     | Puerto de PostgreSQL             |
| DB_NAME     | Nombre de la base de datos       |
| DB_USER     | Usuario de PostgreSQL            |
| DB_PASSWORD | Contraseña de PostgreSQL         |
| APP_PORT    | Puerto interno de la aplicación  |

---

## Ejemplos de uso con curl

### Crear un registro

```bash
curl -X POST http://localhost:8080/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "campo1": "Desarrollador Backend",
    "campo2": "TechCorp",
    "campo3": "Ciudad de México",
    "campo4": 45000,
    "campo5": 4.5,
    "campo6": true
  }'
```

### Listar todos

```bash
curl http://localhost:8080/jobs
```

### Obtener uno

```bash
curl http://localhost:8080/jobs/1
```

### Actualizar completo

```bash
curl -X PUT http://localhost:8080/jobs/1 \
  -H "Content-Type: application/json" \
  -d '{
    "campo1": "Desarrollador Senior",
    "campo2": "TechCorp",
    "campo3": "Remoto",
    "campo4": 70000,
    "campo5": 4.9,
    "campo6": true
  }'
```

### Actualización parcial

```bash
curl -X PATCH http://localhost:8080/jobs/1 \
  -H "Content-Type: application/json" \
  -d '{"campo4": 80000}'
```

### Eliminar

```bash
curl -X DELETE http://localhost:8080/jobs/1
```

---

## Nivel de entrega

**Nivel 3 — Senior**

Cumple con todos los requisitos:

- CRUD completo con validaciones estrictas de tipos
- PostgreSQL en contenedor separado con script de inicialización automático
- Endpoint PATCH para actualizaciones parciales
- Variables de entorno sin credenciales hardcodeadas en el código
- `.env.example` documentado y `.gitignore` configurado
- Estructura de proyecto con separación de responsabilidades (config, rutas, entrada)
- Historial de commits incremental
- Sistema completo levanta con `docker compose up --build`
