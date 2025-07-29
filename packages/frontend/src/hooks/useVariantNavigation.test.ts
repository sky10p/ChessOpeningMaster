import { renderHook, act } from '@testing-library/react';
import { useVariantNavigation } from './useVariantNavigation';

const mockNavigate = jest.fn();
const mockSetSelectedVariant = jest.fn();
const mockInitBoard = jest.fn();

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(() => mockNavigate),
  useLocation: jest.fn(() => ({
    pathname: '/repertoire/test-id',
    search: '',
  })),
}));

jest.mock('../contexts/RepertoireContext', () => ({
  useRepertoireContext: jest.fn(() => ({
    setSelectedVariant: mockSetSelectedVariant,
    initBoard: mockInitBoard,
  })),
}));

describe('useVariantNavigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockVariant = (name: string, fullName: string) => ({
    moves: [],
    name,
    fullName,
    differentMoves: '',
  });

  describe('handleVariantChange', () => {
    it('should set selected variant and initialize board when variant is provided', async () => {
      const { result } = renderHook(() => useVariantNavigation());
      const variant = createMockVariant('Test Variant', 'Test Variant: Full Name');

      await act(async () => {
        result.current.handleVariantChange(variant);
      });

      expect(mockSetSelectedVariant).toHaveBeenCalledWith(variant);
      expect(mockInitBoard).toHaveBeenCalled();
    });

    it('should update URL with variant name when variant is provided', async () => {
      const { result } = renderHook(() => useVariantNavigation());
      const variant = createMockVariant('Test Variant', 'Test Variant: Full Name');

      await act(async () => {
        result.current.handleVariantChange(variant);
      });

      expect(mockNavigate).toHaveBeenCalledWith(
        '/repertoire/test-id?variantName=Test+Variant%3A+Full+Name',
        { replace: true }
      );
    });

    it('should remove variant name from URL when variant is null', async () => {
      const { result } = renderHook(() => useVariantNavigation());

      await act(async () => {
        result.current.handleVariantChange(null);
      });

      expect(mockSetSelectedVariant).toHaveBeenCalledWith(null);
      expect(mockInitBoard).toHaveBeenCalled();
    });

    it('should handle special characters in variant names', async () => {
      const { result } = renderHook(() => useVariantNavigation());
      const variant = createMockVariant("Queen's Gambit", "Queen's Gambit: Declined & Accepted");

      await act(async () => {
        result.current.handleVariantChange(variant);
      });

      expect(mockNavigate).toHaveBeenCalledWith(
        "/repertoire/test-id?variantName=Queen%27s+Gambit%3A+Declined+%26+Accepted",
        { replace: true }
      );
    });

    it('should handle variant with empty fullName', async () => {
      const { result } = renderHook(() => useVariantNavigation());
      const variant = createMockVariant('Test', '');

      await act(async () => {
        result.current.handleVariantChange(variant);
      });

      expect(mockSetSelectedVariant).toHaveBeenCalledWith(variant);
    });
  });
});
