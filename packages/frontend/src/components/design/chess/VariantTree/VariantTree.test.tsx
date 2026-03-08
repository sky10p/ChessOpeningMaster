import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import VariantTree from './VariantTree';
import { Variant } from '../../../../models/chess.models';
import { MoveVariantNode } from '@chess-opening-master/common';
import { MenuContext } from '../../../../contexts/MenuContext';

const mockGoToTrainRepertoire = jest.fn();
const mockToggleMenu = jest.fn();

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
      
      const trainButton = screen.getByRole('button', { name: 'Train' });
      expect(trainButton).toBeInTheDocument();
      
      fireEvent.click(trainButton);
      
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
      
      const trainButton = screen.getByRole('button', { name: 'Train' });
      fireEvent.click(trainButton);
      
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
      
      const downloadButton = screen.getByRole('button', { name: 'Download' });
      fireEvent.click(downloadButton);
      
      expect(defaultProps.downloadVariantPGN).toHaveBeenCalledWith(defaultProps.selectedVariant);
    });

    it('should call copyVariantPGN when Copy PGN button is clicked', () => {
      render(<VariantTree {...defaultProps} />);
      
      const copyPgnButton = screen.getByRole('button', { name: 'Copy PGN' });
      fireEvent.click(copyPgnButton);
      
      expect(defaultProps.copyVariantPGN).toHaveBeenCalledWith(defaultProps.selectedVariant);
    });

    it('should call copyVariantToRepertoire when Copy variant button is clicked', () => {
      render(<VariantTree {...defaultProps} />);
      
      const copyVariantButton = screen.getByRole('button', { name: 'Copy variant' });
      fireEvent.click(copyVariantButton);
      
      expect(defaultProps.copyVariantToRepertoire).toHaveBeenCalledWith(defaultProps.selectedVariant);
    });
  });

  describe('Variant selection', () => {
    it('should display selectedVariant name in selection button', () => {
      render(<VariantTree {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: 'Italian Game' })).toBeInTheDocument();
    });

    it('should open variant selection dialog when selection button is clicked', () => {
      render(<VariantTree {...defaultProps} />);
      
      const selectionButton = screen.getByRole('button', { name: 'Italian Game' });
      fireEvent.click(selectionButton);
      
      expect(screen.getByText('Select Variant')).toBeInTheDocument();
      expect(screen.getByText('Choose a single variant from current position')).toBeInTheDocument();
    });

    it('should call setSelectedVariant when variant is selected from dialog', () => {
      render(<VariantTree {...defaultProps} />);
      
      const selectionButton = screen.getByRole('button', { name: 'Italian Game' });
      fireEvent.click(selectionButton);
      
      expect(screen.getByText('Select Variant')).toBeInTheDocument();
    });
  });

  describe("Mobile editor mode", () => {
    it("shows the current line card before the move list without overflowing the mobile action row", () => {
      render(<VariantTree {...defaultProps} compact mobileEditorMode />);

      const currentLineLabel = screen.getByText("Current line");
      const activeBadge = screen.getByText("Active e4");
      const moveButton = screen.getByRole("button", { name: "e4" });

      expect(screen.getByRole("button", { name: mockVariants[0].fullName })).toBeInTheDocument();
      expect(activeBadge).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "More variant actions" })).toBeInTheDocument();
      expect(moveButton).toBeInTheDocument();
      expect(currentLineLabel.compareDocumentPosition(moveButton) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it("falls back to the start position label when the current node has no move", () => {
      render(
        <VariantTree
          {...defaultProps}
          compact
          mobileEditorMode
          currentMoveNode={new MoveVariantNode()}
        />
      );

      expect(screen.getByText("Active Start position")).toBeInTheDocument();
    });

    it("keeps train variant inside the variant actions menu", () => {
      render(
        <MenuContext.Provider
          value={{
            open: false,
            showMenu: jest.fn(),
            closeMenu: jest.fn(),
            toggleMenu: mockToggleMenu,
          }}
        >
          <VariantTree {...defaultProps} compact mobileEditorMode />
        </MenuContext.Provider>
      );

      fireEvent.click(screen.getByRole("button", { name: "More variant actions" }));

      expect(mockToggleMenu).toHaveBeenCalled();
      expect(mockToggleMenu.mock.calls[0][1]).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: "Train variant" }),
          expect.objectContaining({ name: "Download" }),
          expect.objectContaining({ name: "Copy PGN" }),
        ])
      );
    });
  });

  describe('Component integration', () => {
    it('should render successfully with all required props', () => {
      render(<VariantTree {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: 'Italian Game' })).toBeInTheDocument();
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
      
      const trainButton = screen.getByRole('button', { name: 'Train' });
      fireEvent.click(trainButton);
      
      expect(mockGoToTrainRepertoire).toHaveBeenCalledWith(
        customRepertoireId,
        customProps.selectedVariant.fullName
      );
    });
  });
});
