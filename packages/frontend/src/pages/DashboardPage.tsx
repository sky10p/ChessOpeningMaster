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
  const [repertoireNameFilter, setRepertoireNameFilter] = useState<string>("");
  const [openingNameFilter, setOpeningNameFilter] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<'dashboard' | 'openings'>('dashboard');

  const filteredRepertoires =
    orientationFilter === "all"
      ? repertoires
      : repertoires.filter((r) => r.orientation === orientationFilter);
  
  const nameFilteredRepertoires = repertoireNameFilter
    ? filteredRepertoires.filter((r) => 
        r.name.toLowerCase().includes(repertoireNameFilter.toLowerCase()))
    : filteredRepertoires;

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
    return openings.sort();
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
    <div className="container p-0 sm:p-4 w-full h-full bg-gradient-to-b from-gray-900 via-primary to-gray-900 rounded-lg shadow-2xl flex flex-col">
      <nav className="flex flex-col sm:flex-row gap-2 sm:gap-4 p-2 sm:p-4 bg-primary z-20 sticky top-0 border-b border-gray-800">
        <button
          className={`px-4 py-2 rounded-t sm:rounded-l sm:rounded-t-none font-semibold focus:outline-none transition-colors duration-150 ring-0 focus:ring-2 focus:ring-blue-400 ${selectedSection === 'dashboard' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-800 text-gray-200 hover:bg-gray-700'}`}
          onClick={() => setSelectedSection('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={`px-4 py-2 rounded-t sm:rounded-l sm:rounded-t-none font-semibold focus:outline-none transition-colors duration-150 ring-0 focus:ring-2 focus:ring-blue-400 ${selectedSection === 'openings' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-800 text-gray-200 hover:bg-gray-700'}`}
          onClick={() => setSelectedSection('openings')}
        >
          Openings
        </button>
      </nav>
      <div className="flex-1 flex flex-col relative min-h-0">
        {selectedSection === 'dashboard' && (
          <section className="flex-1 flex flex-col min-h-0">
            <div className="sticky top-12 sm:top-16 z-10 bg-primary pb-2 pt-2 sm:pt-4 px-2 sm:px-4 border-b border-gray-800">
              <header className="mb-2">
                <h2 className="font-bold text-gray-100 text-lg sm:text-2xl leading-tight mb-1 truncate">Dashboard</h2>
                <p className="text-gray-300 text-xs sm:text-base leading-snug mb-2 sm:mb-4 truncate">Manage and review your chess repertoires. Filter by color or name to quickly find what you need.</p>
              </header>
              <div className="flex flex-col md:flex-row gap-2 md:gap-4">
                <select
                  value={orientationFilter}
                  onChange={(e) => setOrientationFilter(e.target.value as 'all' | 'white' | 'black')}
                  className="bg-gray-800 text-gray-100 px-3 py-2 border border-gray-700 rounded-lg shadow-sm hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition ease-in-out duration-150 text-xs sm:text-sm"
                >
                  <option value="all">All</option>
                  <option value="white">White</option>
                  <option value="black">Black</option>
                </select>
                <input
                  type="text"
                  placeholder="Filter repertoires"
                  value={repertoireNameFilter}
                  onChange={(e) => setRepertoireNameFilter(e.target.value)}
                  className="bg-gray-800 text-gray-100 px-3 py-2 border border-gray-700 rounded-lg shadow-sm hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition ease-in-out duration-150 flex-grow text-xs sm:text-sm"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto pt-2 sm:pt-4 px-1 sm:px-4">
              <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {nameFilteredRepertoires.map((repertoire) => (
                  <li
                    key={repertoire._id}
                    className="p-3 sm:p-4 bg-gray-900 rounded-xl shadow-lg border border-gray-800 hover:shadow-2xl transition-shadow duration-300 flex flex-col justify-between ring-0 focus-within:ring-2 focus-within:ring-blue-400"
                  >
                    <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-100 text-center truncate">{repertoire.name}</h3>
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
                ))}
              </ul>
            </div>
          </section>
        )}
        {selectedSection === 'openings' && (
          <section className="flex-1 flex flex-col min-h-0">
            <div className="sticky top-12 sm:top-16 z-10 bg-primary pb-2 pt-2 sm:pt-4 px-2 sm:px-4 border-b border-gray-800">
              <header className="mb-2">
                <h2 className="font-bold text-gray-100 text-lg sm:text-2xl leading-tight mb-1 truncate">Openings</h2>
                <p className="text-gray-300 text-xs sm:text-base leading-snug mb-2 sm:mb-4 truncate">Browse your prepared openings and see which repertoires use them.</p>
              </header>
              <input
                type="text"
                placeholder="Filter openings"
                value={openingNameFilter}
                onChange={(e) => setOpeningNameFilter(e.target.value)}
                className="bg-gray-800 text-gray-100 px-3 py-2 border border-gray-700 rounded-lg shadow-sm hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition ease-in-out duration-150 w-full text-xs sm:text-sm"
              />
            </div>
            <div className="flex-1 overflow-y-auto pt-2 sm:pt-4 px-1 sm:px-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {openings
                  .filter(opening => opening.toLowerCase().includes(openingNameFilter.toLowerCase()))
                  .map((opening) => (
                    <div
                      key={opening}
                      className="bg-gray-900 p-3 sm:p-4 rounded-xl shadow-lg border border-gray-800 hover:shadow-2xl transition-shadow duration-300 flex flex-col justify-between ring-0 focus-within:ring-2 focus-within:ring-blue-400"
                    >
                      <h3 className="text-base sm:text-lg font-medium mb-2 text-gray-100 text-center truncate">{opening}</h3>
                      <VariantsProgressBar
                        variants={getVariantsForOpening(opening)}
                        variantInfo={getTrainVariantInfo(filteredRepertoires.flatMap((r) => r.variantsInfo))}
                      />
                      <div className="mt-2 text-xs sm:text-sm text-gray-400 text-center flex flex-wrap justify-center gap-2">
                        {filteredRepertoires
                          .filter((repertoire) =>
                            repertoire.moveNodes
                              ? MoveVariantNode.initMoveVariantNode(repertoire.moveNodes)
                                  .getVariants()
                                  .some((v) => v.name === opening)
                              : false
                          )
                          .map((r) => (
                            <div
                              key={r._id}
                              className="px-3 py-1 bg-gray-800 text-gray-100 rounded-lg inline-block cursor-pointer hover:bg-gray-700 transition-colors"
                              onClick={() => goToRepertoire(r)}
                            >
                              {r.name}
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
