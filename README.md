# 🏠 Home Hub

App para gestionar tu hogar en familia: tareas del hogar (con asignación o
tareas abiertas para que cualquiera las tome), categorías personalizables,
progreso individual, ranking, logros, notificaciones, recomendaciones, y
cuentas/gastos compartidos con división de facturas.

Funciona en **web, iOS y Android** desde el mismo código, gracias a
[Expo](https://expo.dev). El backend es [Supabase](https://supabase.com)
(Postgres + Auth + Realtime + Storage).

> **Estado actual: cimientos del proyecto.** La app corre de verdad (puedes
> navegar por todas las pantallas) pero todavía usa **datos de ejemplo**
> (`src/data/mock.ts`), no datos reales de Supabase. Los botones de
> "Guardar" / "Crear" / "Confirmar" todavía no escriben en la base de datos.
> Ver [¿Qué falta?](#qué-falta-siguientes-pasos) más abajo.

---

## Requisitos

- [Node.js](https://nodejs.org) 20 o superior.
- Una cuenta de [GitHub](https://github.com) (ya la tienes ✅) para guardar
  el código.
- Una cuenta gratuita de [Supabase](https://supabase.com) para el backend.
- Para probar en el teléfono sin cables: la app
  [Expo Go](https://expo.dev/go) (disponible en App Store / Play Store).

No necesitas instalar Android Studio ni Xcode para empezar — con Expo Go en
tu teléfono es suficiente durante el desarrollo.

---

## 1. Instalar y correr el proyecto

```bash
npm install
npx expo start
```

Esto abre una terminal con un código QR:

- **Desde el teléfono:** abre la app Expo Go y escanea el QR (Android) o
  usa la cámara nativa (iPhone).
- **Desde el navegador:** presiona `w` en la terminal para abrir la versión
  web.
- **Emulador Android/iOS:** presiona `a` o `i` (requiere tener Android
  Studio / Xcode instalados).

Deberías ver la pantalla de inicio con tareas, grupo y gastos de ejemplo.

---

## 2. Conectar Supabase (backend real)

Ahora mismo la app funciona sin esto (usa datos de ejemplo). Cuando quieras
que los datos sean reales y se guarden de verdad, sigue estos pasos:

### 2.1. Crear el proyecto en Supabase

1. Entra a [supabase.com](https://supabase.com) y crea una cuenta (puedes
   usar tu cuenta de GitHub para entrar más rápido).
2. Crea un **New Project**. Elige un nombre (ej. `home-hub`), una
   contraseña de base de datos (guárdala en un lugar seguro) y la región
   más cercana a ti.
3. Espera 1-2 minutos mientras se aprovisiona el proyecto.

### 2.2. Ejecutar el esquema de la base de datos

1. En el panel de Supabase, ve a **SQL Editor** (ícono de terminal en el
   menú lateral).
2. Abre el archivo [`supabase/schema.sql`](./supabase/schema.sql) de este
   repositorio, copia **todo** su contenido y pégalo en el editor SQL.
3. Presiona **Run**. Esto crea todas las tablas (perfiles, grupos, tareas,
   categorías, gastos, logros, notificaciones, etc.) junto con las reglas
   de seguridad (Row Level Security) que garantizan que cada familia solo
   vea sus propios datos, incluso si perteneces a más de un grupo.

El archivo `schema.sql` está comentado en español/inglés técnico explicando
qué hace cada tabla, por si quieres revisarlo o modificarlo.

### 2.3. Activar el login por correo

1. Ve a **Authentication → Providers**.
2. Confirma que **Email** esté habilitado (viene activado por defecto).
3. (Opcional) En **Authentication → URL Configuration**, agrega la URL de
   tu app cuando la despliegues, para que los links de confirmación de
   correo funcionen correctamente.

### 2.4. Copiar las llaves del proyecto

1. Ve a **Project Settings → API**.
2. Copia el **Project URL** y la llave **anon public** (⚠️ nunca copies la
   llave `service_role`, esa es secreta y no debe usarse en la app).
3. En la raíz del proyecto, copia el archivo de ejemplo:

   ```bash
   cp .env.example .env
   ```

4. Abre `.env` y pega tus valores:

   ```
   EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=tu-llave-anon-aqui
   ```

5. Reinicia `npx expo start` para que tome las variables nuevas.

El archivo `.env` está en `.gitignore`, así que nunca se sube a GitHub.

### 2.5. (Opcional) Guardar fotos de facturas

Si quieres que las fotos de facturas escaneadas se guarden en Supabase en
vez de solo en el teléfono:

1. Ve a **Storage** y crea un bucket llamado `receipts`.
2. Márcalo como privado (no público) y usa URLs firmadas al mostrarlas en
   la app.

---

## 3. Subir el proyecto a GitHub

Como ya tienes cuenta de GitHub:

```bash
# Crea el repositorio en GitHub primero (desde github.com/new),
# sin inicializarlo con README ni licencia, luego:

git add .
git commit -m "Cimientos del proyecto: estructura, diseño y esquema de datos"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/home-hub.git
git push -u origin main
```

Reemplaza `TU-USUARIO` y el nombre del repositorio por los tuyos.

---

## 4. Exportar a APK (Android)

Cuando quieras generar un instalable `.apk` para tu teléfono (fuera de
Expo Go), la forma recomendada es [EAS Build](https://docs.expo.dev/build/introduction/):

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android --profile preview
```

Esto compila el APK en los servidores de Expo (gratis con límites
mensuales) y te da un link para descargarlo directo al teléfono. Para iOS
el proceso es similar (`--platform ios`) pero requiere una cuenta de
Apple Developer (de pago) para instalar fuera del simulador.

---

## Estructura del proyecto

```
src/
  app/                  Pantallas (expo-router: cada archivo = una ruta)
    (tabs)/             Las 4 pestañas: Inicio, Tareas, Grupo, Gastos
    grupos.tsx           Lista de tus grupos familiares
    nuevo-grupo.tsx       Crear/unirse a un grupo
    nueva-tarea.tsx       Crear una tarea (asignada o abierta)
    categorias.tsx         Categorías del hogar (+ crear nuevas)
    estadisticas.tsx        Gráficos y estadísticas de gastos
    factura/[id].tsx          Detalle de una factura y su división
    notificaciones.tsx          Centro de notificaciones
  components/           Componentes reutilizables (UI + íconos SVG)
  constants/theme.ts    Sistema de diseño: colores, fuentes, espaciados
  data/mock.ts          Datos de ejemplo (todas las pantallas leen de aquí)
  lib/supabase.ts       Cliente de Supabase (lee las variables de entorno)
  types/                 Tipos de TypeScript compartidos
supabase/
  schema.sql            Esquema completo de la base de datos + seguridad
```

**Todas las pantallas leen de `src/data/mock.ts`.** Esto es intencional:
cuando quieras conectar una pantalla a datos reales, solo tienes que
cambiar su import de `mock.ts` por una consulta a `supabase` (definido en
`src/lib/supabase.ts`) — el resto del componente no cambia.

---

## Sistema de diseño

Los colores, tipografías y espaciados viven en un solo archivo:
`src/constants/theme.ts`. Cambiar un color ahí lo actualiza en toda la app.

- **Tipografías:** Outfit (títulos) y Plus Jakarta Sans (texto).
- **Color principal:** coral `#E86545`.
- **Categorías con color propio:** Cocina (ámbar), Limpieza (verde azulado),
  Servicios (azul), Mantenimiento (violeta), Eventos (rosa) — y cualquier
  categoría nueva que crees.

---

## ¿Qué falta? (siguientes pasos)

Esto es la base sobre la que se construye todo lo demás. Con esto ya
puedes navegar la app completa con datos de ejemplo. Lo que sigue,
en orden sugerido:

1. **Autenticación real** — pantallas de login/registro conectadas a
   Supabase Auth (hoy no existen; la app asume que ya "estás dentro").
2. **Conectar cada pantalla a Supabase** — reemplazar los imports de
   `mock.ts` por consultas reales (`supabase.from('tasks').select()`, etc.).
3. **Lógica de formularios** — que "Crear tarea", "Crear grupo", "Unirse a
   grupo" y "Confirmar división" realmente escriban en la base de datos.
4. **Escaneo de facturas** — subir/tomar foto de una factura y extraer los
   valores automáticamente (por ejemplo con OCR vía una Edge Function de
   Supabase, o un servicio de terceros).
5. **Notificaciones push** — usando `expo-notifications` + Supabase para
   avisos de tareas pendientes, logros desbloqueados, etc.
6. **Pulir y probar en dispositivos reales** antes de generar el APK
   final.

---

## Comandos útiles

```bash
npx expo start          # Iniciar el servidor de desarrollo
npx expo start --web    # Abrir directo en el navegador
npx tsc --noEmit         # Verificar tipos de TypeScript
npx expo lint             # Revisar estilo de código
```
