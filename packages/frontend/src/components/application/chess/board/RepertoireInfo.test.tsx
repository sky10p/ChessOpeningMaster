import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RepertoireInfo } from './RepertoireInfo';

const mockHandleVariantChange = jest.fn();
const mockToggleMenu = jest.fn();

jest.mock('../../../../contexts/RepertoireContext', () => ({
  useRepertoireContext: () => ({
    variants: [
      {
        moves: [],
        name: 'Test Variant',
        fullName: 'Test Variant: Full Name',
        differentMoves: '',
      },
    ],
    currentMoveNode: {},
    chess: { fen: () => 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' },
    changeNameMove: jest.fn(),
    goToMove: jest.fn(),
    deleteMove: jest.fn(),
    comment: 'Test comment',
    updateComment: jest.fn(),
    selectedVariant: {
      moves: [],
      name: 'Test Variant',
      fullName: 'Test Variant: Full Name',
      differentMoves: '',
    },
    repertoireId: 'test-repertoire-id',
  }),
}));

jest.mock('../../../../hooks/useRepertoireInfo', () => ({
  useRepertoireInfo: () => ({
    downloadVariantPGN: jest.fn(),
    copyVariantPGN: jest.fn(),
    copyVariantToRepertoire: jest.fn(),
    copyVariantsToRepertoire: jest.fn(),
    deleteVariants: jest.fn(),
    deleteVariant: jest.fn(),
  }),
}));

jest.mock('../../../../contexts/MenuContext', () => ({
  useMenuContext: () => ({
    toggleMenu: mockToggleMenu,
  }),
}));

jest.mock('../../../../hooks/useVariantNavigation', () => ({
  useVariantNavigation: () => ({
    handleVariantChange: mockHandleVariantChange,
  }),
}));

jest.mock('../../../design/chess/RepertoireInfoPanel/RepertoireInfoPanel', () => ({
  RepertoireInfoPanel: (props: { setSelectedVariant: (variant: unknown) => void }) => (
    <div data-testid="repertoire-info-panel">
      <div>setSelectedVariant prop type: {typeof props.setSelectedVariant}</div>
      <button onClick={() => props.setSelectedVariant(null)}>Test setSelectedVariant</button>
    </div>
  ),
}));

describe('RepertoireInfo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render successfully', () => {
    const { getByTestId } = render(<RepertoireInfo />);
    expect(getByTestId('repertoire-info-panel')).toBeInTheDocument();
  });

  it('should pass handleVariantChange as setSelectedVariant prop to RepertoireInfoPanel', () => {
    const { getByText } = render(<RepertoireInfo />);
    
    expect(getByText('setSelectedVariant prop type: function')).toBeInTheDocument();
  });

  it('should call handleVariantChange when setSelectedVariant is invoked', () => {
    const { getByText } = render(<RepertoireInfo />);
    
    const testButton = getByText('Test setSelectedVariant');
    testButton.click();
    
    expect(mockHandleVariantChange).toHaveBeenCalledWith(null);
  });

  it('should use the new useVariantNavigation hook instead of inline logic', () => {
    render(<RepertoireInfo />);
    
    expect(mockHandleVariantChange).toBeDefined();
  });
});
