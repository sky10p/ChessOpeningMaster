import React from "react";
import { EyeIcon, PlayIcon, LockOpenIcon, LockClosedIcon } from "@heroicons/react/24/solid";
import { VariantsProgressBar } from "../../../components/design/SelectTrainVariants/VariantsProgressBar";
import { IRepertoireDashboard, TrainVariantInfo } from "@chess-opening-master/common";
import { TrainVariant } from "../../../models/chess.models";
import { useDialogContext } from "../../../contexts/DialogContext";
import { disableRepertoire, enableRepertoire } from "../../../repository/repertoires/repertoires";
import { Button, IconButton } from "../../../components/ui";
import { cn } from "../../../utils/cn";

interface RepertoireCardProps {
  repertoire: IRepertoireDashboard;
  goToRepertoire: (repertoire: IRepertoireDashboard) => void;
  goToTrainRepertoire: (repertoire: IRepertoireDashboard) => void;
  getTrainVariants: (repertoire: IRepertoireDashboard) => TrainVariant[];
  getTrainVariantInfo: (trainInfo: TrainVariantInfo[]) => Record<string, TrainVariantInfo>;
  updateRepertoires: () => void;
}

export const RepertoireCard: React.FC<RepertoireCardProps> = ({
  repertoire,
  goToRepertoire,
  goToTrainRepertoire,
  getTrainVariants,
  getTrainVariantInfo,
  updateRepertoires,
}) => {
  const { showConfirmDialog } = useDialogContext();
  
  const handleToggleDisable = () => {
    if (repertoire.disabled) {
      showConfirmDialog({
        title: "Enable Repertoire",
        contentText: `Are you sure you want to enable "${repertoire.name}"?`,
        onConfirm: async () => {
          await enableRepertoire(repertoire._id);
          updateRepertoires();
        },
      });
    } else {
      showConfirmDialog({
        title: "Disable Repertoire",
        contentText: `Are you sure you want to disable "${repertoire.name}"? It will be visually marked as disabled in the dashboard.`,
        onConfirm: async () => {
          await disableRepertoire(repertoire._id);
          updateRepertoires();
        },
      });
    }
  };

  return (
    <li
      className={cn(
        "p-3 sm:p-4 bg-surface rounded-xl shadow-surface border transition-shadow duration-300 flex flex-col justify-between focus-within:ring-2 focus-within:ring-brand",
        repertoire.disabled ? "border-danger/40 opacity-75" : "border-border-default hover:shadow-elevated"
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className={cn("text-base sm:text-lg font-semibold text-text-base truncate", repertoire.disabled && "text-text-muted")}>
          {repertoire.name}
          {repertoire.disabled && <span className="ml-2 text-xs text-danger">(Disabled)</span>}
        </h3>
        <IconButton
          label={repertoire.disabled ? "Enable repertoire" : "Disable repertoire"}
          onClick={handleToggleDisable}
          className={repertoire.disabled ? "text-danger" : "text-success"}
        >
          {repertoire.disabled ? <LockClosedIcon className="h-4 w-4" /> : <LockOpenIcon className="h-4 w-4" />}
        </IconButton>
      </div>
      <div className="flex gap-2 mb-2 justify-center">
        <Button intent="secondary" size="sm" onClick={() => goToRepertoire(repertoire)}>
          <EyeIcon className="h-4 w-4" />
          View
        </Button>
        <Button intent="primary" size="sm" onClick={() => goToTrainRepertoire(repertoire)}>
          <PlayIcon className="h-4 w-4" />
          Train
        </Button>
      </div>
      <VariantsProgressBar
        variants={getTrainVariants(repertoire)}
        variantInfo={getTrainVariantInfo(repertoire.variantsInfo)}
      />
    </li>
  );
};
