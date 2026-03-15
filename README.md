# Posts System  Frontend Angular

Sistema de gestion de posts y comentarios construido con Angular 21, Tailwind CSS v3 e Ionic Capacitor.

## Stack

| Tecnologia | Version |
|---|---
| Angular | 21 (standalone, signals) |
| Tailwind CSS | v3 (CSS-first, @theme) |
| Ionic Capacitor | Latest |
| RxJS | 7.8 |

## Requisitos

- Node.js 18+
- API backend corriendo en http://localhost:4202/v1 (ver PostsAPI/)

## Instalacion y ejecucion

npm install
npm start
# http://localhost:4200

## Compilacion produccion

npm run build

## Estructura

src/app/
  core/       - Interceptors, guards, services (JWT, Auth, Error)
  shared/     - Componentes reutilizables (Button, Input, Avatar, Toast, Pagination...)
  layout/     - Header + Footer
  features/
    auth/     - Login + Register
    posts/    - PostList, PostDetail, PostForm, Comments

## Funcionalidades

- Autenticacion JWT (login / registro / logout automatico al expirar)
- CRUD de posts con busqueda, paginacion (10/25/50/100) y filtros
- CRUD de comentarios estilo Facebook con paginacion
- Timestamps relativos y tooltip de fecha exacta en edicion
- Loading overlay global en cada request HTTP
- Toasts de exito/error
- Rutas protegidas con AuthGuard
- Lazy loading en todas las rutas
- Disenio responsive: mobile / tablet / desktop
- Integracion Capacitor para compilar a Android/iOS

---

Prueba tecnica Albatros - por Alvaro Javier Reyes Maradiaga
