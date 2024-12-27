import React from 'react';
import Footer from '../../design/Footer/Footer';
import { useFooterState } from '../../../contexts/FooterContext';

const FooterContainer = () => {
  const {isVisible, icons} = useFooterState();

  return (
    <Footer isVisible={isVisible} icons={icons} />
  );
};

export default FooterContainer;
