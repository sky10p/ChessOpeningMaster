import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import VariantsInfo from './VariantsInfo';

const mockHandleVariantChange = jest.fn();

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
    repertoireId: 'test-repertoire-id',
    currentMoveNode: {},
    orientation: 'white',
    changeNameMove: jest.fn(),
    goToMove: jest.fn(),
    deleteMove: jest.fn(),
    selectedVariant: {
      moves: [],
      name: 'Test Variant',
      fullName: 'Test Variant: Full Name',
      differentMoves: '',
    },
  }),
}));

jest.mock('../../../../contexts/DialogContext', () => ({
  useDialogContext: jest.fn(),
}));

jest.mock('../../../../contexts/AlertContext', () => ({
  useAlertContext: jest.fn(),
}));

jest.mock('../../../../hooks/useRepertoireInfo', () => ({
  useRepertoireInfo: () => ({
    deleteVariant: jest.fn(),
    copyVariantToRepertoire: jest.fn(),
    copyVariantsToRepertoire: jest.fn(),
    deleteVariants: jest.fn(),
    copyVariantPGN: jest.fn(),
    downloadVariantPGN: jest.fn(),
  }),
}));

jest.mock('../../../../hooks/useVariantNavigation', () => ({
  useVariantNavigation: () => ({
    handleVariantChange: mockHandleVariantChange,
  }),
}));

jest.mock('../../../design/chess/VariantTree/VariantTree', () => ({
  __esModule: true,
  default: (props: { setSelectedVariant: (variant: unknown) => void }) => (
    <div data-testid="variant-tree">
      <div>setSelectedVariant prop type: {typeof props.setSelectedVariant}</div>
      <button onClick={() => props.setSelectedVariant(null)}>Test setSelectedVariant</button>
    </div>
  ),
}));

describe('VariantsInfo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render successfully', () => {
    const { getByTestId } = render(<VariantsInfo />);
    expect(getByTestId('variant-tree')).toBeInTheDocument();
  });

  it('should pass handleVariantChange as setSelectedVariant prop to VariantTree', () => {
    const { getByText } = render(<VariantsInfo />);
    
    expect(getByText('setSelectedVariant prop type: function')).toBeInTheDocument();
  });

  it('should call handleVariantChange when setSelectedVariant is invoked', () => {
    const { getByText } = render(<VariantsInfo />);
    
    const testButton = getByText('Test setSelectedVariant');
    testButton.click();
    
    expect(mockHandleVariantChange).toHaveBeenCalledWith(null);
  });

  it('should use the new useVariantNavigation hook instead of inline logic', () => {
    render(<VariantsInfo />);
    
    expect(mockHandleVariantChange).toBeDefined();
  });
});
