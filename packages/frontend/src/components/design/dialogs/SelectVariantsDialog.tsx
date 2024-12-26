import React, { useEffect, useState, useMemo } from "react";
import { Variant } from "../../../models/chess.models";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  Description,
} from "@headlessui/react";
import { UiCheckbox } from "../../basic/UiCheckbox";

interface SelectVariantsDialogProps {
  open: boolean;
  title: string;
  contentText: string;
  variants: Variant[];
  onConfirm: (variants: Variant[]) => void;
  onClose: (isCancelled: boolean) => void;
  multiple?: boolean;
}

interface GroupedVariant extends Variant {
  originalIndex: number;
}

const SelectVariantsDialog: React.FC<SelectVariantsDialogProps> = ({
  open,
  title,
  contentText,
  variants,
  onConfirm,
  onClose,
  multiple = true,
}) => {
  const [selectedVariants, setSelectedVariants] = useState<Set<number>>(
    new Set()
  );
  const [filterText, setFilterText] = useState("");

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterText(event.target.value);
  };

  const groupedVariantsByName = useMemo(() => {
    return variants.reduce((groupedVariants, variant, index) => {
      const groupName = variant.name;
      if (!groupedVariants[groupName]) {
        groupedVariants[groupName] = [];
      }
      groupedVariants[groupName].push({ ...variant, originalIndex: index });
      return groupedVariants;
    }, {} as Record<string, GroupedVariant[]>);
  }, [variants]);

  const filteredGroupedVariantsByName = useMemo(() => {
    return Object.keys(groupedVariantsByName).reduce(
      (filteredGroups, groupName) => {
        const filteredVariants = groupedVariantsByName[groupName].filter(
          (variant) =>
            variant.fullName.toLowerCase().includes(filterText.toLowerCase())
        );
        if (filteredVariants.length > 0) {
          filteredGroups[groupName] = filteredVariants;
        }
        return filteredGroups;
      },
      {} as Record<string, GroupedVariant[]>
    );
  }, [groupedVariantsByName, filterText]);

  useEffect(() => {
    if (open) {
      setSelectedVariants(new Set());
      setFilterText("");
    }
  }, [open]);

  const handleToggleVariant = (variantIndex: number) => {
    if (multiple) {
      const newSelectedVariants = new Set(selectedVariants);
      if (newSelectedVariants.has(variantIndex)) {
        newSelectedVariants.delete(variantIndex);
      } else {
        newSelectedVariants.add(variantIndex);
      }
      setSelectedVariants(newSelectedVariants);
    } else {
      if (selectedVariants.has(variantIndex)) {
        setSelectedVariants(new Set());
      } else {
        setSelectedVariants(new Set([variantIndex]));
      }
    }
  };

  const handleSelectAll = () => {
    if (!multiple) return;
    if (selectedVariants.size === variants.length) {
      setSelectedVariants(new Set());
    } else {
      setSelectedVariants(new Set(variants.map((variant, index) => index)));
    }
  };

  const handleSelectAllGroup = (groupName: string) => {
    if (!multiple) return;
    const group = groupedVariantsByName[groupName];
    const newSelectedVariants = new Set(selectedVariants);
    if (isGroupSelected(groupName)) {
      group.forEach((variant) =>
        newSelectedVariants.delete(variant.originalIndex)
      );
    } else {
      group.forEach((variant) =>
        newSelectedVariants.add(variant.originalIndex)
      );
    }
    setSelectedVariants(newSelectedVariants);
  };

  const handleClose = (isCancelled: boolean) => {
    setSelectedVariants(new Set());
    setFilterText("");
    onClose(isCancelled);
  };

  const handleConfirm = () => {
    const updatedVariants = variants.filter((_, index) =>
      selectedVariants.has(index)
    );
    onConfirm(updatedVariants);
    handleClose(false);
  };

  const isAllSelected = selectedVariants.size === variants.length;
  const isGroupSelected = (groupName: string) => {
    const group = groupedVariantsByName[groupName];
    return group.every((variant) =>
      selectedVariants.has(variant.originalIndex)
    );
  };
  const isSomeOfGroupSelected = (groupName: string) => {
    const group = groupedVariantsByName[groupName];
    return (
      group.some((variant) => selectedVariants.has(variant.originalIndex)) &&
      !isGroupSelected(groupName)
    );
  };
  const isSomeSelected = selectedVariants.size > 0 && !isAllSelected;

  return (
    <Dialog
      open={open}
      onClose={() => handleClose(true)}
      className="fixed z-50 inset-0 overflow-y-auto"
    >
      <DialogBackdrop className="fixed inset-0 bg-black opacity-30" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="bg-background rounded max-w-2xl mx-auto p-6 z-50 max-h-screen overflow-auto">
          <DialogTitle className="text-xl font-bold text-textLight">
            {title}
          </DialogTitle>
          <Description className="mt-4 text-textLight mb-4">
            {contentText}
          </Description>
          <input
            type="text"
            className="mb-4 w-full px-3 py-2 border border-secondary rounded focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="Filter Variants"
            value={filterText}
            onChange={handleFilterChange}
          />
          {multiple && (
            <div className="mb-4">
              <UiCheckbox
                label="Select All"
                checked={isAllSelected}
                indeterminate={isSomeSelected}
                onChange={handleSelectAll}
                className="ml-2 text-textLight"
              />
            </div>
          )}
          <div className="h-96 overflow-y-auto p-4">
            {Object.keys(filteredGroupedVariantsByName).map((groupName) => (
              <div key={groupName} className="mb-4">
                <div className="flex items-center">
                  {multiple && (
                    <UiCheckbox
                      checked={isGroupSelected(groupName)}
                      indeterminate={isSomeOfGroupSelected(groupName)}
                      onChange={() => handleSelectAllGroup(groupName)}
                      className="ml-2 text-textLight"
                    />
                  )}
                  <h3 className="ml-2 text-lg font-semibold text-textLight">
                    {groupName}
                  </h3>
                </div>
                <div className={`mt-2 flex flex-col ${multiple ? "ml-6" : ""}`}>
                  {filteredGroupedVariantsByName[groupName].map((variant) => (
                    <UiCheckbox
                      key={variant.originalIndex}
                      label={variant.fullName}
                      checked={selectedVariants.has(variant.originalIndex)}
                      onChange={() =>
                        handleToggleVariant(variant.originalIndex)
                      }
                      className="ml-2 text-textLight"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end space-x-2">
            <button
              onClick={() => onClose(true)}
              className="px-4 py-2 bg-secondary text-textLight rounded hover:bg-scrollbarThumbHover"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 bg-accent text-black rounded hover:bg-accent"
            >
              Confirm
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default SelectVariantsDialog;
