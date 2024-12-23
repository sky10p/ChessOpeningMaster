import React from "react";
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
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

  const handleChange = (variant: Variant) => {
    onSelectVariant(variant);
  };

  const validVariant = variants.find(
    (variant) => variant.fullName === selectedVariant.fullName
  );
  const selectedValue = validVariant ? selectedVariant : variants[0];

  return (
    <div className="w-full">
      <label htmlFor="select-variant" className="block text-sm font-medium text-textLight">
        Variant
      </label>
      <Listbox value={selectedValue} onChange={handleChange}>
        <div className="relative mt-1">
          <ListboxButton className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-secondary bg-gray-500 text-textLight focus:outline-none focus:ring-accent focus:border-accent sm:text-sm rounded-md">
            {selectedValue.fullName}
          </ListboxButton>
          <ListboxOptions className="absolute mt-1 w-full bg-gray-500 text-textLight shadow-lg max-h-80 sm:max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm z-50">
            {Object.keys(groupedVariants)
              .sort()
              .flatMap((name) => [
                <div key={`header-${name}`} className="bg-secondary text-textLight font-bold text-lg px-4 py-2">
                  {name}
                </div>,
                groupedVariants[name].map((variant) => (
                  <ListboxOption
                    key={`item-${variant.fullName}`}
                    value={variant}
                    className={({ active }) =>
                      `cursor-default select-none relative py-4 pl-10 pr-4 ${
                        active ? "text-white bg-accent" : "text-textLight"
                      }`
                    }
                  >
                    {variant.fullName}
                  </ListboxOption>
                )),
              ])}
          </ListboxOptions>
        </div>
      </Listbox>
    </div>
  );
};
