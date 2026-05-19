# Mundial Perú 2026

App de predicciones del Mundial 2026 para jugar entre amigos.

## Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Estilos**: Tailwind CSS + shadcn/ui inspirado
- **Backend/DB**: Supabase (PostgreSQL + Auth + RLS)
- **Deploy**: Vercel (gratis para proyectos personales)

---

## Setup paso a paso

### 1. Clonar y instalar dependencias

```bash
git clone <tu-repo>
cd mundial2026
npm install
```

### 2. Crear proyecto en Supabase

1. Ir a [supabase.com](https://supabase.com) y crear cuenta gratis
2. Crear nuevo proyecto → anotar `URL` y `anon key`
3. Ir a **SQL Editor** y ejecutar todo el contenido de `supabase-schema.sql`

### 3. Variables de entorno

Crear archivo `.env.local` en la raíz:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Correr en desarrollo

```bash
npm run dev
# Abrir http://localhost:3000
```

### 5. Deploy en Vercel

#### Opción A: Vercel CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login y deploy
vercel login
vercel

# Para producción
vercel --prod
```

#### Opción B: GitHub + Vercel Dashboard

1. Subí el código a GitHub
2. Andá a [vercel.com](https://vercel.com) → New Project
3. Importá el repositorio
4. En **Environment Variables** agregá:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click en **Deploy**

#### Configurar dominio personalizado (opcional)

En Vercel Dashboard → Project → Settings → Domains → Add Domain

---

## Estructura del proyecto

```
src/
├── app/
│   ├── auth/
│   │   ├── login/page.tsx          # Login
│   │   ├── register/page.tsx       # Registro
│   │   ├── logout/route.ts         # API de logout
│   │   └── actions.ts              # Server actions de auth
│   ├── dashboard/
│   │   ├── layout.tsx              # Layout con navbar
│   │   ├── grupos/page.tsx         # Vista de grupos
│   │   ├── fixture/page.tsx        # Fixture + predicciones
│   │   ├── predicciones/page.tsx   # Mis predicciones
│   │   ├── bracket/
│   │   │   ├── page.tsx            # Bracket eliminatorio
│   │   │   └── bracket-client.tsx  # UI interactiva del bracket
│   │   ├── tabla/page.tsx          # Leaderboard
│   │   └── actions.ts              # Server actions de predicciones
│   └── admin/
│       ├── layout.tsx              # Layout admin protegido
│       ├── page.tsx                # Dashboard admin
│       ├── partidos/page.tsx       # Cargar resultados
│       ├── equipos/page.tsx        # Gestión equipos
│       ├── usuarios/page.tsx       # Gestión usuarios
│       └── actions.ts              # Server actions admin
├── components/
│   ├── ui/                         # Componentes base (Button, Card, etc.)
│   ├── layout/
│   │   └── navbar.tsx              # Navbar responsive
│   ├── predictions/
│   │   └── prediction-form.tsx     # Formulario de predicción
│   ├── theme-provider.tsx          # Contexto de tema
│   └── theme-toggle.tsx            # Toggle claro/oscuro
├── lib/
│   ├── supabase.ts                 # Cliente Supabase
│   ├── database.types.ts           # Tipos de la BD
│   ├── utils.ts                    # Utilidades (cn)
│   └── seed-data.ts                # Datos de equipos y partidos
└── types/
    └── index.ts                    # Tipos TypeScript
```

---

## Funcionalidades implementadas

### ✅ Auth
- Registro con username, email, password y equipo favorito
- Login con email/password
- Middleware de protección de rutas
- Logout
- Roles: `player` y `admin`

### ✅ Fase de Grupos
- 48 equipos en 12 grupos (A-L)
- 72 partidos de fase de grupos
- Fixture cronológico con sedes
- Seed automático desde panel admin

### ✅ Predicciones
- Predecir ganador/empate, goleador y marcador exacto de cada partido
- Bloqueo automático al iniciar el partido
- Sistema de puntos configurable: 1 pt resultado, 2 pts goleador, 3 pts marcador exacto
- Visualización de predicciones personales

### ✅ Bracket Eliminatorio
- Predicciones para todas las rondas eliminatorias
- Ronda de 32, Octavos, Cuartos, Semis, Tercer Puesto, Final
- Puntos escalonados por ronda

### ✅ Leaderboard
- Ranking automático con vista `leaderboard`
- Puntos totales, acertadas, exactas
- Podio con medallas

### ✅ Panel de Admin
- Cargar resultados de partidos
- Recálculo automático de puntos vía RPC
- Seed de equipos y partidos
- Protección por rol admin

### ✅ UI/UX
- Tema oscuro/claro con toggle
- Navbar responsive con menú mobile
- Toast notifications
- Cards, badges, tablas, modales
- Fuentes personalizadas (Bebas Neue, Barlow Condensed)

---

## Sistema de puntos

### Fase de Grupos
| Predicción | Puntos |
|-----------|--------|
| Acertar ganador / empate | 1 pt |
| Acertar jugador que anota | 2 pts |
| Acertar resultado exacto | 3 pts |

Estos valores pueden modificarse desde el panel de admin.

### Bracket Eliminatorio
| Ronda | Puntos |
|-------|--------|
| Ronda de 32 | 2 pts |
| Octavos de Final | 3 pts |
| Cuartos de Final | 5 pts |
| Semifinales | 8 pts |
| Tercer Puesto | 6 pts |
| Subcampeón | 10 pts |
| Campeón | 15 pts |

---

## Hacer un usuario admin

Después de registrarte, ejecutar en el SQL Editor de Supabase:

```sql
UPDATE public.profiles SET role = 'admin' WHERE username = 'tu_username';
```

---

## Comandos útiles

```bash
# Desarrollo
npm run dev

# Build de producción
npm run build

# Type check
npx tsc --noEmit

# Lint
npm run lint
```

---

## Créditos

Hecho con ❤️ para el Mundial 2026.
