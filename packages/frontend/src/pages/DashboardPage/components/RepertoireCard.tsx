import React from "react";
import { EyeIcon, PlayIcon, LockOpenIcon, LockClosedIcon } from "@heroicons/react/24/solid";
import { VariantsProgressBar } from "../../../components/design/SelectTrainVariants/VariantsProgressBar";
import { IRepertoireDashboard, TrainVariantInfo } from "@chess-opening-master/common";
import { TrainVariant } from "../../../models/chess.models";
import { useDialogContext } from "../../../contexts/DialogContext";
import { disableRepertoire, enableRepertoire } from "../../../repository/repertoires/repertoires";

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
      className={`p-3 sm:p-4 bg-gray-900 rounded-xl shadow-lg border ${
        repertoire.disabled ? 'border-red-800 opacity-75' : 'border-gray-800'
      } hover:shadow-2xl transition-shadow duration-300 flex flex-col justify-between ring-0 focus-within:ring-2 focus-within:ring-blue-400`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className={`text-base sm:text-lg font-semibold text-gray-100 truncate ${repertoire.disabled ? 'text-gray-400' : ''}`}>
          {repertoire.name}
          {repertoire.disabled && <span className="ml-2 text-xs text-red-400">(Disabled)</span>}
        </h3>
        <button
          onClick={handleToggleDisable}
          className={`p-1 rounded-full focus:outline-none focus:ring-2 ${
            repertoire.disabled 
              ? 'text-red-500 hover:text-red-400 focus:ring-red-400' 
              : 'text-green-500 hover:text-green-400 focus:ring-green-400'
          }`}
          title={repertoire.disabled ? 'Enable repertoire' : 'Disable repertoire'}
        >
          {repertoire.disabled ? <LockClosedIcon className="h-4 w-4" /> : <LockOpenIcon className="h-4 w-4" />}
        </button>
      </div>
      <div className="flex space-x-2 mb-2 justify-center">
        <button
          className="flex items-center px-3 py-1 bg-gray-800 text-gray-100 rounded hover:bg-gray-700 transition-colors text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          onClick={() => goToRepertoire(repertoire)}
        >
          <EyeIcon className="h-5 w-5 mr-1" />
          View
        </button>
        <button
          className="flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          onClick={() => goToTrainRepertoire(repertoire)}
        >
          <PlayIcon className="h-5 w-5 mr-1" />
          Train
        </button>
      </div>
      <VariantsProgressBar
        variants={getTrainVariants(repertoire)}
        variantInfo={getTrainVariantInfo(repertoire.variantsInfo)}
      />
    </li>
  );
};
