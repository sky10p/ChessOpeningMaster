import * as React from 'react';

interface Repertoire {
  id: number;
  name: string;
}

interface RepertoireItemProps {
  repertoire: Repertoire;
}

export const RepertoireItem: React.FC<RepertoireItemProps> = ({ repertoire }) => {
  return (
    <li>
      {repertoire.name}
    </li>
  );
};
