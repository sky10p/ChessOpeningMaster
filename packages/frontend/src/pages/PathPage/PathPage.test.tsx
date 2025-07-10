import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useNavigate } from 'react-router-dom';
import PathPage from './PathPage';
import { usePaths } from '../../hooks/usePaths';
import { useDialogContext } from '../../contexts/DialogContext';
import { useNavigationUtils } from '../../utils/navigationUtils';
import { StudyPath, StudiedVariantPath, NewVariantPath, EmptyPath } from '@chess-opening-master/common';

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

jest.mock('../../hooks/usePaths', () => ({
  usePaths: jest.fn(),
}));

jest.mock('../../contexts/DialogContext', () => ({
  useDialogContext: jest.fn(),
}));

jest.mock('../../utils/navigationUtils', () => ({
  useNavigationUtils: jest.fn(),
}));

const mockNavigate = jest.fn();
const mockGoToRepertoire = jest.fn();
const mockGoToTrainRepertoire = jest.fn();
const mockLoadPath = jest.fn();
const mockRemoveVariantFromPath = jest.fn();
const mockShowConfirmDialog = jest.fn();

const mockUsePaths = {
  path: null,
  loading: false,
  error: null,
  loadPath: mockLoadPath,
  removeVariantFromPath: mockRemoveVariantFromPath,
};

const mockUseDialogContext = {
  showConfirmDialog: mockShowConfirmDialog,
};

const mockUseNavigationUtils = {
  goToRepertoire: mockGoToRepertoire,
  goToTrainRepertoire: mockGoToTrainRepertoire,
};

describe('PathPage Navigation Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (usePaths as jest.Mock).mockReturnValue(mockUsePaths);
    (useDialogContext as jest.Mock).mockReturnValue(mockUseDialogContext);
    (useNavigationUtils as jest.Mock).mockReturnValue(mockUseNavigationUtils);
  });

  describe('goToStudy functionality', () => {
    it('should navigate to study page with correct parameters when path is StudyPath', async () => {
      const studyPath: StudyPath = {
        type: 'study',
        groupId: 'test-group-123',
        studyId: 'test-study-456',
        name: 'Test Study',
        lastSession: '2023-01-01',
      };

      (usePaths as jest.Mock).mockReturnValue({
        ...mockUsePaths,
        path: studyPath,
      });

      render(<PathPage />);

      const goToStudyButton = screen.getByText('Go to Study');
      fireEvent.click(goToStudyButton);

      expect(mockNavigate).toHaveBeenCalledWith('/studies?groupId=test-group-123&studyId=test-study-456');
    });

    it('should encode special characters in groupId and studyId', async () => {
      const studyPath: StudyPath = {
        type: 'study',
        groupId: 'test group & special chars',
        studyId: 'test study: with colon',
        name: 'Test Study',
        lastSession: '2023-01-01',
      };

      (usePaths as jest.Mock).mockReturnValue({
        ...mockUsePaths,
        path: studyPath,
      });

      render(<PathPage />);

      const goToStudyButton = screen.getByText('Go to Study');
      fireEvent.click(goToStudyButton);

      expect(mockNavigate).toHaveBeenCalledWith('/studies?groupId=test%20group%20%26%20special%20chars&studyId=test%20study%3A%20with%20colon');
    });

    it('should not navigate when path is not StudyPath', () => {
      const variantPath: StudiedVariantPath = {
        type: 'variant',
        id: 'variant-123',
        repertoireId: 'repertoire-456',
        repertoireName: 'Test Repertoire',
        name: 'Test Variant',
        errors: 0,
        lastDate: new Date(),
      };

      (usePaths as jest.Mock).mockReturnValue({
        ...mockUsePaths,
        path: variantPath,
      });

      render(<PathPage />);

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('goToTrainVariant functionality', () => {
    it('should call goToTrainRepertoire with correct parameters for StudiedVariantPath', async () => {
      const studiedVariantPath: StudiedVariantPath = {
        type: 'variant',
        id: 'variant-123',
        repertoireId: 'repertoire-456',
        repertoireName: 'Test Repertoire',
        name: 'Sicilian Defense',
        errors: 2,
        lastDate: new Date(),
      };

      (usePaths as jest.Mock).mockReturnValue({
        ...mockUsePaths,
        path: studiedVariantPath,
      });

      render(<PathPage />);

      const trainButton = screen.getByText('Start Training');
      fireEvent.click(trainButton);

      expect(mockGoToTrainRepertoire).toHaveBeenCalledWith('repertoire-456', 'Sicilian Defense');
    });

    it('should call goToTrainRepertoire with correct parameters for NewVariantPath', async () => {
      const newVariantPath: NewVariantPath = {
        type: 'newVariant',
        repertoireId: 'repertoire-789',
        repertoireName: 'New Repertoire',
        name: 'Italian Game',
      };

      (usePaths as jest.Mock).mockReturnValue({
        ...mockUsePaths,
        path: newVariantPath,
      });

      render(<PathPage />);

      const trainButton = screen.getByText('Start Training');
      fireEvent.click(trainButton);

      expect(mockGoToTrainRepertoire).toHaveBeenCalledWith('repertoire-789', 'Italian Game');
    });

    it('should handle variant names with special characters', async () => {
      const studiedVariantPath: StudiedVariantPath = {
        type: 'variant',
        id: 'variant-123',
        repertoireId: 'repertoire-456',
        repertoireName: 'Test Repertoire',
        name: 'Queen\'s Gambit: Declined',
        errors: 1,
        lastDate: new Date(),
      };

      (usePaths as jest.Mock).mockReturnValue({
        ...mockUsePaths,
        path: studiedVariantPath,
      });

      render(<PathPage />);

      const trainButton = screen.getByText('Start Training');
      fireEvent.click(trainButton);

      expect(mockGoToTrainRepertoire).toHaveBeenCalledWith('repertoire-456', 'Queen\'s Gambit: Declined');
    });

    it('should not call goToTrainRepertoire for StudyPath', () => {
      const studyPath: StudyPath = {
        type: 'study',
        groupId: 'test-group-123',
        studyId: 'test-study-456',
        name: 'Test Study',
        lastSession: '2023-01-01',
      };

      (usePaths as jest.Mock).mockReturnValue({
        ...mockUsePaths,
        path: studyPath,
      });

      render(<PathPage />);

      expect(mockGoToTrainRepertoire).not.toHaveBeenCalled();
    });
  });

  describe('goToReviewVariant functionality', () => {
    it('should call goToRepertoire with correct parameters for StudiedVariantPath', async () => {
      const studiedVariantPath: StudiedVariantPath = {
        type: 'variant',
        id: 'variant-123',
        repertoireId: 'repertoire-456',
        repertoireName: 'Test Repertoire',
        name: 'French Defense',
        errors: 3,
        lastDate: new Date(),
      };

      (usePaths as jest.Mock).mockReturnValue({
        ...mockUsePaths,
        path: studiedVariantPath,
      });

      render(<PathPage />);

      const reviewButton = screen.getByText('Start Review');
      fireEvent.click(reviewButton);

      expect(mockGoToRepertoire).toHaveBeenCalledWith('repertoire-456', 'French Defense');
    });

    it('should call goToRepertoire with correct parameters for NewVariantPath', async () => {
      const newVariantPath: NewVariantPath = {
        type: 'newVariant',
        repertoireId: 'repertoire-789',
        repertoireName: 'New Repertoire',
        name: 'Caro-Kann Defense',
      };

      (usePaths as jest.Mock).mockReturnValue({
        ...mockUsePaths,
        path: newVariantPath,
      });

      render(<PathPage />);

      const reviewButton = screen.getByText('Start Review');
      fireEvent.click(reviewButton);

      expect(mockGoToRepertoire).toHaveBeenCalledWith('repertoire-789', 'Caro-Kann Defense');
    });

    it('should handle variant names with Unicode characters', async () => {
      const studiedVariantPath: StudiedVariantPath = {
        type: 'variant',
        id: 'variant-123',
        repertoireId: 'repertoire-456',
        repertoireName: 'Test Repertoire',
        name: 'Réti Opening',
        errors: 0,
        lastDate: new Date(),
      };

      (usePaths as jest.Mock).mockReturnValue({
        ...mockUsePaths,
        path: studiedVariantPath,
      });

      render(<PathPage />);

      const reviewButton = screen.getByText('Start Review');
      fireEvent.click(reviewButton);

      expect(mockGoToRepertoire).toHaveBeenCalledWith('repertoire-456', 'Réti Opening');
    });

    it('should not call goToRepertoire for StudyPath', () => {
      const studyPath: StudyPath = {
        type: 'study',
        groupId: 'test-group-123',
        studyId: 'test-study-456',
        name: 'Test Study',
        lastSession: '2023-01-01',
      };

      (usePaths as jest.Mock).mockReturnValue({
        ...mockUsePaths,
        path: studyPath,
      });

      render(<PathPage />);

      expect(mockGoToRepertoire).not.toHaveBeenCalled();
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle null path gracefully', () => {
      (usePaths as jest.Mock).mockReturnValue({
        ...mockUsePaths,
        path: null,
      });

      render(<PathPage />);

      expect(mockNavigate).not.toHaveBeenCalled();
      expect(mockGoToRepertoire).not.toHaveBeenCalled();
      expect(mockGoToTrainRepertoire).not.toHaveBeenCalled();
    });

    it('should handle EmptyPath without navigation', () => {
      const emptyPath: EmptyPath = {
        message: 'All caught up!',
      };

      (usePaths as jest.Mock).mockReturnValue({
        ...mockUsePaths,
        path: emptyPath,
      });

      render(<PathPage />);

      expect(mockNavigate).not.toHaveBeenCalled();
      expect(mockGoToRepertoire).not.toHaveBeenCalled();
      expect(mockGoToTrainRepertoire).not.toHaveBeenCalled();
    });

    it('should handle extremely long variant names', async () => {
      const longVariantName = 'Sicilian Defense: Accelerated Dragon, Maróczy Bind, Breyer Variation with Extremely Long Descriptive Name That Tests URL Encoding';
      
      const studiedVariantPath: StudiedVariantPath = {
        type: 'variant',
        id: 'variant-123',
        repertoireId: 'repertoire-456',
        repertoireName: 'Test Repertoire',
        name: longVariantName,
        errors: 1,
        lastDate: new Date(),
      };

      (usePaths as jest.Mock).mockReturnValue({
        ...mockUsePaths,
        path: studiedVariantPath,
      });

      render(<PathPage />);

      const reviewButton = screen.getByText('Start Review');
      fireEvent.click(reviewButton);

      expect(mockGoToRepertoire).toHaveBeenCalledWith('repertoire-456', longVariantName);
    });

    it('should handle empty string variant names', async () => {
      const studiedVariantPath: StudiedVariantPath = {
        type: 'variant',
        id: 'variant-123',
        repertoireId: 'repertoire-456',
        repertoireName: 'Test Repertoire',
        name: '',
        errors: 0,
        lastDate: new Date(),
      };

      (usePaths as jest.Mock).mockReturnValue({
        ...mockUsePaths,
        path: studiedVariantPath,
      });

      render(<PathPage />);

      const reviewButton = screen.getByText('Start Review');
      fireEvent.click(reviewButton);

      expect(mockGoToRepertoire).toHaveBeenCalledWith('repertoire-456', '');
    });
  });

  describe('Integration with path type guards', () => {
    it('should correctly identify and handle StudyPath', () => {
      const studyPath: StudyPath = {
        type: 'study',
        groupId: 'integration-test',
        studyId: 'study-integration',
        name: 'Integration Test Study',
        lastSession: '2023-01-01',
      };

      (usePaths as jest.Mock).mockReturnValue({
        ...mockUsePaths,
        path: studyPath,
      });

      render(<PathPage />);

      expect(screen.getByText('Study to Review')).toBeInTheDocument();
      expect(screen.getByText('Go to Study')).toBeInTheDocument();
    });

    it('should correctly identify and handle StudiedVariantPath', () => {
      const studiedVariantPath: StudiedVariantPath = {
        type: 'variant',
        id: 'variant-integration',
        repertoireId: 'repertoire-integration',
        repertoireName: 'Integration Test Repertoire',
        name: 'Integration Test Variant',
        errors: 1,
        lastDate: new Date(),
      };

      (usePaths as jest.Mock).mockReturnValue({
        ...mockUsePaths,
        path: studiedVariantPath,
      });

      render(<PathPage />);

      expect(screen.getByText('Repertoire to review: Integration Test Repertoire')).toBeInTheDocument();
      expect(screen.getByText('Start Review')).toBeInTheDocument();
      expect(screen.getByText('Start Training')).toBeInTheDocument();
    });

    it('should correctly identify and handle NewVariantPath', () => {
      const newVariantPath: NewVariantPath = {
        type: 'newVariant',
        repertoireId: 'repertoire-new',
        repertoireName: 'New Integration Repertoire',
        name: 'New Integration Variant',
      };

      (usePaths as jest.Mock).mockReturnValue({
        ...mockUsePaths,
        path: newVariantPath,
      });

      render(<PathPage />);

      expect(screen.getByText('New Repertoire to learn: New Integration Repertoire')).toBeInTheDocument();
      expect(screen.getByText('Start Review')).toBeInTheDocument();
      expect(screen.getByText('Start Training')).toBeInTheDocument();
    });
  });

  describe('Button interaction flows', () => {
    it('should handle multiple clicks on navigation buttons', async () => {
      const studiedVariantPath: StudiedVariantPath = {
        type: 'variant',
        id: 'variant-123',
        repertoireId: 'repertoire-456',
        repertoireName: 'Test Repertoire',
        name: 'Test Variant',
        errors: 1,
        lastDate: new Date(),
      };

      (usePaths as jest.Mock).mockReturnValue({
        ...mockUsePaths,
        path: studiedVariantPath,
      });

      render(<PathPage />);

      const reviewButton = screen.getByText('Start Review');
      const trainButton = screen.getByText('Start Training');

      fireEvent.click(reviewButton);
      fireEvent.click(trainButton);
      fireEvent.click(reviewButton);

      expect(mockGoToRepertoire).toHaveBeenCalledTimes(2);
      expect(mockGoToTrainRepertoire).toHaveBeenCalledTimes(1);
    });

    it('should handle study button clicks correctly', async () => {
      const studyPath: StudyPath = {
        type: 'study',
        groupId: 'test-group',
        studyId: 'test-study',
        name: 'Test Study',
        lastSession: '2023-01-01',
      };

      (usePaths as jest.Mock).mockReturnValue({
        ...mockUsePaths,
        path: studyPath,
      });

      render(<PathPage />);

      const studyButton = screen.getByText('Go to Study');
      
      fireEvent.click(studyButton);
      fireEvent.click(studyButton);

      expect(mockNavigate).toHaveBeenCalledTimes(2);
      expect(mockNavigate).toHaveBeenCalledWith('/studies?groupId=test-group&studyId=test-study');
    });
  });
});
