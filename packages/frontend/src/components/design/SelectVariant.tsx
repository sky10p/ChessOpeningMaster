import React from "react";
import { Variant } from "../../models/chess.models";

interface SelectVariantProps {
  variants: Variant[];
  selectedVariant: Variant;
  onSelectVariant: (variant: Variant) => void;
}

export const SelectVariant: React.FC<SelectVariantProps> = ({
  variants,
  selectedVariant,
  onSelectVariant,
}) => {
  const groupedVariants = variants.reduce((acc, variant) => {
    if (!acc[variant.name]) {
      acc[variant.name] = [];
    }
    acc[variant.name].push(variant);
    return acc;
  }, {} as Record<string, Variant[]>);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const variant = variants.find(
      (variant) => variant.fullName === event.target.value
    );
    if (variant) {
      onSelectVariant(variant);
    }
  };

  const validVariant = variants.find(
    (variant) => variant.fullName === selectedVariant.fullName
  );
  const selectedValue = validVariant ? selectedVariant.fullName : "";

  return (
    <div className="w-full">
      <label htmlFor="select-variant" className="block text-sm font-medium text-textLight">
        Variant
      </label>
      <select
        id="select-variant"
        value={selectedValue}
        onChange={handleChange}
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-secondary bg-gray-500 text-textLight focus:outline-none focus:ring-accent focus:border-accent sm:text-sm rounded-md"
      >
        {Object.keys(groupedVariants)
          .sort()
          .flatMap((name) => [
            <optgroup key={`header-${name}`} label={name} className="bg-secondary text-textLight font-bold text-lg">
              {groupedVariants[name].map((variant) => (
                <option key={`item-${variant.fullName}`} value={variant.fullName} className="bg-gray-900 text-textLight text-base">
                  {variant.fullName}
                </option>
              ))}
            </optgroup>,
          ])}
      </select>
    </div>
  );
};
