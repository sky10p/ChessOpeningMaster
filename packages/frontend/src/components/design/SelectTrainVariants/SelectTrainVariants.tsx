import React, { useRef, useEffect } from "react";
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/24/solid';
import { GroupedVariant } from "./models";
import { VariantsProgressBar } from './VariantsProgressBar';
import { getTextColor } from "./utils";
import { TrainVariantInfo } from "../../../models/chess.models";

interface SelectTrainVariantProps {
  variantName: string;
  subvariants: GroupedVariant[];
  variantsInfo: Record<string, TrainVariantInfo>;
  isGroupSelected: (groupName: string) => boolean;
  isSomeOfGroupSelected: (groupName: string) => boolean;
  handleSelectAllGroup: (groupName: string) => void;
  isCheckedVariant: (variantIndex: number) => boolean;
  handleToggleVariant: (variantIndex: number) => void;
}

export const SelectTrainVariants: React.FC<SelectTrainVariantProps> = ({
  variantName,
  subvariants,
  isGroupSelected,
  isSomeOfGroupSelected,
  handleSelectAllGroup,
  isCheckedVariant,
  handleToggleVariant,
  variantsInfo,
}) => {
  const parentCheckboxRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (parentCheckboxRef.current) {
      parentCheckboxRef.current.indeterminate =
        isSomeOfGroupSelected(variantName) && !isGroupSelected(variantName);
    }
  }, [variantName, isSomeOfGroupSelected, isGroupSelected]);

  return (
    <Disclosure>
      <DisclosureButton
        as="div"
        className="w-full flex items-center justify-between p-3 border rounded-md bg-primary text-textLight"
        onClick={(event) => {
          if (subvariants.length <= 1) {
            event.stopPropagation();
          }
        }}
      >
        <div onClick={(e) => e.stopPropagation()}>
          <label className="inline-flex items-center cursor-pointer">
            <input
              ref={parentCheckboxRef}
              type="checkbox"
              checked={isGroupSelected(variantName)}
              onChange={() => handleSelectAllGroup(variantName)}
              className="mr-2"
            />
            <span>{variantName}</span>
          </label>
          <VariantsProgressBar variants={subvariants} variantInfo={variantsInfo} />
        </div>
        {subvariants.length > 1 && (<ChevronUpIcon className="w-5 h-5 text-accent transition-transform ui-open:rotate-180" />
        )}
      </DisclosureButton>
      {subvariants.length > 1 && (
        <DisclosurePanel className="mt-2">
          <div className="flex flex-col ml-3 bg-background p-2 text-textLight">
            {subvariants.map((subvariant) => (
              <label key={subvariant.originalIndex} className="inline-flex items-center mb-1">
                <input
                  type="checkbox"
                  checked={isCheckedVariant(subvariant.originalIndex)}
                  onChange={() => handleToggleVariant(subvariant.originalIndex)}
                  className="mr-2"
                />
                <span style={{ color: getTextColor(subvariant, variantsInfo) }}>
                  {subvariant.variant.fullName}
                </span>
              </label>
            ))}
          </div>
        </DisclosurePanel>
      )}
    </Disclosure>
  );
};
