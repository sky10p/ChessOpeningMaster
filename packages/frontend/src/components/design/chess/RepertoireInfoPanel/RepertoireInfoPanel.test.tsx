import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RepertoireInfoPanel } from './RepertoireInfoPanel';
import { Variant } from '../../../../models/chess.models';
import { MoveVariantNode } from '@chess-opening-master/common';

const mockGoToTrainRepertoire = jest.fn();

jest.mock('../../../../libs/useStockfish', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    lines: [],
    depth: 0,
    maxDepth: 20,
  })),
}));

jest.mock('../../../../utils/navigationUtils', () => ({
  useNavigationUtils: () => ({
    goToTrainRepertoire: mockGoToTrainRepertoire,
  }),
}));

jest.mock('../../../../hooks/useTrainVariantInfo', () => ({
  useTrainVariantInfo: () => ({
    variantsInfo: [],
    groupedVariantsInfo: {},
    getColorFromVariant: jest.fn(() => '#4CAF50'),
    getTextColorFromVariant: jest.fn(() => '#FFFFFF'),
  }),
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      white: 0,
      draws: 0,
      black: 0,
      moves: [],
      topGames: [],
      opening: null
    }),
  })
) as jest.Mock;

const createMockMoveNode = (id: string): MoveVariantNode => {
  const node = new MoveVariantNode();
  node.id = id;
  node.move = {
    color: 'w',
    piece: 'p',
    from: 'e2',
    to: 'e4',
    san: 'e4',
    flags: 'b',
    lan: 'e2e4',
    before: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    after: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
  };
  return node;
};

const createMoveNodeWithSan = (id: string, san: string, lan: string): MoveVariantNode => {
  const node = new MoveVariantNode();
  node.id = id;
  node.move = {
    color: 'w',
    piece: 'p',
    from: 'e2',
    to: 'e4',
    san,
    flags: 'b',
    lan,
    before: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    after: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
  };
  return node;
};

const mockVariants: Variant[] = [
  {
    moves: [createMockMoveNode('move1')],
    name: 'Italian Game',
    fullName: 'Italian Game: Classical Variation',
    differentMoves: '',
  },
  {
    moves: [createMockMoveNode('move2')],
    name: 'Sicilian Defense',
    fullName: 'Sicilian Defense: Accelerated Dragon',
    differentMoves: '',
  },
];

const defaultProps = {
  repertoireId: 'test-repertoire-123',
  variants: mockVariants,
  fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  currentMoveNode: mockVariants[0].moves[0],
  goToMove: jest.fn(),
  deleteMove: jest.fn(),
  changeNameMove: jest.fn(),
  selectedVariant: mockVariants[0],
  setSelectedVariant: jest.fn(),
  comment: 'Test comment',
  updateComment: jest.fn(),
  downloadVariantPGN: jest.fn(),
  copyVariantPGN: jest.fn(),
  copyVariantToRepertoire: jest.fn(),
  copyVariantsToRepertoire: jest.fn(),
  deleteVariants: jest.fn(),
  deleteVariant: jest.fn(),
  toggleMenu: jest.fn(),
};

describe('RepertoireInfoPanel - Train Variant Action', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Train variant action functionality', () => {
    it('should call goToTrainRepertoire with correct repertoireId and selectedVariant fullName when Train variant is clicked', () => {
      render(<RepertoireInfoPanel {...defaultProps} />);
      
      const trainButton = screen.getByText('Train').closest('div')?.querySelector('button');
      
      expect(trainButton).toBeInTheDocument();
      
      if (trainButton) {
        fireEvent.click(trainButton);
      }
      
      expect(mockGoToTrainRepertoire).toHaveBeenCalledWith(
        defaultProps.repertoireId,
        defaultProps.selectedVariant.fullName
      );
    });

    it('should call goToTrainRepertoire with correct parameters when selectedVariant changes', () => {
      const newSelectedVariant = mockVariants[1];
      const newProps = {
        ...defaultProps,
        selectedVariant: newSelectedVariant,
      };
      
      render(<RepertoireInfoPanel {...newProps} />);
      
      const trainButton = screen.getByText('Train').closest('div')?.querySelector('button');
      
      if (trainButton) {
        fireEvent.click(trainButton);
      }
      
      expect(mockGoToTrainRepertoire).toHaveBeenCalledWith(
        newProps.repertoireId,
        newSelectedVariant.fullName
      );
    });

    it('should not call goToTrainRepertoire when selectedVariant is undefined', () => {
      const propsWithoutSelectedVariant = {
        ...defaultProps,
        selectedVariant: undefined as unknown as Variant,
      };
      
      render(<RepertoireInfoPanel {...propsWithoutSelectedVariant} />);
      
      const trainButton = screen.getByText('Train').closest('div')?.querySelector('button');
      
      if (trainButton) {
        fireEvent.click(trainButton);
      }
      
      expect(mockGoToTrainRepertoire).not.toHaveBeenCalled();
    });

    it('should include correct actions in secondaryActions array with correct properties', () => {
      render(<RepertoireInfoPanel {...defaultProps} />);
      
      const moreOptionsButton = screen.getAllByRole('button').find(button => 
        button.querySelector('svg path[d*="12 6.75a.75.75"]')
      );
      
      if (moreOptionsButton) {
        fireEvent.click(moreOptionsButton);
      }
      
      const toggleMenuCall = defaultProps.toggleMenu.mock.calls[0];
      const secondaryActions = toggleMenuCall[1];
      
      expect(secondaryActions).toEqual([
        expect.objectContaining({
          name: 'Copy variant to repertoire',
          action: expect.any(Function),
        }),
        expect.objectContaining({
          name: 'Copy variants to repertoire',
          action: expect.any(Function),
        }),
        expect.objectContaining({
          name: 'Delete variants',
          action: expect.any(Function),
        }),
      ]);
    });

    it('should use correct repertoire ID consistently', () => {
      const customRepertoireId = 'custom-repertoire-id-456';
      const customProps = {
        ...defaultProps,
        repertoireId: customRepertoireId,
      };
      
      render(<RepertoireInfoPanel {...customProps} />);
      
      const trainButton = screen.getByText('Train').closest('div')?.querySelector('button');
      
      if (trainButton) {
        fireEvent.click(trainButton);
      }
      
      expect(mockGoToTrainRepertoire).toHaveBeenCalledWith(
        customRepertoireId,
        customProps.selectedVariant.fullName
      );
    });

    it('should use selectedVariant fullName not just name', () => {
      const variantWithDifferentNames = {
        moves: [createMockMoveNode('move3')],
        name: 'Short Name',
        fullName: 'Very Long Full Name: Complete Variation with Details',
        differentMoves: '',
      };
      
      const customProps = {
        ...defaultProps,
        selectedVariant: variantWithDifferentNames,
      };
      
      render(<RepertoireInfoPanel {...customProps} />);
      
      const trainButton = screen.getByText('Train').closest('div')?.querySelector('button');
      
      if (trainButton) {
        fireEvent.click(trainButton);
      }
      
      expect(mockGoToTrainRepertoire).toHaveBeenCalledWith(
        customProps.repertoireId,
        variantWithDifferentNames.fullName
      );
      
      expect(mockGoToTrainRepertoire).not.toHaveBeenCalledWith(
        customProps.repertoireId,
        variantWithDifferentNames.name
      );
    });
  });

  describe('Component integration', () => {
    it('should render the component successfully', () => {
      render(<RepertoireInfoPanel {...defaultProps} />);
      
      expect(screen.getByText('Italian Game')).toBeInTheDocument();
    });

    it('should have more options button available for interaction', () => {
      render(<RepertoireInfoPanel {...defaultProps} />);
      
      const moreOptionsButton = screen.getAllByRole('button').find(button => 
        button.querySelector('svg path[d*="12 6.75a.75.75"]')
      );
      
      expect(moreOptionsButton).toBeInTheDocument();
    });
  });
});

describe('RepertoireInfoPanel - Selected movement highlight', () => {
  it('should highlight currentMoveNode in variant movements', () => {
    const moveE4 = createMoveNodeWithSan('move-e4', 'e4', 'e2e4');
    const moveD4 = createMoveNodeWithSan('move-d4', 'd4', 'd2d4');
    const variant = {
      moves: [moveE4, moveD4],
      name: 'Main Line',
      fullName: 'Main Line',
      differentMoves: '',
    };
    const props = {
      ...defaultProps,
      variants: [variant],
      selectedVariant: variant,
      currentMoveNode: moveD4,
    };

    render(<RepertoireInfoPanel {...props} />);

    const selectedMove = screen.getByText('d4').parentElement;
    const unselectedMove = screen.getByText('e4').parentElement;

    expect(selectedMove).toHaveClass('bg-blue-600');
    expect(unselectedMove).not.toHaveClass('bg-blue-600');
  });
});
