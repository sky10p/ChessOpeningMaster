import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  IRepertoire,
  IRepertoireDashboard,
  TrainVariantInfo,
} from "@chess-opening-master/common";
import { useDashboard } from "../../hooks/useDashboard";
import { MoveVariantNode } from "../../models/VariantNode";
import { TrainVariant, Variant } from "../../models/chess.models";
import { DashboardSection } from "./sections/DashboardSection";
import { OpeningsSection } from "./sections/OpeningsSection";

export const DashboardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { repertoires } = useDashboard();
  const [orientationFilter, setOrientationFilter] = useState<
    "all" | "white" | "black"
  >("all");
  const [repertoireNameFilter, setRepertoireNameFilter] = useState<string>("");
  const [openingNameFilter, setOpeningNameFilter] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<'dashboard' | 'openings'>('dashboard');

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const section = params.get("section");
    if (section === "dashboard" || section === "openings") {
      setSelectedSection(section);
    }
  }, [location.search]);

  const handleSectionChange = (section: 'dashboard' | 'openings') => {
    setSelectedSection(section);
    const params = new URLSearchParams(location.search);
    params.set("section", section);
    navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
  };

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

  const openings = getDifferentOpenings(filteredRepertoires);

  return (
    <div className="container p-0 sm:p-4 w-full h-full bg-gradient-to-b from-gray-900 via-primary to-gray-900 rounded-lg shadow-2xl flex flex-col">
      <nav className="flex flex-col sm:flex-row gap-2 sm:gap-4 p-2 sm:p-4 bg-primary z-20 sticky top-0 border-b border-gray-800">
        <button
          className={`px-4 py-2 rounded-t sm:rounded-l sm:rounded-t-none font-semibold focus:outline-none transition-colors duration-150 ring-0 focus:ring-2 focus:ring-blue-400 ${selectedSection === 'dashboard' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-800 text-gray-200 hover:bg-gray-700'}`}
          onClick={() => handleSectionChange('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={`px-4 py-2 rounded-t sm:rounded-l sm:rounded-t-none font-semibold focus:outline-none transition-colors duration-150 ring-0 focus:ring-2 focus:ring-blue-400 ${selectedSection === 'openings' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-800 text-gray-200 hover:bg-gray-700'}`}
          onClick={() => handleSectionChange('openings')}
        >
          Openings
        </button>
      </nav>
      <div className="flex-1 flex flex-col relative min-h-0">
        {selectedSection === 'dashboard' && (
          <DashboardSection
            orientationFilter={orientationFilter}
            setOrientationFilter={setOrientationFilter}
            repertoireNameFilter={repertoireNameFilter}
            setRepertoireNameFilter={setRepertoireNameFilter}
            nameFilteredRepertoires={nameFilteredRepertoires}
            goToRepertoire={goToRepertoire}
            goToTrainRepertoire={goToTrainRepertoire}
            getTrainVariants={getTrainVariants}
            getTrainVariantInfo={getTrainVariantInfo}
          />
        )}
        {selectedSection === 'openings' && (
          <OpeningsSection
            openingNameFilter={openingNameFilter}
            setOpeningNameFilter={setOpeningNameFilter}
            openings={openings}
            filteredRepertoires={filteredRepertoires}
            getTrainVariantInfo={getTrainVariantInfo}
            goToRepertoire={goToRepertoire}
          />
        )}
      </div>
    </div>
  );
};
