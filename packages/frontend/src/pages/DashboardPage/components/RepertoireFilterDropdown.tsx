import React, { useEffect, useMemo, useState } from "react";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import { IRepertoireDashboard } from "@chess-opening-master/common";
import { Button, Card } from "../../../components/ui";
import { cn } from "../../../utils/cn";

interface RepertoireFilterDropdownProps {
  filteredRepertoires: IRepertoireDashboard[];
  orientationFilter: "all" | "white" | "black";
  selectedRepertoires: string[];
  setSelectedRepertoires: React.Dispatch<React.SetStateAction<string[]>>;
}

export const RepertoireFilterDropdown: React.FC<RepertoireFilterDropdownProps> = ({
  filteredRepertoires,
  orientationFilter,
  selectedRepertoires,
  setSelectedRepertoires,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const filteredRepertoiresByOrientation = useMemo(() => {
    if (orientationFilter === "all") {
      return filteredRepertoires;
    }
    return filteredRepertoires.filter(
      (repertoire) => repertoire.orientation === orientationFilter
    );
  }, [filteredRepertoires, orientationFilter]);

  useEffect(() => {
    if (filteredRepertoiresByOrientation.length > 0) {
      setSelectedRepertoires(
        filteredRepertoiresByOrientation.map((repertoire) => repertoire._id)
      );
      return;
    }
    setSelectedRepertoires([]);
  }, [filteredRepertoiresByOrientation, setSelectedRepertoires]);

  const toggleRepertoireSelection = (repertoireId: string) => {
    setSelectedRepertoires((prev) =>
      prev.includes(repertoireId)
        ? prev.filter((id) => id !== repertoireId)
        : [...prev, repertoireId]
    );
  };

  const selectAllRepertoires = () => {
    setSelectedRepertoires(
      filteredRepertoiresByOrientation.map((repertoire) => repertoire._id)
    );
  };

  const deselectAllRepertoires = () => {
    setSelectedRepertoires([]);
  };

  const summaryLabel =
    selectedRepertoires.length === 0
      ? "No repertoires"
      : selectedRepertoires.length === filteredRepertoiresByOrientation.length
        ? `All ${orientationFilter !== "all" ? orientationFilter : ""} repertoires`.trim()
        : `${selectedRepertoires.length} repertoire(s)`;

  return (
    <div className={cn("relative", isDropdownOpen && "z-20")}>
      <Button
        type="button"
        intent="secondary"
        size="sm"
        onClick={() => setIsDropdownOpen((open) => !open)}
        className="w-full justify-between border-border-default bg-surface-raised text-left text-xs sm:text-sm"
      >
        <span className="truncate">{summaryLabel}</span>
        {isDropdownOpen ? (
          <ChevronUpIcon className="h-4 w-4 shrink-0" />
        ) : (
          <ChevronDownIcon className="h-4 w-4 shrink-0" />
        )}
      </Button>

      {isDropdownOpen ? (
        <Card
          padding="none"
          elevation="high"
          className="absolute left-0 top-full z-50 mt-1 min-w-full overflow-hidden border-border-default bg-surface"
        >
          <div className="flex items-center justify-between gap-2 border-b border-border-subtle p-2">
            <Button
              type="button"
              intent="ghost"
              size="sm"
              onClick={selectAllRepertoires}
              className="px-2"
            >
              Select all
            </Button>
            <Button
              type="button"
              intent="ghost"
              size="sm"
              onClick={deselectAllRepertoires}
              className="px-2"
            >
              Clear
            </Button>
          </div>

          <div className="max-h-60 space-y-1 overflow-y-auto p-2">
            {filteredRepertoiresByOrientation.length > 0 ? (
              filteredRepertoiresByOrientation.map((repertoire) => {
                const selected = selectedRepertoires.includes(repertoire._id);
                return (
                  <Button
                    key={repertoire._id}
                    type="button"
                    intent={selected ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => toggleRepertoireSelection(repertoire._id)}
                    className="w-full justify-between px-2 py-2"
                  >
                    <span className="min-w-0 text-left">
                      <span className="block truncate text-text-base">
                        {repertoire.name}
                      </span>
                      <span className="block text-[11px] uppercase tracking-wide text-text-subtle">
                        {repertoire.orientation}
                      </span>
                    </span>
                    <span className="ml-3 flex h-5 w-5 items-center justify-center rounded border border-border-default bg-surface-raised">
                      {selected ? (
                        <CheckIcon className="h-3.5 w-3.5 text-brand" />
                      ) : null}
                    </span>
                  </Button>
                );
              })
            ) : (
              <div className="py-4 text-center text-text-subtle">
                No matching repertoires
              </div>
            )}
          </div>

          <div className="border-t border-border-subtle p-2">
            <Button
              type="button"
              intent="primary"
              size="sm"
              onClick={() => setIsDropdownOpen(false)}
              className="w-full justify-center"
            >
              Done
            </Button>
          </div>
        </Card>
      ) : null}
    </div>
  );
};
