import React, { useState } from "react";
import { EyeIcon, PlayIcon } from "@heroicons/react/24/solid"; // Import Heroicons
import { useNavigate } from "react-router-dom";
import { IRepertoire, IRepertoireDashboard, TrainVariantInfo } from "@chess-opening-master/common";
import { useDashboard } from "../hooks/useDashboard";
import { VariantsProgressBar } from "../components/design/SelectTrainVariants/VariantsProgressBar";
import { MoveVariantNode } from "../models/VariantNode";
import { TrainVariant, Variant } from "../models/chess.models";

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { repertoires } = useDashboard();
  const [orientationFilter, setOrientationFilter] = useState<"all" | "white" | "black">("all");

  const filteredRepertoires = orientationFilter === "all"
    ? repertoires
    : repertoires.filter((r) => r.orientation === orientationFilter);

  const goToRepertoire = (repertoire: IRepertoire) => {
    navigate(`/repertoire/${repertoire._id}`);
  };

  const goToTrainRepertoire = (repertoire: IRepertoire) => {
    navigate(`/repertoire/train/${repertoire._id}`);
  };

  const getTrainVariants = (repertoire: IRepertoire): TrainVariant[] => {
    const move = repertoire.moveNodes
      ? MoveVariantNode.initMoveVariantNode(repertoire.moveNodes)
      : new MoveVariantNode();
    const variants: Variant[] = move.getVariants();
    return variants.map((v) => ({ variant: v, state: "inProgress" }));
  };

  const getTrainVariantInfo = (trainInfo: TrainVariantInfo[]): Record<string, TrainVariantInfo> => {
    const info: Record<string, TrainVariantInfo> = {};
    trainInfo.forEach((v) => {
      info[v.variantName] = v;
    });
    return info;
  }

  const getDifferentOpenings = (repertoires: IRepertoireDashboard[]): string[] => {
    const openings: string[] = [];
    repertoires.forEach((repertoire) => {
     const move = repertoire.moveNodes;
     const variants: Variant[] = move ? MoveVariantNode.initMoveVariantNode(move).getVariants() : [];
      variants.forEach((v) => {
        if (!openings.includes(v.name)) {
          openings.push(v.name);
        }
      });
    });
    return openings.sort(); // Sort openings alphabetically
  }

  const getVariantsForOpening = (opening: string): TrainVariant[] => {
    const relatedRepertoires = filteredRepertoires.filter((repertoire) =>
      repertoire.moveNodes
        ? MoveVariantNode.initMoveVariantNode(repertoire.moveNodes)
            .getVariants()
            .some((v) => v.name === opening)
        : false
    );

    const variants: TrainVariant[] = [];
    relatedRepertoires.forEach((repertoire) => {
      const trainVariants = getTrainVariants(repertoire).filter(
        (tv) => tv.variant.name === opening
      );
      variants.push(...trainVariants);
    });

    return variants;
  };

  const openings = getDifferentOpenings(filteredRepertoires);

  return (
    <div className="container p-4 w-full overflow-auto h-full bg-primary rounded-lg shadow-xl flex flex-col space-y-4">
      <h1 className="text-2xl font-bold mb-4 text-white">Dashboard</h1>
      <div className="flex-1 px-4 overflow-y-auto">
        <select
          value={orientationFilter}
          onChange={(e) => setOrientationFilter(e.target.value as "all" | "white" | "black")}
          className="mb-4 bg-gray-700 text-white px-4 py-2 border border-gray-600 rounded-lg shadow-sm hover:border-accent focus:outline-none transition ease-in-out duration-150"
        >
          <option value="all">All</option>
          <option value="white">White</option>
          <option value="black">Black</option>
        </select>
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRepertoires.map((repertoire) => (
            <li
              key={repertoire._id}
              className="p-4 border rounded-lg  from-primary shadow-xl"
            >
              <h2 className="text-xl font-semibold mb-2 text-textLight">
                {repertoire.name}
              </h2>
              <div className="flex space-x-2">
                <button
                  className="flex items-center px-3 py-1 bg-accent text-background rounded hover:bg-yellow-400 transition-colors"
                  onClick={() => goToRepertoire(repertoire)}
                >
                  <EyeIcon className="h-5 w-5 mr-1" />
                  View
                </button>
                <button
                  className="flex items-center px-3 py-1 bg-success text-background rounded hover:bg-green-400 transition-colors"
                  onClick={() => goToTrainRepertoire(repertoire)}
                >
                  <PlayIcon className="h-5 w-5 mr-1" />
                  Train
                </button>
              </div>
              <div className="text-textLight mt-2">
                <VariantsProgressBar
                  variants={getTrainVariants(repertoire)}
                  variantInfo={getTrainVariantInfo(repertoire.variantsInfo)}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-6 flex-1 overflow-auto">
        <h2 className="text-xl font-semibold mb-2 text-textLight">Openings</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-auto">
          {openings.map((opening) => (
            <div key={opening} className="w-full bg-gray-800 p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-medium mb-2 text-textLight">{opening}</h3>
              <VariantsProgressBar
                variants={getVariantsForOpening(opening)}
                variantInfo={getTrainVariantInfo(
                  filteredRepertoires.flatMap((r) => r.variantsInfo)
                )}
              />
            </div>
          ))}
        </div>
      </div>
  
    </div>
  );
};
