import React, { useState } from 'react';
import { Tab, TabGroup, TabList } from '@headlessui/react';
import { FooterIcon } from './models';

interface FooterProps {
  isVisible: boolean;
  icons: FooterIcon[];
}

const Footer: React.FC<FooterProps> = ({
  isVisible,
  icons,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleChange = (index: number) => {
    icons[index].onClick();
    setSelectedIndex(index);
  };

  return (
    <footer className='md:hidden sticky bottom-0 z-50'>
      {isVisible && icons.length > 0 && (
        <TabGroup selectedIndex={selectedIndex} onChange={handleChange}>
          <TabList className="flex justify-around bg-surface-raised p-2 border-t border-border-default">
            {icons.map((icon) => (
              <Tab key={icon.key} className={({ selected }) =>
                selected ? 'text-accent' : 'text-text-muted'
              }>
                <div className="flex flex-col items-center">
                  {icon.icon}
                  <span>{icon.label}</span>
                </div>
              </Tab>
            ))}
          </TabList>
        </TabGroup>
      )}
    </footer>
  );
};

export default Footer;
