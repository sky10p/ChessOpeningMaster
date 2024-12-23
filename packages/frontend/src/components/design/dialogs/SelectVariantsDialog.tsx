import React, { useEffect, useState, useMemo } from "react";
import { Variant } from "../../../models/chess.models";
import {
  FormControlLabel,
  Button,
  Box,
} from "@mui/material";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, Description } from '@headlessui/react';

interface SelectVariantsDialogProps {
  open: boolean;
  title: string;
  contentText: string;
  variants: Variant[];
  onConfirm: (variants: Variant[]) => void;
  onClose: () => void;
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
}) => {
  const [selectedVariants, setSelectedVariants] = useState<Set<number>>(new Set());
  const [filterText, setFilterText] = useState("");

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterText(event.target.value);
  };

  const groupedVariantsByName = useMemo(() => {
    return variants.reduce(
      (groupedVariants, variant, index) => {
        const groupName = variant.name;
        if (!groupedVariants[groupName]) {
          groupedVariants[groupName] = [];
        }
        groupedVariants[groupName].push({...variant, originalIndex: index});
        return groupedVariants;
      },
      {} as Record<string, GroupedVariant[]>
    );
  }, [variants]);

  const filteredGroupedVariantsByName = useMemo(() => {
    return Object.keys(groupedVariantsByName).reduce(
      (filteredGroups, groupName) => {
        const filteredVariants = groupedVariantsByName[groupName].filter((variant) =>
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
    const newSelectedVariants = new Set(selectedVariants);
    if (newSelectedVariants.has(variantIndex)) {
      newSelectedVariants.delete(variantIndex);
    } else {
      newSelectedVariants.add(variantIndex);
    }
    setSelectedVariants(newSelectedVariants);
  };

  const handleSelectAll = () => {
    if (selectedVariants.size === variants.length) {
      setSelectedVariants(new Set());
    } else {
      setSelectedVariants(
        new Set(variants.map((variant, index) => index))
      );
    }
  };

  const handleSelectAllGroup = (groupName: string) => {
    const group = groupedVariantsByName[groupName];
    const newSelectedVariants = new Set(selectedVariants);
    if (isGroupSelected(groupName)) {
      group.forEach((variant) => newSelectedVariants.delete(variant.originalIndex));
    } else {
      group.forEach((variant) => newSelectedVariants.add(variant.originalIndex));
    }
    setSelectedVariants(newSelectedVariants);
  };

  const handleClose = () => {
    setSelectedVariants(new Set());
    setFilterText("");
    onClose();
  };

  const handleConfirm = () => {
    const updatedVariants = variants.filter((_, index) => selectedVariants.has(index));
    onConfirm(updatedVariants);
    handleClose();
  };

  const isAllSelected = selectedVariants.size === variants.length;
  const isGroupSelected = (groupName: string) => {
    const group = groupedVariantsByName[groupName];
    return group.every((variant) => selectedVariants.has(variant.originalIndex));
  };
  const isSomeOfGroupSelected = (groupName: string) => {
    const group = groupedVariantsByName[groupName];
    return group.some((variant) => selectedVariants.has(variant.originalIndex)) && !isGroupSelected(groupName);
  };
  const isSomeSelected = selectedVariants.size > 0 && !isAllSelected;

  return (
    <Dialog open={open} onClose={handleClose} className="fixed z-10 inset-0 overflow-y-auto">
      <DialogBackdrop className="fixed inset-0 bg-black opacity-30" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="bg-background rounded max-w-2xl mx-auto p-6 z-20 max-h-screen overflow-auto">
          <DialogTitle className="text-xl font-bold text-textLight">{title}</DialogTitle>
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
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isAllSelected}
                className="form-checkbox h-4 w-4 text-accent"
                onChange={handleSelectAll}
              />
              <span className="ml-2 text-textLight">Select All</span>
            </label>
          </div>
          {Object.keys(filteredGroupedVariantsByName).map((groupName) => (
            <div key={groupName} className="mb-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={isGroupSelected(groupName)}
                  className="form-checkbox h-4 w-4 text-accent"
                  onChange={() => handleSelectAllGroup(groupName)}
                />
                <h3 className="ml-2 text-lg font-semibold text-textLight">{groupName}</h3>
              </div>
              <div className="ml-6 mt-2">
                {filteredGroupedVariantsByName[groupName].map((variant) => (
                  <label key={variant.originalIndex} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={selectedVariants.has(variant.originalIndex)}
                      className="form-checkbox h-4 w-4 text-accent"
                      onChange={() => handleToggleVariant(variant.originalIndex)}
                    />
                    <span className="ml-2 text-textLight">{variant.fullName}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          <div className="mt-4 flex justify-end space-x-2">
            <button onClick={onClose} className="px-4 py-2 bg-secondary text-textLight rounded hover:bg-scrollbarThumbHover">
              Cancel
            </button>
            <button onClick={handleConfirm} className="px-4 py-2 bg-accent text-black rounded hover:bg-accent">
              Confirm
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default SelectVariantsDialog;
