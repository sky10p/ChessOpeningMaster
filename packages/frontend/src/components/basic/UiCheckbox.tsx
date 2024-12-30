import React from "react";

type CheckboxLabelFn = (checked: boolean) => string;

interface CheckboxProps {
  label?: string | CheckboxLabelFn;
  checked: boolean;
  indeterminate?: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const UiCheckbox: React.FC<CheckboxProps> = ({
  label,
  description,
  checked,
  indeterminate = false,
  onChange,
  className,
  style,
}) => {
  return (
    <label className={`inline-flex items-center cursor-pointer ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={() => onChange(!checked)}
        className="mr-2"
        ref={(el) => {
          if (el) {
            el.indeterminate = indeterminate;
          }
        }}
      />
      {label && (
        <span style={style}>{typeof label === "function" ? label(checked) : label}</span>
      )}
      {description && <p className="text-xs text-textLight">{description}</p>}
    </label>
  );
};
