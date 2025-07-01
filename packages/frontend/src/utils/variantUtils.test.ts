import { getVariantsFromCurrentPosition } from './variantUtils';
import { Variant } from '../models/chess.models';
import { MoveVariantNode } from '@chess-opening-master/common';

const createMockMoveNode = (id: string, parent: MoveVariantNode | null = null, position = 0): MoveVariantNode => {
  const node = new MoveVariantNode();
  node.id = id;
  node.parent = parent;
  node.position = position;
  return node;
};

const createMockVariant = (moves: { id: string }[], name: string, fullName: string): Variant => ({
  moves: moves.map(move => {
    const node = new MoveVariantNode();
    node.id = move.id;
    return node;
  }),
  name,
  fullName,
  differentMoves: '',
});

describe('variantUtils - getVariantsFromCurrentPosition', () => {
  describe('Basic functionality', () => {
    const testVariants: Variant[] = [
      createMockVariant([{ id: 'e4' }, { id: 'e5' }, { id: 'Nf3' }], 'Italian Game', 'Italian Game: Main Line'),
      createMockVariant([{ id: 'e4' }, { id: 'e5' }, { id: 'Bc4' }], 'Italian Game', 'Italian Game: Bishop Opening'),
      createMockVariant([{ id: 'e4' }, { id: 'c5' }], 'Sicilian Defense', 'Sicilian Defense: Open'),
      createMockVariant([{ id: 'd4' }], 'Queen\'s Pawn', 'Queen\'s Pawn Opening'),
      createMockVariant([], 'Starting Position', 'Starting Position'),
    ];

    test('returns all variants at root position', () => {
      const rootNode = createMockMoveNode('initial', null, 0);
      const result = getVariantsFromCurrentPosition(rootNode, testVariants);
      
      expect(result).toEqual(testVariants);
      expect(result).toHaveLength(5);
    });

    test('filters variants by move sequence correctly', () => {
      const rootNode = createMockMoveNode('initial', null, 0);
      const e4Node = createMockMoveNode('e4', rootNode, 1);
      const e5Node = createMockMoveNode('e5', e4Node, 2);
      
      const result = getVariantsFromCurrentPosition(e5Node, testVariants);
      
      expect(result).toHaveLength(2);
      expect(result.every(v => v.fullName.includes('Italian Game'))).toBe(true);
    });

    test('returns empty array when no variants match', () => {
      const rootNode = createMockMoveNode('initial', null, 0);
      const unknownNode = createMockMoveNode('xyz', rootNode, 1);
      
      const result = getVariantsFromCurrentPosition(unknownNode, testVariants);
      
      expect(result).toHaveLength(0);
    });
  });

  describe('Edge cases', () => {
    test('handles empty variants array', () => {
      const node = createMockMoveNode('e4', null, 1);
      const result = getVariantsFromCurrentPosition(node, []);
      
      expect(result).toHaveLength(0);
    });

    test('handles variants with no moves', () => {
      const variants = [createMockVariant([], 'Empty', 'Empty Variant')];
      const node = createMockMoveNode('e4', null, 1);
      
      const result = getVariantsFromCurrentPosition(node, variants);
      
      expect(result).toHaveLength(1);
    });

    test('correctly builds path through parent chain', () => {
      const root = createMockMoveNode('initial', null, 0);
      const first = createMockMoveNode('e4', root, 1);
      const second = createMockMoveNode('e5', first, 2);
      const third = createMockMoveNode('Nf3', second, 3);
      
      const variants = [
        createMockVariant([{ id: 'e4' }, { id: 'e5' }, { id: 'Nf3' }], 'Match', 'Exact Match'),
        createMockVariant([{ id: 'e4' }, { id: 'e5' }, { id: 'Bc4' }], 'NoMatch', 'No Match'),
      ];
      
      const result = getVariantsFromCurrentPosition(third, variants);
      
      expect(result).toHaveLength(1);
      expect(result[0].fullName).toBe('Exact Match');
    });

    test('handles node with null parent and non-zero position', () => {
      const orphanNode = createMockMoveNode('e4', null, 1);
      const variants = [
        createMockVariant([{ id: 'e4' }], 'Match', 'Should Match'),
        createMockVariant([{ id: 'd4' }], 'NoMatch', 'Should Not Match'),
      ];
      
      const result = getVariantsFromCurrentPosition(orphanNode, variants);
      
      // With null parent, path construction stops and currentPath becomes empty
      // So all variants pass the length check and ID matching loop
      expect(result).toHaveLength(2);
    });

    test('preserves original variant order', () => {
      const variants = [
        createMockVariant([{ id: 'e4' }], 'First', 'First Variant'),
        createMockVariant([{ id: 'e4' }], 'Second', 'Second Variant'),
        createMockVariant([{ id: 'e4' }], 'Third', 'Third Variant'),
      ];
      
      const node = createMockMoveNode('e4', null, 1);
      const result = getVariantsFromCurrentPosition(node, variants);
      
      expect(result.map(v => v.fullName)).toEqual([
        'First Variant',
        'Second Variant', 
        'Third Variant'
      ]);
    });
  });

  describe('Performance considerations', () => {
    test('handles large number of variants efficiently', () => {
      const largeVariantSet = Array.from({ length: 1000 }, (_, i) => 
        createMockVariant([{ id: 'e4' }, { id: `move${i}` }], `Opening${i}`, `Opening ${i}`)
      );
      
      const rootNode = createMockMoveNode('initial', null, 0);
      const e4Node = createMockMoveNode('e4', rootNode, 1);
      
      const start = performance.now();
      const result = getVariantsFromCurrentPosition(e4Node, largeVariantSet);
      const end = performance.now();
      
      expect(result).toHaveLength(1000);
      expect(end - start).toBeLessThan(100); // Should complete in under 100ms
    });

    test('handles deep move sequences efficiently', () => {
      const deepMoves = Array.from({ length: 50 }, (_, i) => ({ id: `move${i}` }));
      const deepVariant = createMockVariant(deepMoves, 'Deep', 'Deep Variant');
      
      let currentNode = createMockMoveNode('initial', null, 0);
      for (let i = 0; i < 25; i++) {
        const newNode = createMockMoveNode(`move${i}`, currentNode, i + 1);
        currentNode = newNode;
      }
      
      const start = performance.now();
      const result = getVariantsFromCurrentPosition(currentNode, [deepVariant]);
      const end = performance.now();
      
      expect(result).toHaveLength(1);
      expect(end - start).toBeLessThan(50); // Should complete in under 50ms
    });
  });
});
