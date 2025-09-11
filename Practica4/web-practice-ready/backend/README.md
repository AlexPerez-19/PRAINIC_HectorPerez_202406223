# Backend - Practica Desarrollo Web (Node + Express + Prisma + MySQL)
## Requisitos
- Node 18+
- MySQL server accesible
- Crear una base de datos y poner el DATABASE_URL en `.env`

## Scripts
- `npm install` para instalar dependencias
- `npm run prisma:generate` para generar el cliente Prisma
- `npm run prisma:migrate` para ejecutar migraciones (requiere MySQL)
- `npm run seed` para poblar cursos y profesores de ejemplo
- `npm start` para arrancar el servidor

## Endpoints principales (ver Manual Técnico en el repo)
- `POST /auth/register` — registro
- `POST /auth/login` — login
- `POST /auth/forgot` — request reset
- `POST /auth/reset` — reset password
- `GET /posts` — listar posts (filtros: courseId, professorId, q)
- `POST /posts` — crear post (autenticado)
- `GET /posts/:id` — detalle
- `POST /posts/:id/comments` — comentar (autenticado)
- `GET /users/:registro` — ver perfil
- `PUT /users/:registro` — editar perfil (solo dueño)
- `POST /users/:registro/courses` — agregar curso aprobado (solo dueño)
