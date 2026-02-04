# Sincronía de variante y tablero

## Objetivo

Mantener la variante seleccionada si el árbol actual es compatible con esa variante. Cambiar de variante solo cuando el árbol ya no sea compatible, eligiendo la primera variante compatible según el orden disponible.

## Definiciones

- Árbol actual: secuencia de movimientos desde la raíz hasta el nodo actual.
- Variante compatible: una variante cuya secuencia inicial coincide completamente con el árbol actual.
- Variante seleccionada: la variante activa en la interfaz y usada para resaltar el siguiente movimiento.

## Reglas de selección

1. Si existe una variante seleccionada y es compatible con el árbol actual, se mantiene.
2. Si la variante seleccionada no es compatible, se elige la primera variante compatible.
3. Si no existe ninguna variante compatible, se usa la variante inicial según el orden definido al cargar.

## Consecuencias en la navegación

- Al avanzar un movimiento, la variante se recalcula con el nodo destino.
- Al retroceder un movimiento, la variante se recalcula con el nodo padre.
- Al saltar a un movimiento desde listas o paneles, se recalcula con ese nodo.
- Al cambiar el historial raíz, la variante se recalcula usando la nueva raíz.

## Ejemplo práctico

- Variante seleccionada: Apertura Española (empieza por e4).
- Si el usuario juega e4, la variante se mantiene.
- Si el usuario juega d4, la variante seleccionada se considera incompatible y se cambia a la primera variante compatible con d4.

## Prioridad de selección

La primera variante compatible es la que aparece primero en la lista de variantes calculada para el repertorio.

## Notas de consistencia

La variante se evalúa siempre contra el nodo objetivo que representa la posición actual. Esto evita cambios por estados anteriores o efectos de actualización asíncrona del tablero.

La selección de movimiento en el panel de variantes depende de que el `currentMoveNode` coincida por referencia con un nodo en la lista de movimientos de la variante seleccionada. Por eso, al recalcular variantes se refrescan los nodos para mantener la sincronía visual del movimiento resaltado.
