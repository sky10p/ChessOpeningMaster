import { renderHook } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';
import { useNavigationUtils } from './navigationUtils';
import { IRepertoire } from '@chess-opening-master/common';

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

const mockNavigate = jest.fn();

describe('useNavigationUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  });

  const mockRepertoire: IRepertoire = {
    _id: 'repertoire-123',
    name: 'Test Repertoire',
    moveNodes: {
      id: 'root',
      move: null,
      children: [],
    },
    orientation: 'white',
    order: 1,
  };

  describe('goToRepertoire', () => {
    it('should navigate to repertoire with string ID', () => {
      const { result } = renderHook(() => useNavigationUtils());

      result.current.goToRepertoire('test-repertoire-id');

      expect(mockNavigate).toHaveBeenCalledWith('/repertoire/test-repertoire-id');
    });

    it('should navigate to repertoire with IRepertoire object', () => {
      const { result } = renderHook(() => useNavigationUtils());

      result.current.goToRepertoire(mockRepertoire);

      expect(mockNavigate).toHaveBeenCalledWith('/repertoire/repertoire-123');
    });

    it('should navigate to repertoire with string ID and variant name', () => {
      const { result } = renderHook(() => useNavigationUtils());

      result.current.goToRepertoire('test-repertoire-id', 'Italian Game');

      expect(mockNavigate).toHaveBeenCalledWith('/repertoire/test-repertoire-id?variantName=Italian%20Game');
    });

    it('should navigate to repertoire with IRepertoire object and variant name', () => {
      const { result } = renderHook(() => useNavigationUtils());

      result.current.goToRepertoire(mockRepertoire, 'Sicilian Defense');

      expect(mockNavigate).toHaveBeenCalledWith('/repertoire/repertoire-123?variantName=Sicilian%20Defense');
    });

    it('should properly encode special characters in variant name', () => {
      const { result } = renderHook(() => useNavigationUtils());

      result.current.goToRepertoire('test-id', 'Queen\'s Gambit: Declined');

      expect(mockNavigate).toHaveBeenCalledWith('/repertoire/test-id?variantName=Queen\'s%20Gambit%3A%20Declined');
    });

    it('should handle empty variant name by not adding query parameter', () => {
      const { result } = renderHook(() => useNavigationUtils());

      result.current.goToRepertoire('test-id', '');

      expect(mockNavigate).toHaveBeenCalledWith('/repertoire/test-id');
    });
  });

  describe('goToTrainRepertoire', () => {
    it('should navigate to train repertoire with string ID', () => {
      const { result } = renderHook(() => useNavigationUtils());

      result.current.goToTrainRepertoire('test-repertoire-id');

      expect(mockNavigate).toHaveBeenCalledWith('/repertoire/train/test-repertoire-id');
    });

    it('should navigate to train repertoire with IRepertoire object', () => {
      const { result } = renderHook(() => useNavigationUtils());

      result.current.goToTrainRepertoire(mockRepertoire);

      expect(mockNavigate).toHaveBeenCalledWith('/repertoire/train/repertoire-123');
    });

    it('should navigate to train repertoire with string ID and variant name', () => {
      const { result } = renderHook(() => useNavigationUtils());

      result.current.goToTrainRepertoire('test-repertoire-id', 'Italian Game');

      expect(mockNavigate).toHaveBeenCalledWith('/repertoire/train/test-repertoire-id?variantName=Italian%20Game');
    });

    it('should navigate to train repertoire with IRepertoire object and variant name', () => {
      const { result } = renderHook(() => useNavigationUtils());

      result.current.goToTrainRepertoire(mockRepertoire, 'Sicilian Defense');

      expect(mockNavigate).toHaveBeenCalledWith('/repertoire/train/repertoire-123?variantName=Sicilian%20Defense');
    });

    it('should properly encode special characters in variant name for training', () => {
      const { result } = renderHook(() => useNavigationUtils());

      result.current.goToTrainRepertoire('test-id', 'Queen\'s Gambit: Declined');

      expect(mockNavigate).toHaveBeenCalledWith('/repertoire/train/test-id?variantName=Queen\'s%20Gambit%3A%20Declined');
    });
  });

  describe('goToTrainOpening', () => {
    it('should navigate to train opening detail route', () => {
      const { result } = renderHook(() => useNavigationUtils());

      result.current.goToTrainOpening('test-repertoire-id', 'Italian Game');

      expect(mockNavigate).toHaveBeenCalledWith('/train/repertoire/test-repertoire-id/opening/Italian%20Game');
    });
  });

  describe('resolveId functionality', () => {
    it('should correctly resolve ID from different repertoire objects', () => {
      const { result } = renderHook(() => useNavigationUtils());

      const repertoire1: IRepertoire = {
        _id: 'id-1',
        name: 'Repertoire 1',
        moveNodes: {
          id: 'root',
          move: null,
          children: [],
        },
        orientation: 'white',
        order: 1,
      };

      const repertoire2: IRepertoire = {
        _id: 'id-2',
        name: 'Repertoire 2',
        moveNodes: {
          id: 'root',
          move: null,
          children: [],
        },
        orientation: 'black',
        order: 2,
      };

      result.current.goToRepertoire(repertoire1);
      result.current.goToRepertoire(repertoire2);

      expect(mockNavigate).toHaveBeenNthCalledWith(1, '/repertoire/id-1');
      expect(mockNavigate).toHaveBeenNthCalledWith(2, '/repertoire/id-2');
    });

    it('should handle repertoire objects with disabled property', () => {
      const { result } = renderHook(() => useNavigationUtils());

      const disabledRepertoire: IRepertoire = {
        _id: 'disabled-id',
        name: 'Disabled Repertoire',
        moveNodes: {
          id: 'root',
          move: null,
          children: [],
        },
        orientation: 'white',
        order: 1,
        disabled: true,
      };

      result.current.goToRepertoire(disabledRepertoire);

      expect(mockNavigate).toHaveBeenCalledWith('/repertoire/disabled-id');
    });
  });

  describe('URL building edge cases', () => {
    it('should handle variant names with spaces and special characters', () => {
      const { result } = renderHook(() => useNavigationUtils());

      const specialVariantName = 'King\'s Indian: Four Pawns Attack & Other Lines';
      
      result.current.goToRepertoire('test-id', specialVariantName);

      expect(mockNavigate).toHaveBeenCalledWith('/repertoire/test-id?variantName=King\'s%20Indian%3A%20Four%20Pawns%20Attack%20%26%20Other%20Lines');
    });

    it('should handle variant names with Unicode characters', () => {
      const { result } = renderHook(() => useNavigationUtils());

      const unicodeVariantName = 'Réti Opening: Advance Variation';
      
      result.current.goToRepertoire('test-id', unicodeVariantName);

      expect(mockNavigate).toHaveBeenCalledWith('/repertoire/test-id?variantName=R%C3%A9ti%20Opening%3A%20Advance%20Variation');
    });

    it('should handle extremely long variant names', () => {
      const { result } = renderHook(() => useNavigationUtils());

      const longVariantName = 'Sicilian Defense: Accelerated Dragon, Maróczy Bind, Breyer Variation with Long Descriptive Name';
      
      result.current.goToRepertoire('test-id', longVariantName);

      expect(mockNavigate).toHaveBeenCalledWith('/repertoire/test-id?variantName=Sicilian%20Defense%3A%20Accelerated%20Dragon%2C%20Mar%C3%B3czy%20Bind%2C%20Breyer%20Variation%20with%20Long%20Descriptive%20Name');
    });
  });
});
