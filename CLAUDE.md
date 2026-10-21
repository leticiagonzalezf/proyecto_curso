# Gestor de Tareas ICE

MVP web de una sola página para crear tareas y priorizarlas con el modelo ICE: impacto, confianza y esfuerzo son enteros de 1 a 10, e ICE = impacto × confianza / esfuerzo. Gemini puede sugerir los tres valores a partir del título y la descripción de la tarea.

Stack: React 18, TypeScript en modo `strict`, Vite y Material UI 6, con `fetch` nativo para Gemini. No hay backend, router ni librería de estado: las tareas viven en memoria y se pierden al recargar.

## Comandos

- `npm install`: instala las dependencias.
- `cp .env.example .env` y rellena `VITE_GEMINI_API_KEY`. Sin clave la app funciona, pero la sugerencia de IA muestra un error.
- `npm run dev`: arranca Vite en http://localhost:5173.
- `npm run check`: `typecheck` + `lint` + `format:check`. Ejecútalo antes de dar un cambio por terminado.
- `npm run lint:fix` y `npm run format`: corrigen lint y formato.
- `npm run build`: comprueba los tipos y genera `dist/`.
- No hay tests ni runner: no existe `npm test`. Verifica con `check` y `build`.

## Arquitectura

`src/` se organiza en capas. Cada capa importa solo de sí misma y de las filas anteriores:

| Capa          | Responsabilidad                                                                                      |
| ------------- | ---------------------------------------------------------------------------------------------------- |
| `types/`      | Tipos del dominio (`Task`, `IceScore`, `IceScoreDraft`).                                             |
| `utils/`      | Funciones puras del dominio: cálculo y validación de ICE, límites `MIN_ICE_VALUE` y `MAX_ICE_VALUE`. |
| `services/`   | E/S externa, sin React. Hoy solo `aiIceService` (Gemini).                                            |
| `hooks/`      | Estado y lógica de React. Único puente entre la UI y `services/`.                                    |
| `components/` | UI con MUI.                                                                                          |
| `App.tsx`     | Raíz: lista de tareas y apertura del formulario.                                                     |
| `main.tsx`    | Tema de MUI (`createTheme`) y montaje de `App`.                                                      |

- Los componentes nunca importan de `services/` ni llaman a `fetch`: usan un hook.
- `App` y `TaskFormDialog` son los únicos componentes con hooks de estado. Los demás son presentacionales: reciben datos y callbacks por props. Mantenlo así.

## Flujo de datos

1. `useTaskManager`, usado solo en `App`, guarda las tareas con `useState` y expone `sortedTasks` (ICE descendente, con `useMemo`) y las acciones `createTask`, `updateTask`, `toggleTaskStatus` y `deleteTask`.
2. `App` pasa `sortedTasks` y las acciones a `TaskList` → `TaskItem`. Los eventos suben como callbacks `onX` hasta `App`.
3. Para crear o editar, `App` monta `TaskFormDialog` con `task: Task | null` (`null` = tarea nueva).
4. `TaskFormDialog` combina dos hooks:
   - `useTaskForm`: `useReducer` con los valores del formulario y los derivados `calculatedIce`, `taskText` (título + descripción) y `taskToSave` (`null` si falta el título o algún valor ICE).
   - `useIceSuggestion`: pide la sugerencia a Gemini con `taskText`. El diálogo la aplica a los campos con `applyIceScore`.
5. Al guardar, `onSave(NewTask)` vuelve a `App`, que llama a `createTask` o `updateTask` y cierra el diálogo.

## Dónde va el código nuevo

- Tipo del dominio → `src/types/<Nombre>.ts`.
- Cálculo o validación pura → `src/utils/<nombreFuncion>.ts`, con el nombre de su función principal.
- Llamada a una API externa → `src/services/<nombre>Service.ts`.
- Estado o lógica con hooks → `src/hooks/use<Nombre>.ts`.
- Componente → `src/components/<Nombre>.tsx`, uno por archivo.
- Variable de entorno → prefijo `VITE_`; declárala en `src/vite-env.d.ts` y añádela comentada a `.env.example`.
- Colores y tema global → `createTheme` en `src/main.tsx`.
- Mantén la estructura plana: no crees `src/features/` ni subcarpetas sin que se pida, ni archivos barrel (`index.ts`).

## Integración con Gemini

- Todo lo de Gemini (modelo, URL, timeout, prompt, esquema de respuesta y mensajes de error) vive en `src/services/aiIceService.ts`.
- Trata la respuesta como dato externo: valida cada valor con `isValidIceValue` antes de devolverlo.
- Cada fallo lanza `AiIceServiceError` con un mensaje para el usuario. `useIceSuggestion` expone `loading`, `error: string | null` y `suggestion`, los reinicia al empezar, devuelve `null` si falla y cambia los errores desconocidos por un mensaje genérico. Sigue este patrón en cualquier operación asíncrona nueva.
- La IA solo sugiere: el usuario siempre puede ajustar los valores a mano, y la tarea no se guarda sin los tres valores ICE.

## Convenciones

- Identificadores en inglés. Textos de la UI, mensajes de error y comentarios en español **sin tildes ni ñ** (`Titulo`, `Aun no tienes tareas`, `anade`). Única excepción: el prompt que se envía a Gemini.
- Cada función, hook y componente lleva encima un comentario de una línea que empieza por su nombre: `// calculateIce devuelve la puntuacion ICE ...`.
- Componentes: `function Nombre({ ... }: NombreProps)`, con `interface NombreProps` justo encima y `export default Nombre` al final del archivo.
- Hooks, servicios y utilidades: exports con nombre, nunca `export default`.
- Declara las funciones con `function`, también las internas de componentes y hooks. Las flechas, solo en callbacks inline (JSX, `map`, `setState`).
- Props de callback: `onX` (`onDelete`, `onToggleStatus`). Manejadores internos: `handleX`.
- Ordena alfabéticamente las props JSX y las claves de los objetos que devuelven los hooks.
- Estilos solo con la prop `sx` y componentes de layout de MUI (`Stack`, `Box`). Sin archivos CSS ni `styled`.
- Constantes de módulo en `UPPER_SNAKE_CASE`. Usa `MIN_ICE_VALUE` y `MAX_ICE_VALUE`; no escribas 1 ni 10 a mano.
- Actualiza el estado con callbacks (`setTasks((current) => ...)`) que devuelven arrays y objetos nuevos.
- El ICE y los demás datos derivados se calculan (`calculateIce()`, `useMemo` o en el render); no se guardan en el estado ni en `Task`. El proyecto no usa `useEffect`.
- Evita `as`. Solo aparece en el `getElementById('root')` de `main.tsx` y en datos externos que se validan justo después.

## Límites y trampas

- No añadas backend, persistencia, router, librerías de estado o de formularios ni dependencias nuevas sin que se pida.
- La clave de Gemini se lee en el navegador y queda incluida en el JavaScript de `dist/`. No la escribas en el código, no subas `.env` y no publiques un build con una clave real.
- `TaskFormDialog` solo está montado mientras está abierto (`{isFormOpen && ...}`), para que `useReducer` se reinicie con la tarea correcta. Si lo dejas montado con `open={isFormOpen}`, el formulario conservará los datos de la tarea anterior.
- Un valor ICE `null` significa «sin indicar»: el `Slider` lo muestra en gris sobre `MIN_ICE_VALUE`. No lo conviertas en 1.
- En Windows con `core.autocrlf=true`, `format:check` (y por tanto `check`) marca todos los archivos aunque estén bien formateados: git guarda LF, el checkout usa CRLF y Prettier exige LF. Para comprobar el formato real, usa `npx prettier . --check --end-of-line crlf`.
