import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import SelectVariantsDialog from './SelectVariantsDialog';
import { Variant } from '../../../models/chess.models';
import { MoveVariantNode } from '@chess-opening-master/common';
import { getVariantsFromCurrentPosition } from '../../../utils/variantUtils';

jest.mock('../../../hooks/useTrainVariantInfo', () => ({
  useTrainVariantInfo: () => ({
    getTextColorFromVariant: jest.fn().mockReturnValue('#ffffff'),
  }),
}));

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

describe('SelectVariantsDialog', () => {
  const mockOnConfirm = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const defaultProps = {
    open: true,
    title: 'Test Dialog',
    contentText: 'Test content',
    variants: [],
    repertoireId: 'test-repertoire',
    onConfirm: mockOnConfirm,
    onClose: mockOnClose,
  };

  describe('getVariantsFromCurrentPosition logic tests', () => {
    const testVariants: Variant[] = [
      createMockVariant([{ id: 'e4' }, { id: 'e5' }, { id: 'Nf3' }], 'Italian Game', 'Italian Game: Main Line'),
      createMockVariant([{ id: 'e4' }, { id: 'e5' }, { id: 'Bc4' }], 'Italian Game', 'Italian Game: Bishop Opening'),
      createMockVariant([{ id: 'e4' }, { id: 'c5' }], 'Sicilian Defense', 'Sicilian Defense: Open'),
      createMockVariant([{ id: 'e4' }, { id: 'c5' }, { id: 'Nf3' }], 'Sicilian Defense', 'Sicilian Defense: Open Variation'),
      createMockVariant([{ id: 'd4' }], 'Queen\'s Pawn', 'Queen\'s Pawn Opening'),
      createMockVariant([], 'Starting Position', 'Starting Position'),
    ];

    test('should return all variants when at root position (position 0)', () => {
      const rootNode = createMockMoveNode('initial', null, 0);
      const result = getVariantsFromCurrentPosition(rootNode, testVariants);
      
      expect(result).toHaveLength(testVariants.length);
      expect(result).toEqual(testVariants);
    });

    test('should filter variants correctly at first move level (e4)', () => {
      const parentNode = createMockMoveNode('initial', null, 0);
      const currentNode = createMockMoveNode('e4', parentNode, 1);
      const result = getVariantsFromCurrentPosition(currentNode, testVariants);
      
      expect(result).toHaveLength(4);
      expect(result.every(v => v.moves.length > 0 && v.moves[0].id === 'e4')).toBe(true);
      expect(result.some(v => v.fullName.includes('Italian Game'))).toBe(true);
      expect(result.some(v => v.fullName.includes('Sicilian Defense'))).toBe(true);
      expect(result.some(v => v.fullName.includes('Queen\'s Pawn'))).toBe(false);
    });

    test('should filter variants correctly at second move level (e4 e5)', () => {
      const rootNode = createMockMoveNode('initial', null, 0);
      const firstMoveNode = createMockMoveNode('e4', rootNode, 1);
      const currentNode = createMockMoveNode('e5', firstMoveNode, 2);
      const result = getVariantsFromCurrentPosition(currentNode, testVariants);
      
      expect(result).toHaveLength(2);
      expect(result.every(v => v.moves.length >= 2 && v.moves[0].id === 'e4' && v.moves[1].id === 'e5')).toBe(true);
      expect(result.some(v => v.fullName.includes('Italian Game'))).toBe(true);
      expect(result.some(v => v.fullName.includes('Sicilian Defense'))).toBe(false);
    });

    test('should handle variants with fewer moves than current path', () => {
      const rootNode = createMockMoveNode('initial', null, 0);
      const firstMoveNode = createMockMoveNode('e4', rootNode, 1);
      const secondMoveNode = createMockMoveNode('e5', firstMoveNode, 2);
      const thirdMoveNode = createMockMoveNode('Nf3', secondMoveNode, 3);
      const currentNode = createMockMoveNode('Nc6', thirdMoveNode, 4);
      const result = getVariantsFromCurrentPosition(currentNode, testVariants);
      
      expect(result).toHaveLength(0);
    });

    test('should handle empty variants array', () => {
      const currentNode = createMockMoveNode('e4', null, 1);
      const result = getVariantsFromCurrentPosition(currentNode, []);
      
      expect(result).toHaveLength(0);
    });

    test('should handle variants with empty moves array', () => {
      const variantsWithEmptyMoves = [
        createMockVariant([], 'Empty Variant', 'Empty Variant'),
        createMockVariant([{ id: 'e4' }], 'King\'s Pawn', 'King\'s Pawn Opening'),
      ];

      const parentNode = createMockMoveNode('initial', null, 0);
      const currentNode = createMockMoveNode('e4', parentNode, 1);
      const result = getVariantsFromCurrentPosition(currentNode, variantsWithEmptyMoves);
      
      expect(result).toHaveLength(1);
      expect(result[0].fullName).toBe('King\'s Pawn Opening');
    });

    test('should handle deep nested move paths correctly', () => {
      const deepVariants = [
        createMockVariant(
          [{ id: 'e4' }, { id: 'e5' }, { id: 'Nf3' }, { id: 'Nc6' }, { id: 'Bb5' }],
          'Spanish Opening',
          'Ruy Lopez: Main Line'
        ),
        createMockVariant(
          [{ id: 'e4' }, { id: 'e5' }, { id: 'Nf3' }, { id: 'Nc6' }, { id: 'Bc4' }],
          'Italian Game',
          'Italian Game: Hungarian Defense'
        ),
        createMockVariant(
          [{ id: 'e4' }, { id: 'e5' }, { id: 'Nf3' }, { id: 'f5' }],
          'King\'s Gambit Declined',
          'King\'s Gambit Declined: Classical'
        ),
      ];

      const rootNode = createMockMoveNode('initial', null, 0);
      const firstNode = createMockMoveNode('e4', rootNode, 1);
      const secondNode = createMockMoveNode('e5', firstNode, 2);
      const thirdNode = createMockMoveNode('Nf3', secondNode, 3);
      const currentNode = createMockMoveNode('Nc6', thirdNode, 4);
      const result = getVariantsFromCurrentPosition(currentNode, deepVariants);
      
      expect(result).toHaveLength(2);
      expect(result.some(v => v.fullName.includes('Ruy Lopez'))).toBe(true);
      expect(result.some(v => v.fullName.includes('Hungarian Defense'))).toBe(true);
      expect(result.some(v => v.fullName.includes('King\'s Gambit'))).toBe(false);
    });

    test('should handle mismatched move sequences', () => {
      const mismatchedVariants = [
        createMockVariant([{ id: 'e4' }, { id: 'e5' }], 'Correct Path', 'King\'s Pawn Game'),
        createMockVariant([{ id: 'e4' }, { id: 'c5' }], 'Different Path', 'Sicilian Defense'),
        createMockVariant([{ id: 'd4' }, { id: 'd5' }], 'Completely Different', 'Queen\'s Gambit'),
      ];

      const rootNode = createMockMoveNode('initial', null, 0);
      const currentNode = createMockMoveNode('e4', rootNode, 1);
      const result = getVariantsFromCurrentPosition(currentNode, mismatchedVariants);
      
      expect(result).toHaveLength(2);
      expect(result.some(v => v.fullName.includes('King\'s Pawn Game'))).toBe(true);
      expect(result.some(v => v.fullName.includes('Sicilian Defense'))).toBe(true);
      expect(result.some(v => v.fullName.includes('Queen\'s Gambit'))).toBe(false);
    });

    test('should build correct path from nested nodes', () => {
      const rootNode = createMockMoveNode('initial', null, 0);
      const firstNode = createMockMoveNode('e4', rootNode, 1);
      const secondNode = createMockMoveNode('e5', firstNode, 2);
      const thirdNode = createMockMoveNode('Nf3', secondNode, 3);
      
      firstNode.parent = rootNode;
      secondNode.parent = firstNode;
      thirdNode.parent = secondNode;
      
      const variants = [
        createMockVariant([{ id: 'e4' }, { id: 'e5' }, { id: 'Nf3' }], 'Exact Match', 'Exact Match Opening'),
        createMockVariant([{ id: 'e4' }, { id: 'e5' }, { id: 'Nc3' }], 'Different Third', 'Different Third Move'),
        createMockVariant([{ id: 'e4' }, { id: 'e5' }], 'Shorter', 'Shorter Variant'),
      ];
      
      const result = getVariantsFromCurrentPosition(thirdNode, variants);
      
      expect(result).toHaveLength(1);
      expect(result[0].fullName).toBe('Exact Match Opening');
    });

    test('should handle node with null parent at non-zero position', () => {
      // When a node has position > 0 but no parent, the while loop stops immediately
      // and we get an empty currentPath array, so the filter condition becomes:
      // variant.moves.length < 0 (false) and all variants pass the loop
      const orphanedNode = createMockMoveNode('e4', null, 1);
      const variants = [
        createMockVariant([{ id: 'e4' }], 'King\'s Pawn', 'King\'s Pawn Opening'),
        createMockVariant([{ id: 'd4' }], 'Queen\'s Pawn', 'Queen\'s Pawn Opening'),
        createMockVariant([], 'Empty', 'Empty Variant'),
      ];
      
      const result = getVariantsFromCurrentPosition(orphanedNode, variants);
      
      // All variants should pass because currentPath is empty
      expect(result).toHaveLength(3);
    });

    test('should handle very long variant paths', () => {
      const longMoves = Array.from({ length: 20 }, (_, i) => ({ id: `move${i + 1}` }));
      const longVariant = createMockVariant(longMoves, 'Long Variant', 'Very Long Opening Line');
      const shortVariant = createMockVariant(longMoves.slice(0, 5), 'Short Variant', 'Short Opening Line');
      
      let currentNode = createMockMoveNode('initial', null, 0);
      for (let i = 0; i < 10; i++) {
        const newNode = createMockMoveNode(`move${i + 1}`, currentNode, i + 1);
        currentNode = newNode;
      }
      
      const result = getVariantsFromCurrentPosition(currentNode, [longVariant, shortVariant]);
      
      expect(result).toHaveLength(1);
      expect(result[0].fullName).toBe('Very Long Opening Line');
    });

    test('should handle case-sensitive move IDs', () => {
      const variants = [
        createMockVariant([{ id: 'E4' }], 'Uppercase', 'Uppercase Move'),
        createMockVariant([{ id: 'e4' }], 'Lowercase', 'Lowercase Move'),
      ];
      
      const parentNode = createMockMoveNode('initial', null, 0);
      const currentNode = createMockMoveNode('e4', parentNode, 1);
      const result = getVariantsFromCurrentPosition(currentNode, variants);
      
      expect(result).toHaveLength(1);
      expect(result[0].fullName).toBe('Lowercase Move');
    });

    test('should handle single move variants at various depths', () => {
      const variants = [
        createMockVariant([{ id: 'e4' }], 'First Move', 'King\'s Pawn'),
        createMockVariant([{ id: 'e4' }, { id: 'e5' }], 'Second Move', 'King\'s Pawn Game'),
        createMockVariant([{ id: 'e4' }, { id: 'e5' }, { id: 'Nf3' }], 'Third Move', 'King\'s Knight Opening'),
      ];
      
      // Test from root
      const rootNode = createMockMoveNode('initial', null, 0);
      const rootResult = getVariantsFromCurrentPosition(rootNode, variants);
      expect(rootResult).toHaveLength(3);
      
      // Test from first move
      const firstNode = createMockMoveNode('e4', rootNode, 1);
      const firstResult = getVariantsFromCurrentPosition(firstNode, variants);
      expect(firstResult).toHaveLength(3);
      
      // Test from second move
      const secondNode = createMockMoveNode('e5', firstNode, 2);
      const secondResult = getVariantsFromCurrentPosition(secondNode, variants);
      expect(secondResult).toHaveLength(2);
      
      // Test from third move
      const thirdNode = createMockMoveNode('Nf3', secondNode, 3);
      const thirdResult = getVariantsFromCurrentPosition(thirdNode, variants);
      expect(thirdResult).toHaveLength(1);
    });

    test('should preserve variant order in filtered results', () => {
      const variants = [
        createMockVariant([{ id: 'e4' }, { id: 'e5' }], 'First', 'First Variant'),
        createMockVariant([{ id: 'e4' }, { id: 'c5' }], 'Second', 'Second Variant'),
        createMockVariant([{ id: 'e4' }, { id: 'e6' }], 'Third', 'Third Variant'),
        createMockVariant([{ id: 'd4' }], 'Fourth', 'Fourth Variant'),
      ];
      
      const parentNode = createMockMoveNode('initial', null, 0);
      const currentNode = createMockMoveNode('e4', parentNode, 1);
      const result = getVariantsFromCurrentPosition(currentNode, variants);
      
      expect(result).toHaveLength(3);
      expect(result[0].fullName).toBe('First Variant');
      expect(result[1].fullName).toBe('Second Variant');
      expect(result[2].fullName).toBe('Third Variant');
    });
  });

  describe('Component integration tests', () => {
    test('should render dialog with variants', async () => {
      const variants = [
        createMockVariant([{ id: 'e4' }], 'Test Opening', 'Test Opening: Main Line'),
      ];

      await act(async () => {
        render(
          <SelectVariantsDialog
            {...defaultProps}
            variants={variants}
          />
        );
      });

      expect(screen.getByText('Test Dialog')).toBeInTheDocument();
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    test('should show filter by position option when currentMoveNode is provided', async () => {
      const currentNode = createMockMoveNode('e4', null, 1);
      const variants = [
        createMockVariant([{ id: 'e4' }], 'Test Opening', 'Test Opening: Main Line'),
      ];

      await act(async () => {
        render(
          <SelectVariantsDialog
            {...defaultProps}
            variants={variants}
            currentMoveNode={currentNode}
          />
        );
      });

      expect(screen.getByLabelText(/Filter by current position/)).toBeInTheDocument();
    });

    test('should show correct variant count in filter label regardless of filter state', async () => {
      const rootNode = createMockMoveNode('initial', null, 0);
      const e4Node = createMockMoveNode('e4', rootNode, 1);
      const variants = [
        createMockVariant([{ id: 'e4' }], 'King Pawn', 'King Pawn Opening'),
        createMockVariant([{ id: 'd4' }], 'Queen Pawn', 'Queen Pawn Opening'),
        createMockVariant([{ id: 'e4' }, { id: 'e5' }], 'King Pawn Game', 'King Pawn Game'),
      ];

      await act(async () => {
        render(
          <SelectVariantsDialog
            {...defaultProps}
            variants={variants}
            currentMoveNode={e4Node}
          />
        );
      });

      // Should show 2 variants available (the ones starting with e4)
      expect(screen.getByLabelText(/Filter by current position \(2 variants available\)/)).toBeInTheDocument();
    });
  });
});
