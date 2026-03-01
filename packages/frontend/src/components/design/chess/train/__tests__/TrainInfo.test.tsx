import React from 'react';
import { render, screen, fireEvent, waitFor, RenderOptions } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import TrainInfo from '../TrainInfo';
import { TrainVariant } from '../../../../../models/chess.models';
import { MoveVariantNode } from '../../../../../models/VariantNode';
import { Turn } from '@chess-opening-master/common';
import * as pgnUtils from '../../../../../utils/chess/pgn/pgn.utils';

const RouterWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

const renderWithRouter = (ui: React.ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: RouterWrapper, ...options });

const mockGoToRepertoire = jest.fn();

jest.mock('../../../../../utils/navigationUtils', () => ({
  useNavigationUtils: () => ({
    goToRepertoire: mockGoToRepertoire,
  }),
}));

jest.mock('../../../../../utils/chess/pgn/pgn.utils', () => ({
  variantToPgn: jest.fn(),
}));

jest.mock('../../../../../utils/chess/variants/getMovementsFromVariants', () => ({
  getMovementsFromVariant: jest.fn(() => ['e4', 'e5', 'Nf3']),
}));

Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

const mockCurrentMoveNode = new MoveVariantNode();
mockCurrentMoveNode.id = 'test-node';

const createMockTrainVariant = (state: 'inProgress' | 'finished', fullName: string): TrainVariant => ({
  state,
  variant: {
    fullName,
    name: fullName,
    moves: [mockCurrentMoveNode],
    differentMoves: '',
  },
});

const defaultProps = {
  turn: 'white' as Turn,
  isYourTurn: true,
  trainVariants: [
    createMockTrainVariant('finished', 'Sicilian Defense'),
    createMockTrainVariant('inProgress', 'French Defense'),
    createMockTrainVariant('inProgress', 'Caro-Kann Defense'),
  ],
  finishedTrain: false,
  lastTrainVariant: createMockTrainVariant('finished', 'Italian Game'),
  currentMoveNode: mockCurrentMoveNode,
  repertoireId: 'test-repertoire-id',
  onHintReveal: jest.fn(),
};

describe('TrainInfo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with basic props', () => {
    renderWithRouter(<TrainInfo {...defaultProps} />);
    
    expect(screen.getByText('Your turn')).toBeInTheDocument();
    expect(screen.getByText('Play one of your allowed moves according to your repertoire.')).toBeInTheDocument();
    expect(screen.getByText('1 of 3 variants')).toBeInTheDocument();
    expect(screen.getByText('Available Variants to Play')).toBeInTheDocument();
  });

  it('displays last finished variant section when lastTrainVariant is provided', () => {
    renderWithRouter(<TrainInfo {...defaultProps} />);
    
    expect(screen.getByText('Last Finished Variant')).toBeInTheDocument();
    expect(screen.getByText('Italian Game')).toBeInTheDocument();
    expect(screen.getByText('Copy PGN')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  it('does not display last finished variant section when lastTrainVariant is undefined', () => {
    const propsWithoutLastVariant = {
      ...defaultProps,
      lastTrainVariant: undefined,
    };
    
    renderWithRouter(<TrainInfo {...propsWithoutLastVariant} />);
    
    expect(screen.queryByText('Last Finished Variant')).not.toBeInTheDocument();
    expect(screen.queryByText('Copy PGN')).not.toBeInTheDocument();
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
  });

  it('calls goToRepertoire with correct parameters when Edit button is clicked', () => {
    renderWithRouter(<TrainInfo {...defaultProps} />);
    
    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);
    
    expect(mockGoToRepertoire).toHaveBeenCalledTimes(1);
    expect(mockGoToRepertoire).toHaveBeenCalledWith('test-repertoire-id', 'Italian Game');
  });

  it('does not call goToRepertoire when Edit button is clicked and lastTrainVariant is undefined', () => {
    const propsWithoutLastVariant = {
      ...defaultProps,
      lastTrainVariant: undefined,
    };
    
    renderWithRouter(<TrainInfo {...propsWithoutLastVariant} />);
    
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    expect(mockGoToRepertoire).not.toHaveBeenCalled();
  });

  it('calls variantToPgn and copies to clipboard when Copy PGN button is clicked', async () => {
    const mockPgn = '1. e4 e5 2. Nf3';
    const mockedPgnUtils = pgnUtils as jest.Mocked<typeof pgnUtils>;
    mockedPgnUtils.variantToPgn.mockResolvedValue(mockPgn);
    
    renderWithRouter(<TrainInfo {...defaultProps} />);
    
    const copyButton = screen.getByText('Copy PGN');
    fireEvent.click(copyButton);
    
    await waitFor(() => {
      expect(mockedPgnUtils.variantToPgn).toHaveBeenCalledTimes(1);
      expect(mockedPgnUtils.variantToPgn).toHaveBeenCalledWith(
        (defaultProps.lastTrainVariant as TrainVariant).variant,
        defaultProps.turn,
        expect.any(Date)
      );
    });
    
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockPgn);
    });
  });

  it('displays correct turn information when it is your turn', () => {
    renderWithRouter(<TrainInfo {...defaultProps} />);
    
    expect(screen.getByText('Your turn')).toBeInTheDocument();
    expect(screen.getByAltText('white king')).toBeInTheDocument();
  });

  it('displays correct turn information when it is opponent turn', () => {
    const opponentTurnProps = {
      ...defaultProps,
      isYourTurn: false,
      turn: 'black' as Turn,
    };
    
    renderWithRouter(<TrainInfo {...opponentTurnProps} />);
    
    expect(screen.getByText("Opponent's turn")).toBeInTheDocument();
    expect(screen.getByText('Wait for your opponent to play.')).toBeInTheDocument();
    expect(screen.getByAltText('black king')).toBeInTheDocument();
  });

  it('displays finished training state correctly', () => {
    const finishedProps = {
      ...defaultProps,
      finishedTrain: true,
    };
    
    renderWithRouter(<TrainInfo {...finishedProps} />);
    
    expect(screen.getByText('Finished Training')).toBeInTheDocument();
    expect(screen.queryByAltText('white king')).not.toBeInTheDocument();
    expect(screen.queryByText('Play one of your allowed moves according to your repertoire.')).not.toBeInTheDocument();
  });

  it('displays progress bar with correct percentage', () => {
    renderWithRouter(<TrainInfo {...defaultProps} />);
    
    const progressBar = document.querySelector('.bg-accent.h-2\\.5.rounded-full');
    expect(progressBar).toHaveStyle('width: 33.33333333333333%');
  });

  it('displays available variants to play', () => {
    renderWithRouter(<TrainInfo {...defaultProps} />);
    
    expect(screen.getByText('French Defense')).toBeInTheDocument();
    expect(screen.getByText('Caro-Kann Defense')).toBeInTheDocument();
    expect(screen.queryByText('Sicilian Defense')).not.toBeInTheDocument();
  });

  it('expands variant disclosure to show moves when clicked', () => {
    renderWithRouter(<TrainInfo {...defaultProps} />);
    
    const frenchDefenseButton = screen.getByText('French Defense');
    fireEvent.click(frenchDefenseButton);
    
    expect(screen.getByText('e4')).toBeInTheDocument();
    expect(screen.getByText('e5')).toBeInTheDocument();
    expect(screen.getByText('Nf3')).toBeInTheDocument();
  });

  it('calls onHintReveal when expanding available variant moves', () => {
    renderWithRouter(<TrainInfo {...defaultProps} />);

    const frenchDefenseButton = screen.getByText('French Defense');
    fireEvent.click(frenchDefenseButton);

    expect(defaultProps.onHintReveal).toHaveBeenCalledTimes(1);
  });

  it('collapses expanded moves after next move is played', () => {
    const { rerender } = renderWithRouter(<TrainInfo {...defaultProps} />);

    const frenchDefenseButton = screen.getByText('French Defense');
    fireEvent.click(frenchDefenseButton);
    expect(screen.getByText('e4')).toBeInTheDocument();

    const nextMoveNode = new MoveVariantNode();
    nextMoveNode.id = 'next-node';
    nextMoveNode.position = 1;

    rerender(
      <TrainInfo
        {...defaultProps}
        currentMoveNode={nextMoveNode}
      />
    );

    expect(screen.queryByText('e4')).not.toBeInTheDocument();
  });

  it('handles edge case with no available variants', () => {
    const noVariantsProps = {
      ...defaultProps,
      trainVariants: [
        createMockTrainVariant('finished', 'Sicilian Defense'),
        createMockTrainVariant('finished', 'French Defense'),
      ],
    };
    
    renderWithRouter(<TrainInfo {...noVariantsProps} />);
    
    expect(screen.getByText('2 of 2 variants')).toBeInTheDocument();
    expect(screen.queryByText('French Defense')).not.toBeInTheDocument();
    expect(screen.queryByText('Sicilian Defense')).not.toBeInTheDocument();
  });

  it('handles edge case with no train variants', () => {
    const noTrainVariantsProps = {
      ...defaultProps,
      trainVariants: [],
    };
    
    renderWithRouter(<TrainInfo {...noTrainVariantsProps} />);
    
    expect(screen.getByText('0 of 0 variants')).toBeInTheDocument();
  });

  it('locks available variants hints when assistance is disabled', () => {
    renderWithRouter(
      <TrainInfo
        {...defaultProps}
        assistEnabled={false}
        assistNotice="Focus mode: guidance remains locked until your first error."
      />
    );

    expect(
      screen.getByText('Focus mode: guidance remains locked until your first error.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Guidance unlocks after your first error in focus mode.')
    ).toBeInTheDocument();
    expect(screen.queryByText('French Defense')).not.toBeInTheDocument();
    expect(screen.queryByText('Caro-Kann Defense')).not.toBeInTheDocument();
  });

  it('shows unlocked assist notice when assistance is enabled', () => {
    renderWithRouter(
      <TrainInfo
        {...defaultProps}
        assistEnabled={true}
        assistNotice="Focus error detected. Review comments and use guidance to find the correct move."
      />
    );

    expect(
      screen.getByText('Focus error detected. Review comments and use guidance to find the correct move.')
    ).toBeInTheDocument();
    expect(screen.getByText('French Defense')).toBeInTheDocument();
  });

  it('hides available variants section when configured', () => {
    renderWithRouter(
      <TrainInfo
        {...defaultProps}
        showAvailableVariantsSection={false}
      />
    );

    expect(screen.queryByText('Available Variants to Play')).not.toBeInTheDocument();
    expect(screen.queryByText('French Defense')).not.toBeInTheDocument();
  });

  it('renders supplemental panel below main progress section', () => {
    renderWithRouter(
      <TrainInfo
        {...defaultProps}
        supplementalPanel={<div>Focus Assist Inline</div>}
      />
    );

    expect(screen.getByText('Focus Assist Inline')).toBeInTheDocument();
  });
});
