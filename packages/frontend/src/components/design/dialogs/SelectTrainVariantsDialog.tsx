import React, { useEffect, useState, useMemo } from "react";
import { TrainVariant } from "../../../models/chess.models";
import { SelectTrainVariants } from "../SelectTrainVariants/SelectTrainVariants";
import { getTrainVariantInfo } from "../../../repository/repertoires/trainVariants";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  Description,
} from "@headlessui/react";
import { UiCheckbox } from "../../basic/UiCheckbox";
import { TrainVariantInfo } from "@chess-opening-master/common";
import { isToday } from "../../../utils/dateUtils";

interface SelectTrainVariantsDialogProps {
  open: boolean;
  title: string;
  contentText: string;
  trainVariants: TrainVariant[];
  repertoireId: string;
  onConfirm: (trainVariants: TrainVariant[]) => void;
  onClose: (isCancelled: boolean) => void; // changed
}

interface GroupedTrainVariant extends TrainVariant {
  originalIndex: number;
}

const SelectTrainVariantsDialog: React.FC<SelectTrainVariantsDialogProps> = ({
  open,
  title,
  contentText,
  trainVariants,
  repertoireId,
  onConfirm,
  onClose,
}) => {
  const [selectedTrainVariants, setSelectedTrainVariants] = useState<
    Set<number>
  >(new Set());
  const [filterText, setFilterText] = useState("");
  const [trainVariantsInfo, setTrainVariantsInfo] = useState<
    Record<string, TrainVariantInfo>
  >({});

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterText(event.target.value);
  };

  const groupedTrainVariantsByName = useMemo(() => {
    return trainVariants.reduce((groupedTrainVariants, trainVariant, index) => {
      const groupName = trainVariant.variant.name;
      if (!groupedTrainVariants[groupName]) {
        groupedTrainVariants[groupName] = [];
      }
      groupedTrainVariants[groupName].push({
        ...trainVariant,
        originalIndex: index,
      });
      return groupedTrainVariants;
    }, {} as Record<string, GroupedTrainVariant[]>);
  }, [trainVariants]);

  const filteredGroupedTrainVariantsByName = useMemo(() => {
    return Object.keys(groupedTrainVariantsByName).reduce(
      (filteredGroups, groupName) => {
        const filteredVariants = groupedTrainVariantsByName[groupName].filter(
          (trainVariant) =>
            trainVariant.variant.fullName
              .toLowerCase()
              .includes(filterText.toLowerCase())
        );
        if (filteredVariants.length > 0) {
          filteredGroups[groupName] = filteredVariants;
        }
        return filteredGroups;
      },
      {} as Record<string, GroupedTrainVariant[]>
    );
  }, [groupedTrainVariantsByName, filterText]);

  const updateTrainVariantsInfo = async () => {
    const variantsInfo = await getTrainVariantInfo(repertoireId);
    const variantsInfoMap = variantsInfo.reduce(
      (acc: Record<string, TrainVariantInfo>, variantInfo) => {
        acc[variantInfo.variantName] = variantInfo;
        return acc;
      },
      {}
    );
    setTrainVariantsInfo(variantsInfoMap);
  };

  useEffect(() => {
    if (open) {
      updateTrainVariantsInfo();
      setSelectedTrainVariants(
        new Set(
          trainVariants
            .map((trainVariant, index) =>
              trainVariant.state !== "finished" ? index : -1
            )
            .filter((variantIndex) => variantIndex !== -1)
        )
      );
      setFilterText("");
    }
  }, [open, trainVariants]);

  const handleToggleVariant = (variantIndex: number) => {
    const newSelectedVariants = new Set(selectedTrainVariants);
    if (newSelectedVariants.has(variantIndex)) {
      newSelectedVariants.delete(variantIndex);
    } else {
      newSelectedVariants.add(variantIndex);
    }
    setSelectedTrainVariants(newSelectedVariants);
  };

  const handleSelectAll = () => {
    if (selectedTrainVariants.size === trainVariants.length) {
      setSelectedTrainVariants(new Set());
    } else {
      setSelectedTrainVariants(
        new Set(trainVariants.map((trainVariant, index) => index))
      );
    }
  };

  const handleSelectAllGroup = (groupName: string) => {
    const group = groupedTrainVariantsByName[groupName];
    const newSelectedVariants = new Set(selectedTrainVariants);
    if (isGroupSelected(groupName)) {
      group.forEach((trainVariant) =>
        newSelectedVariants.delete(trainVariant.originalIndex)
      );
    } else {
      group.forEach((trainVariant) =>
        newSelectedVariants.add(trainVariant.originalIndex)
      );
    }
    setSelectedTrainVariants(newSelectedVariants);
  };

  const handleClose = (isCancelled: boolean) => {
    setSelectedTrainVariants(new Set());
    setFilterText("");
    onClose(isCancelled); // changed
  };

  const handleConfirm = () => {
    const updatedTrainVariants = trainVariants.filter((trainVariant, index) =>
      selectedTrainVariants.has(index)
    );
    onConfirm(updatedTrainVariants);
    handleClose(false);
  };

  const isAllSelected = selectedTrainVariants.size === trainVariants.length;
  const isGroupSelected = (groupName: string) => {
    const group = groupedTrainVariantsByName[groupName];
    return group.every((trainVariant) =>
      selectedTrainVariants.has(trainVariant.originalIndex)
    );
  };
  const isSomeOfGroupSelected = (groupName: string) => {
    const group = groupedTrainVariantsByName[groupName];
    return (
      group.some((trainVariant) =>
        selectedTrainVariants.has(trainVariant.originalIndex)
      ) && !isGroupSelected(groupName)
    );
  };
  const isSomeSelected = selectedTrainVariants.size > 0 && !isAllSelected;

  const isVariantNew = (trainVariant: TrainVariant) => {
    const info = trainVariantsInfo[trainVariant.variant.fullName];
    return !info || !info.lastDate;
  };

  const isVariantNotStudiedToday = (trainVariant: TrainVariant) => {
    const info = trainVariantsInfo[trainVariant.variant.fullName];
    if (!info || !info.lastDate) return true;
    const lastDate = new Date(info.lastDate);
    return !isToday(lastDate);
  };

  const newVariantIndexes = useMemo(() =>
    trainVariants
      .map((tv, i) => (isVariantNew(tv) ? i : -1))
      .filter((i) => i !== -1),
    [trainVariants, trainVariantsInfo]
  );

  const notStudiedIndexes = useMemo(() =>
    trainVariants
      .map((tv, i) => (isVariantNotStudiedToday(tv) ? i : -1))
      .filter((i) => i !== -1),
    [trainVariants, trainVariantsInfo]
  );

  const allNewSelected = newVariantIndexes.length > 0 &&
    newVariantIndexes.every((i) => selectedTrainVariants.has(i));
  const someNewSelected = newVariantIndexes.some((i) => selectedTrainVariants.has(i));

  const allNotStudiedSelected = notStudiedIndexes.length > 0 &&
    notStudiedIndexes.every((i) => selectedTrainVariants.has(i));
  const someNotStudiedSelected = notStudiedIndexes.some((i) => selectedTrainVariants.has(i));

  const handleSelectNewVariants = () => {
    const newSet = new Set(selectedTrainVariants);
    if (allNewSelected) {
      newVariantIndexes.forEach((i) => newSet.delete(i));
    } else {
      newVariantIndexes.forEach((i) => newSet.add(i));
    }
    setSelectedTrainVariants(newSet);
  };

  const handleSelectNotStudiedToday = () => {
    const newSet = new Set(selectedTrainVariants);
    if (allNotStudiedSelected) {
      notStudiedIndexes.forEach((i) => newSet.delete(i));
    } else {
      notStudiedIndexes.forEach((i) => newSet.add(i));
    }
    setSelectedTrainVariants(newSet);
  };

  return (
    <Dialog
      open={open}
      onClose={() => handleClose(true)} // changed
      className="fixed z-50 inset-0 overflow-y-auto"
    >
      <DialogBackdrop className="fixed inset-0 bg-black opacity-30" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="bg-background rounded w-screen md:w-auto xl:max-w-5xl mx-auto p-6 z-50 max-h-screen overflow-auto">
          <DialogTitle className="text-xl font-bold text-textLight">
            {title}
          </DialogTitle>
          <Description className="mt-4 text-textLight mb-4">
            {contentText}
          </Description>
          <input
            type="text"
            className="mb-4 w-full px-3 py-2 border border-secondary rounded focus:outline-none focus:ring-2 focus:ring-accent text-black bg-white"
            placeholder="Filter Train Variants"
            value={filterText}
            onChange={handleFilterChange}
          />
          <div className="mb-4">
            <UiCheckbox
              label="Select All"
              checked={isAllSelected}
              indeterminate={isSomeSelected}
              onChange={handleSelectAll}
              className="ml-2 text-textLight"
            />
            <UiCheckbox
              label="Select New"
              checked={allNewSelected}
              indeterminate={!allNewSelected && someNewSelected}
              onChange={handleSelectNewVariants}
              className="ml-2 text-textLight"
            />
            <UiCheckbox
              label="Not Studied Today"
              checked={allNotStudiedSelected}
              indeterminate={!allNotStudiedSelected && someNotStudiedSelected}
              onChange={handleSelectNotStudiedToday}
              className="ml-2 text-textLight"
            />
          </div>
          <div className="h-96 overflow-y-auto p-4">
            {Object.keys(filteredGroupedTrainVariantsByName).map(
              (groupName) => (
                <div key={groupName} className="mb-4">
                  <SelectTrainVariants
                    variantName={groupName}
                    subvariants={filteredGroupedTrainVariantsByName[groupName]}
                    isGroupSelected={isGroupSelected}
                    isSomeOfGroupSelected={isSomeOfGroupSelected}
                    isCheckedVariant={(variantIndex) =>
                      selectedTrainVariants.has(variantIndex)
                    }
                    handleSelectAllGroup={handleSelectAllGroup}
                    handleToggleVariant={handleToggleVariant}
                    variantsInfo={trainVariantsInfo}
                  />
                </div>
              )
            )}
          </div>
          <div className="mt-4 flex justify-end space-x-2">
            <button
              onClick={() => handleClose(true)} // changed
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

export default SelectTrainVariantsDialog;
