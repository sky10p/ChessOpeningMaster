# Auditoría técnica y propuestas de mejora (ES)

> Documento complementario con foco explícito en **diseño** y **funcionalidad**.

## Diagnóstico rápido de UI/UX actual

- El tablero se integra vía `react-chessboard`, librería sin mantenimiento activo según la documentación del repositorio, lo que incrementa el riesgo de deuda técnica y frena mejoras visuales o de accesibilidad.【F:Readme.md†L116-L119】
- El flujo de edición y entrenamiento está centrado en la interacción directa con el tablero y el árbol de variantes; hay potencial para mejorar **memorización** y **recall activo** sin romper funcionalidad existente.

## Informe de mejoras (Diseño)

### 1) Modo de estudio guiado (Focus Mode)
**Objetivo:** minimizar ruido visual y priorizar la memorización.
- Panel izquierdo: árbol colapsable de variantes con breadcrumb de la línea activa.
- Panel derecho: comentarios de posición + tips tácticos (según FEN).
- Toggle para mostrar/ocultar Stockfish y estadísticas (reduce sobrecarga cognitiva).

**Beneficios tangibles:** mejora la retención por repetición activa y reduce la fatiga visual.

### 2) Sistema de anotaciones visuales
**Objetivo:** facilitar la memorización espacial.
- Paletas de colores para flechas/círculos por propósito (planes, amenazas, ideas).
- Historial de anotaciones por variante (no solo por nodo actual).

**Beneficios:** refuerza patrones de planes y estructura de peones.

### 3) Accesibilidad y consistencia visual
**Objetivo:** mejorar legibilidad y uso continuo.
- Contraste mejorado para textos y estados (errores, aciertos, review).
- Tipografía monoespaciada opcional para SAN/PGN (reduce errores de lectura).

**Beneficios:** sesiones más largas sin fatiga.

## Informe de mejoras (Funcionalidad)

### 1) Sistema de repetición espaciada (SM-2)
**Objetivo:** priorizar variantes en función del olvido real.
- Guardar `easiness`, `interval`, `repetitions` por variante.
- Integrar el selector de paths con estas métricas.

**Beneficios:** aprendizaje más eficiente y con menor tiempo total de entrenamiento.

### 2) Modo “errores típicos”
**Objetivo:** entrenar variantes con distracciones reales.
- Permitir registrar movimientos erróneos recurrentes.
- En entrenamiento, introducirlos como opciones para reforzar el reconocimiento.

**Beneficios:** disminuye errores habituales en partidas reales.

### 3) Métricas de progreso y consistencia
**Objetivo:** feedback continuo y motivacional.
- Dashboard con “racha de estudio”, “errores por apertura” y “última revisión”.
- Resumen semanal/mensual para detectar estancamientos.

**Beneficios:** visibilidad clara del avance real.

## Por dónde empezar (prioridad recomendada)

1) **Diseño: Focus Mode (modo de estudio guiado)**  
   - Impacto inmediato en memorización y reducción de fatiga visual.  
   - Riesgo bajo porque no toca lógica de variantes ni backend.

2) **Funcionalidad: métricas de progreso**  
   - Aporta valor tangible con datos ya existentes.  
   - No requiere cambios profundos en selección de variantes.

3) **Funcionalidad avanzada: SM-2**  
   - Potencia el aprendizaje, pero requiere cambios en datos y selector.  
   - Conviene implementarlo cuando la UI/UX esté estable.

## Plan de acción (alto nivel)

1) **Diseño:** crear prototipos ligeros del Focus Mode y panel de progreso.
2) **Backend:** definir schema de SM-2 y migración incremental.
3) **Frontend:** integrar el selector de paths con SM-2 y nueva UI.
4) **Testing:** añadir unit + integración para no romper el motor de variantes.

## Estrategia de testing propuesta

- **Unitarios**
  - Selector de paths con SM-2.
  - Persistencia de métricas por variante.
- **Integración**
  - Flujo completo: entrenamiento → actualización de métricas → nuevo path.
  - Validar que comentarios y árboles no se rompan.
