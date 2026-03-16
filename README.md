# Posts System — Frontend Angular

SPA construida con **Angular 21**, **Tailwind CSS v3** y **Capacitor** para crear, leer, editar y eliminar posts y comentarios. También puede compilarse como aplicación nativa Android mediante Capacitor.

---

## Tabla de contenidos

1. [Stack tecnológico](#1-stack-tecnológico)
2. [Requisitos previos](#2-requisitos-previos)
3. [Instalación y ejecución](#3-instalación-y-ejecución)
4. [Scripts disponibles](#4-scripts-disponibles)
5. [Variables de entorno](#5-variables-de-entorno)
6. [Arquitectura general](#6-arquitectura-general)
7. [Estructura de carpetas](#7-estructura-de-carpetas)
8. [Bootstrap de la aplicación](#8-bootstrap-de-la-aplicación)
9. [Enrutamiento](#9-enrutamiento)
10. [Capa Core](#10-capa-core)
    - [Modelos](#101-modelos)
    - [Servicios](#102-servicios)
    - [Guards](#103-guards)
    - [Interceptores](#104-interceptores)
    - [Utilidades](#105-utilidades)
11. [Feature: Auth](#11-feature-auth)
12. [Feature: Posts](#12-feature-posts)
    - [Servicios de dominio](#121-servicios-de-dominio)
    - [Páginas](#122-páginas)
    - [Componentes internos](#123-componentes-internos)
13. [Layout](#13-layout)
14. [Capa Shared](#14-capa-shared)
    - [Componentes](#141-componentes)
    - [Directivas](#142-directivas)
    - [Pipes](#143-pipes)
15. [Flujos principales](#15-flujos-principales)
16. [Testing](#16-testing)
17. [Build Android con Capacitor](#17-build-android-con-capacitor)
18. [Decisiones de diseño](#18-decisiones-de-diseño)

---

## 1. Stack tecnológico

| Tecnología | Versión | Rol |
|---|---|---|
| Angular | 21 | Framework principal (Standalone + Signals) |
| TypeScript | ~5.9 | Lenguaje |
| RxJS | ~7.8 | Programación reactiva (HTTP, búsqueda debounced) |
| Tailwind CSS | ^3.4 | Estilos utilitarios con sistema de tokens personalizado |
| ngx-sonner | ^3.1 | Toasts/notificaciones tipo Sonner |
| Capacitor | 8.2 | Empaquetado nativo Android/iOS |
| Vitest | ^4.0 | Runner de pruebas unitarias (integrado en Angular 21) |

---

## 2. Requisitos previos

- **Node.js 18+** y **npm 9+**
- API backend corriendo en `http://localhost:3000/v1` (ver repositorio `PostsAPI/`)
- (Opcional) Android Studio para compilar la app nativa

---

## 3. Instalación y ejecución

```bash
# Instalar dependencias
npm install

# Generar environment.ts desde .env (si no existe)
npm run config

# Servidor de desarrollo en http://localhost:4200
npm start
```

---

## 4. Scripts disponibles

| Script | Comando | Descripción |
|---|---|---|
| `start` | `ng serve` | Servidor de desarrollo con hot reload |
| `build` | `ng build` | Build de desarrollo |
| `build-prod` | `ng build --configuration production --aot --output-hashing=all` | Build optimizado para producción |
| `build-android` | `copy-icon → capacitor-assets → build-prod → cap sync → cap open android` | Build completo + abre Android Studio |
| `watch` | `ng build --watch --configuration development` | Build continuo para desarrollo |
| `test` | `ng test --coverage` | Pruebas unitarias con reporte de cobertura |
| `config` | `node scripts/set-env.js` | Genera `src/environments/environment.ts` desde variables `.env` |

---

## 5. Variables de entorno

El script `scripts/set-env.js` lee un archivo `.env` en la raíz y genera `src/environments/environment.ts`:

```env
API_URL=http://localhost:3000/v1
```

Esto produce:

```ts
// src/environments/environment.ts
export const environment = {
  apiUrl: 'http://localhost:3000/v1',
};
```


---

## 6. Arquitectura general

La aplicación sigue una **arquitectura en capas** basada en el patrón **Feature-Core-Shared** de Angular:

```
App Bootstrap (app.config.ts)
    │
    ├── Router (lazy routes)
    │       ├── /login, /register  ── Feature: Auth
    │       └── /posts/**          ── Feature: Posts
    │
    ├── Core Layer
    │       ├── AuthService, JwtService, ErrorService
    │       ├── authGuard, guestGuard
    │       └── authInterceptor
    │
    ├── Shared Layer
    │       ├── Componentes UI reutilizables
    │       ├── TooltipDirective
    │       └── InitialsPipe
    │
    └── Layout
            ├── HeaderComponent
            └── FooterComponent
```

- **Solo componentes standalone** — no hay `NgModule`.
- **Signals** para estado local; **RxJS** para streams HTTP y búsqueda debounced.
- **OnPush** en todos los componentes para máximo rendimiento.
- Todo el código de plantillas usa **control flow nativo** (`@if`, `@for`, `@switch`).

---

## 7. Estructura de carpetas

```
src/
├── app/
│   ├── app.config.ts          # Bootstrap providers
│   ├── app.html               # Shell template (router-outlet + layout)
│   ├── app.routes.ts          # Tabla de rutas raíz
│   │
│   ├── core/
│   │   ├── guards/
│   │   │   ├── auth.guard.ts       # Protege rutas autenticadas
│   │   │   └── guest.guard.ts      # Protege rutas de invitado
│   │   ├── interceptors/
│   │   │   └── auth.interceptor.ts # JWT + Loading + Error handling
│   │   ├── models/
│   │   │   ├── api-response.model.ts
│   │   │   ├── post.model.ts
│   │   │   ├── comment.model.ts
│   │   │   ├── user.model.ts
│   │   │   └── jwt-claims.model.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── jwt.service.ts
│   │   │   └── error.service.ts
│   │   └── utils/
│   │       └── date.utils.ts
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   └── register/
│   │   └── posts/
│   │       ├── components/
│   │       │   ├── post-card/
│   │       │   └── comment-form/
│   │       ├── pages/
│   │       │   ├── post-list/
│   │       │   ├── post-detail/
│   │       │   └── post-form/
│   │       └── services/
│   │           ├── posts.service.ts
│   │           └── comments.service.ts
│   │
│   ├── layout/
│   │   ├── header/
│   │   └── footer/
│   │
│   └── shared/
│       ├── components/
│       │   ├── avatar/
│       │   ├── button/
│       │   ├── confirm-dialog/
│       │   ├── empty-state/
│       │   ├── input/
│       │   ├── textarea/
│       │   ├── loading/
│       │   └── pagination/
│       ├── directives/
│       │   └── tooltip.directive.ts
│       └── pipes/
│           └── initials.pipe.ts
│
├── environments/
│   └── environment.ts
└── styles.scss
```

```
testing/                 # Todos los specs (espeja src/app/)
├── app.spec.ts
├── app.routes.spec.ts
├── core/
├── features/
├── layout/
└── shared/
```

---

## 8. Bootstrap de la aplicación

`src/app/app.config.ts` define los providers globales:

```ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor])),
  ]
};
```

| Provider | Efecto |
|---|---|
| `provideBrowserGlobalErrorListeners()` | Escucha errores no capturados del navegador |
| `provideRouter(..., withComponentInputBinding())` | Activa el enrutador; `withComponentInputBinding` inyecta params de ruta directamente como `input()` signals en los componentes |
| `provideHttpClient(withInterceptors([authInterceptor]))` | HTTP client funcional con el interceptor de autenticación en pipeline |

---

## 9. Enrutamiento

Todas las rutas usan **lazy loading** con `loadComponent`. El router mapea parámetros de ruta a `input()` signals del componente gracias a `withComponentInputBinding`.

| Path | Guard | Componente cargado |
|---|---|---|
| `/` | — | Redirige a `/posts` |
| `/login` | `guestGuard` | `LoginComponent` |
| `/register` | `guestGuard` | `RegisterComponent` |
| `/posts` | `authGuard` | `PostListComponent` |
| `/posts/new` | `authGuard` | `PostFormComponent` |
| `/posts/:id/edit` | `authGuard` | `PostFormComponent` |
| `/posts/:id` | `authGuard` | `PostDetailComponent` |
| `**` | — | Redirige a `/posts` |

- Las rutas `/posts/**` están protegidas: si el token JWT ha expirado o no existe, `authGuard` redirige a `/login` guardando la URL original en `returnUrl`.
- Las rutas `/login` y `/register` están protegidas por `guestGuard`: si el usuario ya está autenticado, redirige a `/posts`.

---

## 10. Capa Core

### 10.1 Modelos

Tipos TypeScript que modelan los recursos de la API.

#### `ApiResponse<T>` / `PaginatedResponse<T>`

```ts
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}
```

#### `Post`

```ts
interface Post {
  _id: string;
  title: string;
  body: string;
  author: string;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}
```

#### `Comment`

```ts
interface Comment {
  _id: string;
  postId: string;
  body: string;
  name: string;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}
```

#### `User` / `AuthResponse`

```ts
interface User         { _id: string; name: string; email: string; role?: string; }
interface AuthResponse { access_token: string; user?: User; }
```

#### `JwtClaims`

```ts
interface JwtClaims {
  sub: string;
  name: string;
  email: string;
  role?: string;
  iat: number;
  exp: number;  // epoch en segundos
}
```

---

### 10.2 Servicios

#### `JwtService` (`providedIn: 'root'`)

Capa de bajo nivel para manipular el token JWT en `localStorage` (clave `'auth_token'`).

| Método | Descripción |
|---|---|
| `setToken(token)` | Persiste el token en `localStorage` |
| `getToken()` | Recupera el token; `null` si no existe |
| `removeToken()` | Elimina el token |
| `decodeClaims(token)` | Decodifica el segmento de payload (Base64url) sin librería externa; retorna `JwtClaims \| null` |
| `getCurrentClaims()` | `getToken()` → `decodeClaims()` |
| `isTokenValid()` | Verifica que `claims.exp * 1000 > Date.now()` |

> El token **nunca se valida criptográficamente en el cliente**; la autorización real recae en el backend.

---

#### `AuthService` (`providedIn: 'root'`)

Orquesta el flujo de autenticación apoyándose en `JwtService`, `HttpClient` y `Router`.

| Método | Descripción |
|---|---|
| `login(email, password)` | `POST /auth/login` → guarda token → retorna `Observable<ApiResponse<AuthResponse>>` |
| `register(name, email, password)` | `POST /users` → guarda token → retorna `Observable<ApiResponse<AuthResponse>>` |
| `logout()` | `removeToken()` + `router.navigate(['/login'])` |
| `isLoggedIn()` | Delega a `JwtService.isTokenValid()` |
| `getCurrentClaims()` | Delega a `JwtService.getCurrentClaims()` |

---

#### `ErrorService` (`providedIn: 'root'`)

Centraliza el manejo de errores HTTP. Usa un patrón de **callback registrado** (`registerToast`) para evitar inyección circular con `ToastService`.

| Método | Descripción |
|---|---|
| `registerToast(cb)` | Recibe una función `(msg, type) => void` que el componente raíz registra al inicio |
| `handle(err: HttpErrorResponse)` | Registra el error completo en consola y dispara el toast con el mensaje mapeado |
| `mapError(err)` | Traduce códigos HTTP a mensajes en español: 400 → `"Datos inválidos"`, 401 → `"No autorizado"`, 403 → `"Sin permisos"`, 404 → `"No encontrado"`, 409 → `"Ya existe"`, 429 → `"Demasiadas solicitudes"`, 500 → `"Error del servidor"` |

---

### 10.3 Guards

#### `authGuard` (funcional `CanActivateFn`)

```
¿isLoggedIn()?
  Sí → permite navegación
  No → router.navigate(['/login'], { queryParams: { returnUrl: state.url } }) → false
```

#### `guestGuard` (funcional `CanActivateFn`)

```
¿isLoggedIn()?
  Sí → router.navigate(['/posts']) → false
  No → permite navegación
```

---

### 10.4 Interceptores

#### `authInterceptor` (`HttpInterceptorFn`)

Se registra globalmente en `app.config.ts`. Para cada request HTTP:

1. **Encabezado ngrok**: añade `ngrok-skip-browser-warning: true` (compatibilidad en desarrollo con túneles ngrok).
2. **Token JWT**: si existe un token válido, añade `Authorization: Bearer <token>`.
3. **Loading overlay**: llama `LoadingService.isLoading = true` antes de pasar el request; `false` en el operador `finalize` (siempre, incluso si hay error).
4. **401 automático**: si el servidor devuelve 401, llama `authService.logout()` (limpia token + redirige a `/login`).
5. **Otros errores**: delega a `errorService.handle(err)` que muestra el toast correspondiente.

---

### 10.5 Utilidades

#### `date.utils.ts`

| Función | Descripción |
|---|---|
| `formatDate(dateStr)` | Fecha absoluta formateada en locale `es-HN` con hora. Ejemplo: `"5 mar. 2026, 14:30"` |
| `relativeDate(dateStr)` | Tiempo relativo en español. Ejemplos: `"Ahora"` (< 1 min), `"hace 3 min"`, `"hace 2 h"`, `"hace 4 días"`, `"hace 2 semanas"`. Después de 5 semanas usa `formatDate`. |

---

## 11. Feature: Auth

### `LoginComponent`

- Formulario reactivo con dos campos: `email` (required + formato email) y `password` (required + minLength 6).
- Signals: `loading` (deshabilita el botón y muestra spinner), `errorMsg` (para errores del servidor).
- On submit → `authService.login()` → toast de éxito → `router.navigate(['/posts'])`.
- Ruta protegida por `guestGuard`: el usuario autenticado no puede volver a esta vista.

### `RegisterComponent`

- Formulario reactivo con tres campos: `name` (required + minLength 2), `email`, `password` (minLength 6).
- Lógica idéntica al login; on submit → `authService.register()` → toast → `/posts`.
- Comparte los mismos componentes UI (`AppButtonComponent`, `AppInputComponent`).

---

## 12. Feature: Posts

### 12.1 Servicios de dominio

#### `PostsService` (`providedIn: 'root'`)

URL base: `${environment.apiUrl}/posts`

| Método | HTTP | Endpoint | Notas |
|---|---|---|---|
| `getAll(query)` | GET | `/posts/paginated` | Params: `page`, `limit`, `search`, `userId`. Retry ×2 con backoff exponencial |
| `getById(id)` | GET | `/posts/:id` | — |
| `create(dto)` | POST | `/posts` | Body: `{ title, body, author }` |
| `update(id, dto)` | PUT | `/posts/:id` | Partial DTO. Retry ×2 con backoff |
| `delete(id)` | DELETE | `/posts/:id` | — |
| `deleteBulk(ids)` | DELETE | `/posts/bulk` | Body: `{ ids: string[] }` |

#### `CommentsService` (`providedIn: 'root'`)

URL base: `${environment.apiUrl}/comments`

| Método | HTTP | Endpoint | Notas |
|---|---|---|---|
| `getByPost(query)` | GET | `/comments/paginated` | Param `postId`. Retry ×2 |
| `create(dto)` | POST | `/comments` | Body: `{ postId, body }` |
| `update(id, body)` | PUT | `/comments/:id` | Retry ×2 |
| `delete(id)` | DELETE | `/comments/:id` | — |

---

### 12.2 Páginas

#### `PostListComponent` (`/posts`)

Página principal del listado de posts. Implementa:

- **Búsqueda en tiempo real**: `Subject<string>` → `debounceTime(300)` → `distinctUntilChanged` → `switchMap` hacia `postsService.getAll()`. Cancela automáticamente peticiones anteriores.
- **Filtro "Mis posts"**: alterna entre todos los posts y los del usuario actual (`userId` del JWT).
- **Paginación**: `AppPaginationComponent` con opciones de tamaño 10 / 25 / 50 / 100.
- **Selección múltiple**: checkboxes en las cards del usuario actual; acumula IDs seleccionados en un `Set<string>`.
- **Eliminación masiva**: llama `postsService.deleteBulk(ids)` previa confirmación en modal; muestra el listado de títulos a eliminar.
- **Skeleton loading**: 8 tarjetas placeholder animadas durante la carga inicial o al cambiar de página.
- **Grid responsivo**: 1 columna (móvil) → 2 (sm) → 3 (md) → 4 (xl).

##### Estado (signals)

| Signal | Tipo | Descripción |
|---|---|---|
| `posts` | `Post[]` | Posts de la página actual |
| `search` | `string` | Texto de búsqueda |
| `page` | `number` | Página actual |
| `pageSize` | `number` | Registros por página |
| `total` | `number` | Total de registros (para paginación) |
| `loading` | `boolean` | Skeleton visible |
| `filterMode` | `'all' \| 'own'` | Filtro activo |
| `selectedIds` | `Set<string>` | Posts seleccionados para bulk delete |
| `bulkDeleting` | `boolean` | Spinner en botón de eliminar masivo |

---

#### `PostDetailComponent` (`/posts/:id`)

Vista completa de un post con su sección de comentarios.

- Recibe `id` como `input()` (inyectado desde el param de ruta via `withComponentInputBinding`).
- Carga el post y los comentarios en paralelo en `ngOnInit`.
- **Sección post**: muestra avatar generativo, título, autor, timestamps relativos, cuerpo del post. Botones Editar/Eliminar visibles solo al propietario.
- **Confirmación de borrado**: modal `AppConfirmDialogComponent` antes de eliminar.
- **Sección comentarios**:
  - Formulario de nuevo comentario (`CommentFormComponent`) en la parte superior.
  - Lista paginada de comentarios con edición inline (textarea + botones Guardar/Cancelar).
  - Indicador `✏️` con tooltip de fecha exacta para comentarios editados (`updatedAt !== createdAt`).
  - Botón "Eliminar" visible solo al propietario del comentario.

---

#### `PostFormComponent` (`/posts/new` y `/posts/:id/edit`)

Formulario dual para **crear** y **editar** posts.

- `isEditMode = computed(() => !!this.id())` — determina el modo según la presencia del `id` input.
- **Modo creación**: `author` se rellena automáticamente con el nombre del JWT (read-only).
- **Modo edición**: fetches el post actual, parchea el formulario; skeleton durante la carga.
- Validaciones: `title` (required, minLength 3), `body` (required, minLength 10).
- On submit: crea o actualiza → navega a `/posts/:id`.

---

### 12.3 Componentes internos

#### `PostCardComponent`

Tarjeta de visualización de un post.

| Input | Tipo | Descripción |
|---|---|---|
| `post` | `Post` (required) | Datos del post |
| `currentUserId` | `string \| undefined` | ID del usuario logueado |
| `deleting` | `boolean` | Muestra spinner de eliminación |
| `selectable` | `boolean` | Habilita el checkbox de selección |
| `selected` | `boolean` | Estado del checkbox |

| Output | Descripción |
|---|---|
| `deleteRequested` | Emite el `_id` cuando el usuario confirma eliminación |
| `editRequested` | Emite el `_id` para navegar a la edición |
| `selectionToggled` | Emite el `_id` al marcar/desmarcar el checkbox |

- `isOwner = computed(() => currentUserId === post.userId)` — controla visibilidad de acciones.
- El título usa `AppTooltipDirective` para mostrar el texto completo en hover cuando está truncado.
- El cuerpo muestra un recorte de 2 líneas con `line-clamp-2`.

---

#### `CommentFormComponent`

Formulario colapsable para añadir un nuevo comentario.

- **Inputs**: `authorName` (muestra el nombre del autor), `submitting` (deshabilita mientras envía).
- **Output**: `submitted` — emite el texto del comentario al padre.
- El textarea arranca en una sola fila y se expande al hacer foco; muestra botones Enviar/Cancelar.
- `Enter` envía el formulario; `Shift+Enter` inserta salto de línea.
- Método público `reset()` que el padre llama tras guardar exitosamente para limpiar y colapsar el formulario.
- Validación mínima de 5 caracteres mostrada inline.

---

## 13. Layout

### `HeaderComponent`

- Barra fija en la parte superior (`sticky top-0`) con `z-50`.
- Adapta padding para el notch de móviles (`env(safe-area-inset-top)`).
- Si hay sesión activa: muestra `AppAvatarComponent` con las iniciales del usuario, nombre (oculto en móvil < sm) y botón "Cerrar sesión".
- `claims = computed(() => authService.getCurrentClaims())` — reactivo a cambios de sesión.

### `FooterComponent`

- Footer estático con créditos: *Albatros — Prueba Técnica · por Alvaro Javier Reyes Maradiaga*.
- Respeta `env(safe-area-inset-bottom)` para la barra home de iOS.

---

## 14. Capa Shared

### 14.1 Componentes

#### `AppAvatarComponent`

Genera un avatar circular con iniciales y color determinístico.

| Input | Tipo | Default | Descripción |
|---|---|---|---|
| `name` | `string` (required) | — | Nombre completo del usuario |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamaño del círculo |

- Color seleccionado de una paleta de 5 colores usando un hash de la cadena `name` → siempre el mismo color para el mismo nombre.
- Iniciales via `InitialsPipe`: 1 palabra → 2 primeros chars; 2+ palabras → primera letra del primero y primero del último.
- Tamaños: `sm` = 28 px · `md` = 36 px · `lg` = 48 px.

---

#### `AppButtonComponent`

Botón estilizado reutilizable.

| Input | Tipo | Default |
|---|---|---|
| `variant` | `'primary' \| 'secondary' \| 'danger' \| 'ghost'` | `'primary'` |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` |
| `loading` | `boolean` | `false` |
| `disabled` | `boolean` | `false` |
| `fullWidth` | `boolean` | `false` |

- Muestra un spinner SVG animado cuando `loading = true`.
- Se deshabilita automáticamente cuando `loading || disabled`.
- Contenido proyectado via `<ng-content />`.

---

#### `AppConfirmDialogComponent`

Modal de confirmación genérico.

| Input | Descripción |
|---|---|
| `visible` | Controla visibilidad |
| `title` | Título del diálogo |
| `message` | Mensaje descriptivo (admite HTML con `innerHTML`) |
| `confirmLabel` | Texto del botón de confirmación |
| `loading` | Muestra spinner en el botón de confirmación |

| Output | Descripción |
|---|---|
| `confirmed` | Usuario confirmó la acción |
| `cancelled` | Usuario canceló o hizo click fuera |

- Overlay fijo a pantalla completa (`z-9998`); clic fuera del card → emite `cancelled`.
- Animaciones CSS: overlay `fade-in`, card `slide-up`.

---

#### `AppEmptyStateComponent`

Pantalla de estado vacío.

| Input | Default | Descripción |
|---|---|---|
| `icon` | `'📭'` | Emoji ilustrativo |
| `title` | — | Título principal |
| `description` | — | Texto secundario |

- `<ng-content />` para slot de acción (ej. botón "Crear primer post").

---

#### `AppInputComponent`

Input de formulario accesible con soporte `ControlValueAccessor`.

| Input | Descripción |
|---|---|
| `label` | Label visible sobre el campo |
| `type` | Tipo HTML del input |
| `placeholder` | Placeholder |
| `prefix` | Texto/icono a la izquierda dentro del campo |
| `maxLength` | Límite de caracteres |
| `error` | Mensaje de error (activa borde rojo) |
| `required` | Añade indicador visual `*` |
| `inputId` | ID del input (auto-generado si no se provee) |

- Compatible con `formControlName`, `ngModel` y two-way binding.
- Si hay `prefix`, el padding-left del input se ajusta automáticamente.

---

#### `AppTextareaComponent`

Área de texto con soporte `ControlValueAccessor`, contador de caracteres y redimensionamiento.

- Acepta los mismos inputs que `AppInputComponent` más `rows` (default 4).
- Muestra `"X / maxLength"` cuando `maxLength > 0`.
- `resize-y` habilitado por defecto.

---

#### `AppLoadingComponent` + `LoadingService`

**`LoadingService`**: estado global de carga.
- `BehaviorSubject<boolean>` expuesto como `isLoading$`.
- El `authInterceptor` llama `isLoading = true` antes de cada request y `false` en `finalize`.

**`AppLoadingComponent`**: overlay de pantalla completa.
- `isLoading$ | async` controla la visibilidad.
- Anillo de carga animado centrado (`z-9999`).
- Bloqueante: evita interacción con la UI mientras hay peticiones en vuelo.

---

#### `AppPaginationComponent`

Paginación inteligente con ellipsis.

| Input | Tipo | Descripción |
|---|---|---|
| `page` | `number` (required) | Página actual (1-based) |
| `pageSize` | `number` (required) | Registros por página |
| `total` | `number` (required) | Total de registros |
| `itemLabel` | `string` | Nombre del recurso (ej. `"posts"`) |
| `pageSizeOptions` | `number[]` | Opciones de tamaño (default `[10, 25, 50, 100]`) |

| Output | Descripción |
|---|---|
| `pageChange` | Emite el nuevo número de página |
| `pageSizeChange` | Emite el nuevo tamaño de página |

- Muestra `"Mostrando X-Y de Z elementos"`.
- Calcula rango de botones visibles con ellipsis para conjuntos grandes de páginas; siempre muestra primera y última.

---

### 14.2 Directivas

#### `AppTooltipDirective`

Selector: `[appTooltip]`

- Crea un `<div>` con `position: fixed` appended a `document.body` al hacer `mouseenter` (escritorio) o `touchstart` (móvil).
- Se posiciona inteligentemente cerca del elemento trigger.
- Se elimina en `mouseleave`; en touch, desaparece tras 3 segundos.
- El texto del tooltip se corta a 300 caracteres; ancho máximo 280 px.

---

### 14.3 Pipes

#### `InitialsPipe`

Nombre del pipe: `initials`

| Entrada | Salida |
|---|---|
| `"Ana"` | `"AN"` |
| `"María García"` | `"MG"` |
| `"Juan Carlos López"` | `"JL"` |
| `""` / `null` | `"??"` |

---

## 15. Flujos principales

### Autenticación completa

```
Usuario abre /posts
  → authGuard: isLoggedIn()? No
  → router.navigate(['/login'], { returnUrl: '/posts' })
  → LoginComponent: usuario rellena email + password
  → AuthService.login(email, password)
  → authInterceptor adjunta headers; LoadingService.isLoading = true
  → API POST /auth/login → 200 OK { access_token }
  → JwtService.setToken(access_token)
  → LoadingService.isLoading = false
  → Toast "Sesión iniciada"
  → router.navigate(['/posts'])
  → authGuard: isLoggedIn()? Sí → PostListComponent
```

### Búsqueda de posts debounced

```
Usuario escribe en el input de búsqueda
  → PostListComponent: searchSubject.next(value)
  → debounceTime(300ms) — espera silencio del teclado
  → distinctUntilChanged — evita request si el texto no cambió
  → switchMap → postsService.getAll({ search, page: 1, limit })
  → authInterceptor: Bearer token + Loading overlay
  → API GET /posts/paginated?search=X — retorna página 1
  → posts.set(response.data.data)
  → total.set(response.data.pagination.total)
  → Renderiza grid con resultados o <AppEmptyState>
```

### Creación de un post

```
Usuario navega a /posts/new
  → authGuard: OK
  → PostFormComponent: isEditMode = false
  → author se rellena con claims.name (read-only)
  → Usuario completa title + body y envía
  → postsService.create({ title, body, author })
  → API POST /posts → 201 Created { _id, title, ... }
  → Toast "Post creado"
  → router.navigate(['/posts', nuevaId])
```

### Eliminación masiva de posts

```
Usuario activa "Mis posts"
  → filterMode = 'own' → getAll({ userId: currentUserId })
  → Posts del usuario muestran checkboxes
  → Usuario selecciona 3 posts
  → Clic "Eliminar seleccionados"
  → AppConfirmDialogComponent muestra lista de títulos
  → Usuario confirma
  → postsService.deleteBulk(selectedIds)
  → API DELETE /posts/bulk { ids: [...] }
  → selectedIds.clear() → recarga listado → Toast "Posts eliminados"
```

### Expiración de sesión

```
Token expirado → usuario hace cualquier acción HTTP
  → authInterceptor recibe HttpErrorResponse 401
  → authService.logout()
    → JwtService.removeToken()
    → router.navigate(['/login'])
  → Regresa a pantalla de login
```

---

## 16. Testing

### Configuración

- Runner: **Vitest v4** integrado en `@angular/build:unit-test` (Angular 21 nativo).
- Entorno: `jsdom 28`.
- Cobertura: `ng test --coverage` genera reporte en `coverage/`.

### Estructura

Los specs viven en `testing/` en la raíz del workspace, espejando `src/app/`:

```
testing/
├── app.spec.ts
├── app.routes.spec.ts
├── core/
│   ├── guards/
│   ├── interceptors/
│   ├── services/
│   └── utils/
├── features/
│   ├── auth/
│   └── posts/
├── layout/
└── shared/
```

### Ejecutar tests

```bash
# Modo watch con coverage
npm test

# Una sola pasada
npx ng test --watch=false --coverage
```

### Notas importantes

- `NgxSonnerToaster` usa `window.matchMedia` → mockear en `beforeAll` para specs del componente raíz.
- Los specs de `PostDetailComponent` que prueban el `CommentFormComponent` deben usar `viewChild` directamente.
- Evitar `NG0100` (ExpressionChangedAfterChecked): usar `signal()` en los `HostComponent` fixtures de prueba en lugar de propiedades planas.

---

## 17. Build Android con Capacitor

```bash
# Build completo → genera APK depurable
npm run build-android
```

Lo que hace el script internamente:

1. `copy-android-icon` — copia el ícono a `android/app/src/main/res/`.
2. `npx capacitor-assets generate` — genera los splash screens e íconos en todas las densidades.
3. `ng build --configuration production --aot --output-hashing=all` — build optimizado.
4. `npx cap sync android` — sincroniza el build web con el proyecto Android.
5. `npx cap open android` — abre Android Studio.

Configuración de Capacitor (`capacitor.config.json`):

```json
{
  "appId": "com.albatros.posts",
  "appName": "Posts System",
  "webDir": "dist/posts-web-app/browser"
}
```



*Prueba técnica Albatros — por Alvaro Javier Reyes Maradiaga*
