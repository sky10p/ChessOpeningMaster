import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import HelpInfo from '../HelpInfo';
import { MoveVariantNode } from '../../../../../models/VariantNode';

jest.mock('../../../../application/chess/board/MoveNodeButtonWithActions', () => ({
  MoveNodeButtonWithActions: ({ move }: { move: MoveVariantNode }) => (
    <span>{move.id}</span>
  ),
}));

const createMoveNode = (id: string, position = 0): MoveVariantNode => {
  const node = new MoveVariantNode();
  node.id = id;
  node.position = position;
  return node;
};

describe('HelpInfo', () => {
  const moveA = createMoveNode('e2e4', 0);
  const moveB = createMoveNode('d2d4', 0);

  it('counts hint when available moves are revealed', () => {
    const onHintReveal = jest.fn();

    render(
      <HelpInfo
        allowedMoves={[moveA, moveB]}
        isYourTurn={true}
        currentMoveNode={createMoveNode('root', 0)}
        onHintReveal={onHintReveal}
      />
    );

    fireEvent.click(screen.getByLabelText('Toggle Available Moves'));

    expect(onHintReveal).toHaveBeenCalledTimes(1);
    expect(screen.getByText('e2e4')).toBeInTheDocument();
    expect(screen.getByText('d2d4')).toBeInTheDocument();
  });

  it('collapses after next move and counts again when expanded again', () => {
    const onHintReveal = jest.fn();
    const { rerender } = render(
      <HelpInfo
        allowedMoves={[moveA, moveB]}
        isYourTurn={true}
        currentMoveNode={createMoveNode('root', 0)}
        onHintReveal={onHintReveal}
      />
    );

    fireEvent.click(screen.getByLabelText('Toggle Available Moves'));
    expect(screen.getByText('e2e4')).toBeInTheDocument();

    rerender(
      <HelpInfo
        allowedMoves={[moveA, moveB]}
        isYourTurn={true}
        currentMoveNode={createMoveNode('next', 1)}
        onHintReveal={onHintReveal}
      />
    );

    expect(screen.queryByText('e2e4')).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Toggle Available Moves'));

    expect(onHintReveal).toHaveBeenCalledTimes(2);
    expect(screen.getByText('e2e4')).toBeInTheDocument();
  });

  it('keeps helps locked when assistance is disabled', () => {
    const onHintReveal = jest.fn();

    render(
      <HelpInfo
        allowedMoves={[moveA, moveB]}
        isYourTurn={true}
        currentMoveNode={createMoveNode('root', 0)}
        onHintReveal={onHintReveal}
        assistEnabled={false}
        assistNotice="Focus mode: guidance remains locked until your first error."
      />
    );

    expect(
      screen.getByText('Focus mode: guidance remains locked until your first error.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Hints unlock in focus mode after your first error.')
    ).toBeInTheDocument();
    expect(screen.queryByLabelText('Toggle Available Moves')).not.toBeInTheDocument();
    expect(screen.queryByText('e2e4')).not.toBeInTheDocument();
    expect(onHintReveal).not.toHaveBeenCalled();
  });
});
