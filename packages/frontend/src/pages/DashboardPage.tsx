import React, { useState } from "react";
import { EyeIcon, PlayIcon } from "@heroicons/react/24/solid"; // Import Heroicons
import { useNavigate } from "react-router-dom";
import {
  IRepertoire,
  IRepertoireDashboard,
  TrainVariantInfo,
} from "@chess-opening-master/common";
import { useDashboard } from "../hooks/useDashboard";
import { VariantsProgressBar } from "../components/design/SelectTrainVariants/VariantsProgressBar";
import { MoveVariantNode } from "../models/VariantNode";
import { TrainVariant, Variant } from "../models/chess.models";

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { repertoires } = useDashboard();
  const [orientationFilter, setOrientationFilter] = useState<
    "all" | "white" | "black"
  >("all");

  const filteredRepertoires =
    orientationFilter === "all"
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

  const getTrainVariantInfo = (
    trainInfo: TrainVariantInfo[]
  ): Record<string, TrainVariantInfo> => {
    const info: Record<string, TrainVariantInfo> = {};
    trainInfo.forEach((v) => {
      info[v.variantName] = v;
    });
    return info;
  };

  const getDifferentOpenings = (
    repertoires: IRepertoireDashboard[]
  ): string[] => {
    const openings: string[] = [];
    repertoires.forEach((repertoire) => {
      const move = repertoire.moveNodes;
      const variants: Variant[] = move
        ? MoveVariantNode.initMoveVariantNode(move).getVariants()
        : [];
      variants.forEach((v) => {
        if (!openings.includes(v.name)) {
          openings.push(v.name);
        }
      });
    });
    return openings.sort(); // Sort openings alphabetically
  };

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
      <header className="text-left">
        <h1 className="text-2xl font-bold mb-2 text-white">Dashboard</h1>
        <p className="text-lg text-gray-300">Manage your chess repertoires</p>
      </header>
      <div className="flex-1 px-4 overflow-y-auto flex flex-col space-y-4">
        <section className="flex-1 overflow-y-auto">
          <select
            value={orientationFilter}
            onChange={(e) =>
              setOrientationFilter(e.target.value as "all" | "white" | "black")
            }
            className="mb-4 bg-gray-700 text-white px-4 py-2 border border-gray-600 rounded-lg shadow-sm hover:border-accent focus:outline-none transition ease-in-out duration-150 w-auto"
          >
            <option value="all">All</option>
            <option value="white">White</option>
            <option value="black">Black</option>
          </select>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRepertoires.map((repertoire) => (
              <li
                key={repertoire._id}
                className="p-4 bg-gray-800 rounded-lg  shadow-lg border border-gray-700"
              >
                <h3 className="text-lg font-semibold mb-3 text-white text-center">
                  {repertoire.name}
                </h3>
                <div className="flex space-x-2 mb-3 justify-center">
                  <button
                    className="flex items-center px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                    onClick={() => goToRepertoire(repertoire)}
                  >
                    <EyeIcon className="h-5 w-5 mr-1" />
                    View
                  </button>
                  <button
                    className="flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
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
            ))}
          </ul>
        </section>
        <hr className="border-t-4 border-gray-700 my-6" />
        <section className="flex-1 overflow-y-auto mt-8">
          <header className="mb-6">
            <h2 className="text-2xl font-bold mb-2 text-textLight">Openings</h2>
            <p className="text-lg text-gray-300">Browse your prepared openings</p>
          </header>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {openings.map((opening) => (
              <div
                key={opening}
                className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 hover:shadow-xl transition-shadow duration-300"
              >
                <h3 className="text-lg font-medium mb-4 text-textLight text-center">
                  {opening}
                </h3>
                <VariantsProgressBar
                  variants={getVariantsForOpening(opening)}
                  variantInfo={getTrainVariantInfo(
                    filteredRepertoires.flatMap((r) => r.variantsInfo)
                  )}
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
