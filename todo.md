<!--
  Archivo: todo.md
  Descripción: Lista de propuestas de mejora para el diseño web del frontend de ChessKeep.
-->
# TODO: Mejoras de diseño web

A continuación se recopilan las recomendaciones para mejorar la experiencia de usuario, accesibilidad y rendimiento del frontend de ChessKeep:

## 1. Unificación de estilos
- Sustituir la mezcla actual de **Emotion** y **TailwindCSS** por una sola estrategia:
  - Usar exclusivamente **TailwindCSS** con clases utilitarias.
  - O bien definir un set de tokens y componentes mediante CSS‑in‑JS para estilos complejos.

## 2. Tema claro/oscuro
- Activar el modo **dark** en Tailwind.
- Añadir un toggle de tema y guardar la preferencia en `localStorage`.

## 3. Diseño responsive
- En móvil, convertir el sidebar de repertorios en un drawer deslizable.
- Mostrar el tablero a **full‑width** y colapsar paneles secundarios (comentarios, lista de variaciones).

## 4. Accesibilidad (A11Y)
- Revisar los contrastes de color para cumplir **WCAG AA**.
- Añadir `aria-labels` y roles a los controles del tablero.
- Asegurar navegabilidad completa con teclado.

## 5. Librería de tablero
- Sustituir la librería actual (abandonada) por una mantenida como **react-chessboard** o **chessground**.
- Mejor soporte para móvil y operaciones de drag&drop.

## 6. Gestión visual del árbol de variaciones
- Implementar una vista en árbol con **drag&drop** (por ejemplo, React-DND).
- Permitir reordenar, crear y renombrar nodos de forma gráfica.

## 7. Undo/Redo y confirmaciones
- Mostrar notificaciones tipo “toast” tras borrar o renombrar nodos, con opción de “Deshacer”.
- Evitar acciones irreversibles sin confirmación.

## 8. Onboarding y ayuda contextual
- Incluir un tour guiado con **React-Joyride** o similar.
- Mostrar tooltips en la primera interacción con módulos clave (editar, entrenar).

## 9. Métricas y feedback visual
- Visualizar el progreso de entrenamiento con barras, anillos o sparklines (Recharts, Victory).
- Añadir micro‑animaciones y colores al acertar o fallar una jugada.

## 10. Rendimiento
- Lazy‑load de componentes pesados (gráficas, tablero).
- Code‑splitting por ruta.
- Caché de datos en cliente (React Query, SWR).

## 11. Testing visual
- Incorporar snapshots visuales vía **Ladle** o **Storybook** combinado con **Percy**.
- Detectar regresiones de diseño automáticamente.