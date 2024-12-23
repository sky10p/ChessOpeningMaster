import React, { useState } from 'react';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
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
    <footer>
      {isVisible && icons.length > 0 && (
        <TabGroup selectedIndex={selectedIndex} onChange={handleChange}>
          <TabList className="flex justify-around bg-gray-800 p-2">
            {icons.map((icon) => (
              <Tab key={icon.key} className={({ selected }) =>
                selected ? 'text-accent' : 'text-white'
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
