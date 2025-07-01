import React, { useEffect, useState, useMemo } from "react";
import { Variant } from "../../../models/chess.models";
import { MoveVariantNode } from "../../../models/VariantNode";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  Description,
} from "@headlessui/react";
import { UiCheckbox } from "../../basic/UiCheckbox";
import { useTrainVariantInfo } from "../../../hooks/useTrainVariantInfo";

interface SelectVariantsDialogProps {
  open: boolean;
  title: string;
  contentText: string;
  variants: Variant[];
  repertoireId: string;
  onConfirm: (variants: Variant[]) => void;
  onClose: (isCancelled: boolean) => void;
  multiple?: boolean;
  currentMoveNode?: MoveVariantNode;
}

interface GroupedVariant extends Variant {
  originalIndex: number;
}

const SelectVariantsDialog: React.FC<SelectVariantsDialogProps> = ({
  open,
  title,
  contentText,
  variants,
  repertoireId,
  onConfirm,
  onClose,
  multiple = true,
  currentMoveNode,
}) => {
  const {getTextColorFromVariant} = useTrainVariantInfo(repertoireId);
  const [selectedVariants, setSelectedVariants] = useState<Set<number>>(
    new Set()
  );
  const [filterText, setFilterText] = useState("");
  const [filterByPosition, setFilterByPosition] = useState(false);

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterText(event.target.value);
  };

  const getVariantsFromCurrentPosition = (currentNode: MoveVariantNode, allVariants: Variant[]): Variant[] => {
    if (currentNode.position === 0) {
      return allVariants;
    }
    
    const currentPath: string[] = [];
    let node = currentNode;
    while (node.parent !== null) {
      currentPath.unshift(node.id);
      node = node.parent;
    }
    
    return allVariants.filter(variant => {
      if (variant.moves.length < currentPath.length) {
        return false;
      }
      
      for (let i = 0; i < currentPath.length; i++) {
        if (variant.moves[i].id !== currentPath[i]) {
          return false;
        }
      }
      
      return true;
    });
  };

  const filteredVariantsByPosition = useMemo(() => {
    if (!currentMoveNode || !filterByPosition) {
      return variants;
    }
    return getVariantsFromCurrentPosition(currentMoveNode, variants);
  }, [variants, currentMoveNode, filterByPosition]);

  const groupedVariantsByName = useMemo(() => {
    return filteredVariantsByPosition.reduce((groupedVariants, variant) => {
      const groupName = variant.name;
      if (!groupedVariants[groupName]) {
        groupedVariants[groupName] = [];
      }
      groupedVariants[groupName].push({ ...variant, originalIndex: variants.indexOf(variant) });
      return groupedVariants;
    }, {} as Record<string, GroupedVariant[]>);
  }, [filteredVariantsByPosition, variants]);

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
      setFilterByPosition(false);
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
    const currentVariantIndices = filteredVariantsByPosition.map(variant => variants.indexOf(variant));
    const allCurrentSelected = currentVariantIndices.every(index => selectedVariants.has(index));
    
    if (allCurrentSelected) {
      const newSelectedVariants = new Set(selectedVariants);
      currentVariantIndices.forEach(index => newSelectedVariants.delete(index));
      setSelectedVariants(newSelectedVariants);
    } else {
      const newSelectedVariants = new Set(selectedVariants);
      currentVariantIndices.forEach(index => newSelectedVariants.add(index));
      setSelectedVariants(newSelectedVariants);
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

  const currentVariantIndices = filteredVariantsByPosition.map(variant => variants.indexOf(variant));
  const isAllSelected = currentVariantIndices.length > 0 && currentVariantIndices.every(index => selectedVariants.has(index));
  const isSomeSelected = currentVariantIndices.some(index => selectedVariants.has(index)) && !isAllSelected;
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
            className="mb-4 w-full px-3 py-2 border border-secondary rounded focus:outline-none focus:ring-2 focus:ring-accent text-black bg-white"
            placeholder="Filter Variants"
            value={filterText}
            onChange={handleFilterChange}
          />
          {currentMoveNode && currentMoveNode.position > 0 && (
            <div className="mb-4">
              <UiCheckbox
                label={`Filter by current position (${filteredVariantsByPosition.length} variants available)`}
                checked={filterByPosition}
                onChange={setFilterByPosition}
                className="ml-2 text-textLight"
              />
            </div>
          )}
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
                      style={{ color: getTextColorFromVariant(variant) }}
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
