import React from 'react';

interface VariantsIconProps {
  className?: string;
}

const VariantsIcon: React.FC<VariantsIconProps> = ({
    className
}) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M22 11V3h-7v3H9V3H2v8h7V8h2v10h4v3h7v-8h-7v3h-2V8h2v3z"></path>
  </svg>
);

export default VariantsIcon;
