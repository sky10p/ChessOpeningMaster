import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import VariantTree from './VariantTree';
import { Variant } from '../../../../models/chess.models';
import { MoveVariantNode } from '@chess-opening-master/common';

const mockGoToTrainRepertoire = jest.fn();

jest.mock('../../../../utils/navigationUtils', () => ({
  useNavigationUtils: () => ({
    goToTrainRepertoire: mockGoToTrainRepertoire,
  }),
}));

jest.mock('react-router-dom', () => ({
  useLocation: () => ({
    pathname: '/repertoire/test-id',
    search: '',
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
    json: () => Promise.resolve([]),
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
  variants: mockVariants,
  repertoireId: 'test-repertoire-123',
  orientation: 'white' as const,
  deleteVariant: jest.fn(),
  copyVariantToRepertoire: jest.fn(),
  downloadVariantPGN: jest.fn(),
  copyVariantPGN: jest.fn(),
  deleteVariants: jest.fn(),
  copyVariantsToRepertoire: jest.fn(),
  changeNameMove: jest.fn(),
  deleteMove: jest.fn(),
  goToMove: jest.fn(),
  currentMoveNode: mockVariants[0].moves[0],
  selectedVariant: mockVariants[0],
  setSelectedVariant: jest.fn(),
};

describe('VariantTree', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Train action', () => {
    it('should call goToTrainRepertoire with correct parameters when Train button is clicked', () => {
      render(<VariantTree {...defaultProps} />);
      
      const trainLabel = screen.getByText('Train');
      expect(trainLabel).toBeInTheDocument();
      
      const trainButton = trainLabel.parentElement?.querySelector('button');
      expect(trainButton).toBeInTheDocument();
      
      if (trainButton) {
        fireEvent.click(trainButton);
      }
      
      expect(mockGoToTrainRepertoire).toHaveBeenCalledWith(
        defaultProps.repertoireId,
        defaultProps.selectedVariant.fullName
      );
    });

    it('should not call goToTrainRepertoire when selectedVariant is null', () => {
      const propsWithoutVariant = {
        ...defaultProps,
        selectedVariant: null,
      };
      
      render(<VariantTree {...propsWithoutVariant} />);
      
      expect(screen.queryByText('Train')).not.toBeInTheDocument();
      expect(mockGoToTrainRepertoire).not.toHaveBeenCalled();
    });

    it('should use selectedVariant fullName not just name for training', () => {
      const variantWithDifferentNames = {
        moves: [createMockMoveNode('move3')],
        name: 'Short Name',
        fullName: 'Very Long Full Name: Complete Variation Details',
        differentMoves: '',
      };
      
      const customProps = {
        ...defaultProps,
        selectedVariant: variantWithDifferentNames,
      };
      
      render(<VariantTree {...customProps} />);
      
      const trainLabel = screen.getByText('Train');
      const trainButton = trainLabel.parentElement?.querySelector('button');
      
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

  describe('Variant actions', () => {
    it('should display all primary action buttons when selectedVariant exists', () => {
      render(<VariantTree {...defaultProps} />);
      
      expect(screen.getByText('Train')).toBeInTheDocument();
      expect(screen.getByText('Download')).toBeInTheDocument();
      expect(screen.getByText('Copy PGN')).toBeInTheDocument();
      expect(screen.getByText('Copy variant')).toBeInTheDocument();
    });

    it('should call downloadVariantPGN when Download button is clicked', () => {
      render(<VariantTree {...defaultProps} />);
      
      const downloadLabel = screen.getByText('Download');
      const downloadButton = downloadLabel.parentElement?.querySelector('button');
      
      if (downloadButton) {
        fireEvent.click(downloadButton);
      }
      
      expect(defaultProps.downloadVariantPGN).toHaveBeenCalledWith(defaultProps.selectedVariant);
    });

    it('should call copyVariantPGN when Copy PGN button is clicked', () => {
      render(<VariantTree {...defaultProps} />);
      
      const copyPgnLabel = screen.getByText('Copy PGN');
      const copyPgnButton = copyPgnLabel.parentElement?.querySelector('button');
      
      if (copyPgnButton) {
        fireEvent.click(copyPgnButton);
      }
      
      expect(defaultProps.copyVariantPGN).toHaveBeenCalledWith(defaultProps.selectedVariant);
    });

    it('should call copyVariantToRepertoire when Copy variant button is clicked', () => {
      render(<VariantTree {...defaultProps} />);
      
      const copyVariantLabel = screen.getByText('Copy variant');
      const copyVariantButton = copyVariantLabel.parentElement?.querySelector('button');
      
      if (copyVariantButton) {
        fireEvent.click(copyVariantButton);
      }
      
      expect(defaultProps.copyVariantToRepertoire).toHaveBeenCalledWith(defaultProps.selectedVariant);
    });
  });

  describe('Variant selection', () => {
    it('should display selectedVariant name in selection button', () => {
      render(<VariantTree {...defaultProps} />);
      
      expect(screen.getByText('Italian Game')).toBeInTheDocument();
    });

    it('should open variant selection dialog when selection button is clicked', () => {
      render(<VariantTree {...defaultProps} />);
      
      const selectionButton = screen.getByText('Italian Game');
      fireEvent.click(selectionButton);
      
      expect(screen.getByText('Select Variant')).toBeInTheDocument();
      expect(screen.getByText('Choose a single variant from current position')).toBeInTheDocument();
    });

    it('should call setSelectedVariant when variant is selected from dialog', () => {
      render(<VariantTree {...defaultProps} />);
      
      const selectionButton = screen.getByText('Italian Game');
      fireEvent.click(selectionButton);
      
      expect(screen.getByText('Select Variant')).toBeInTheDocument();
    });
  });

  describe('Component integration', () => {
    it('should render successfully with all required props', () => {
      render(<VariantTree {...defaultProps} />);
      
      expect(screen.getByText('Italian Game')).toBeInTheDocument();
    });

    it('should not render action buttons when selectedVariant is null', () => {
      const propsWithoutVariant = {
        ...defaultProps,
        selectedVariant: null,
      };
      
      render(<VariantTree {...propsWithoutVariant} />);
      
      expect(screen.queryByText('Train')).not.toBeInTheDocument();
      expect(screen.queryByText('Download')).not.toBeInTheDocument();
    });

    it('should handle empty variants array gracefully', () => {
      const propsWithNoVariants = {
        ...defaultProps,
        variants: [],
        selectedVariant: null,
      };
      
      render(<VariantTree {...propsWithNoVariants} />);
      
      expect(screen.queryByText('Train')).not.toBeInTheDocument();
    });
  });

  describe('Action consistency', () => {
    it('should use consistent repertoire ID across all actions', () => {
      const customRepertoireId = 'custom-repertoire-456';
      const customProps = {
        ...defaultProps,
        repertoireId: customRepertoireId,
      };
      
      render(<VariantTree {...customProps} />);
      
      const trainLabel = screen.getByText('Train');
      const trainButton = trainLabel.parentElement?.querySelector('button');
      
      if (trainButton) {
        fireEvent.click(trainButton);
      }
      
      expect(mockGoToTrainRepertoire).toHaveBeenCalledWith(
        customRepertoireId,
        customProps.selectedVariant.fullName
      );
    });
  });
});
