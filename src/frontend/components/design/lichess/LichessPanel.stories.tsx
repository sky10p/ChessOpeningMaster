import React from 'react';
import { Story } from '@ladle/react';
import LichessPanel from './LichessPanel';

const Container: React.FC<{ width: string, children: React.ReactNode }> = ({ width, children }) => (
  <div style={{ width }}>
    {children}
  </div>
);

const defaultArgs = {
  fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', // Initial chess position
};

const customPositionArgs = {
  fen: 'r1bqkbnr/pppppppp/n7/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 2 2', // Custom position
};

export const LichessPanelStoryDefault: Story = () => (
  <Container width="400px">
    <LichessPanel {...defaultArgs} />
  </Container>
);

export const LichessPanelStoryCustomPosition: Story = () => (
  <Container width="400px">
    <LichessPanel {...customPositionArgs} />
  </Container>
);