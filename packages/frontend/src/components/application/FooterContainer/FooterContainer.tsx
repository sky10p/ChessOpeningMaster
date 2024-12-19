import React from 'react';
import { useFooterContext } from '../../../contexts/FooterContext';
import Footer from '../../design/Footer/Footer';

const FooterContainer = () => {
  const {isVisible, icons} = useFooterContext();

  return (
    <Footer isVisible={isVisible} icons={icons} />
  );
};

export default FooterContainer;
