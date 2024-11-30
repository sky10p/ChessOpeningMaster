import React, { useState } from 'react';
import { BottomNavigation, BottomNavigationAction, useTheme } from '@mui/material';
import { useFooterContext } from '../../../contexts/FooterContext';

const Footer = () => {
  const theme = useTheme();
  const {isVisible, icons} = useFooterContext();

  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    icons[newValue].onClick();
    setValue(newValue);
  };

  return (
    <footer>
      {isVisible && icons.length > 0 && <BottomNavigation
      value={value}
      onChange={handleChange}
      showLabels
      sx={{backgroundColor: 'background.default' }}
    >
      {icons.map((icon) => (
      <BottomNavigationAction key={icon.key} label={icon.label} icon={icon.icon} sx={{
          '&.Mui-selected': {
            color: theme.palette.secondary.main,
          },
        }}  />
      ))}
    </BottomNavigation> }
     
    </footer>
  );
};

export default Footer;
