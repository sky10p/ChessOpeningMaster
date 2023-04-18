import React from 'react';
import { Container, Typography } from '@mui/material';

const Footer = () => {
  return (
    <footer>
      <Container>
        <Typography variant="body1" align="center">
          To improve your chess openings © {new Date().getFullYear()}
        </Typography>
      </Container>
    </footer>
  );
};

export default Footer;
