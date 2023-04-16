import React, { useCallback} from 'react';
import { Grid, useTheme } from '@mui/material';
import Board from './Board';

const BoardContainer: React.FC = () => {
  const theme = useTheme();

  const calcWidth = useCallback(({screenWidth}: {screenWidth: number}): number => {
    if (screenWidth >= theme.breakpoints.values.sm) {
      return (screenWidth * 35) / 100;
    } else {
      return (screenWidth * 90) / 100;
    }
  }, [theme.breakpoints.values.sm]);


  return (
    <Grid container>
      <Grid item>
        <Board calcWidth={calcWidth} />
      </Grid>
    </Grid>
  );
};

export default BoardContainer;
