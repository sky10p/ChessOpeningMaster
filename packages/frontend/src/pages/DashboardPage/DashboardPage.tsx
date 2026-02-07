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
import { RepertoiresSection } from "./sections/RepertoiresSection";
import { OpeningsSection } from "./sections/OpeningsSection";
import { DashboardSection } from "./sections/DashboardSection/index";
import { OverviewSection } from "./sections/OverviewSection";
import { StudiesSection } from "./sections/StudiesSection";
import { ErrorsSection } from "./sections/ErrorsSection";
import { UnreviewedSection } from "./sections/UnreviewedSection";
import { ArrowsRightLeftIcon } from "@heroicons/react/24/solid";

export const DashboardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { repertoires, updateRepertoires } = useDashboard();
  const [orientationFilter, setOrientationFilter] = useState<
    "all" | "white" | "black"
  >("all");
  const [repertoireNameFilter, setRepertoireNameFilter] = useState<string>("");
  const [openingNameFilter, setOpeningNameFilter] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<'dashboard' | 'overview' | 'repertoires' | 'openings' | 'studies' | 'errors' | 'unreviewed'>('dashboard');

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const section = params.get("section");
    if (section === "dashboard" || section === "overview" || section === "repertoires" || section === "openings" || section === "studies" || section === "errors" || section === "unreviewed") {
      setSelectedSection(section);
    }
  }, [location.search]);

  const handleSectionChange = (section: 'dashboard' | 'overview' | 'repertoires' | 'openings' | 'studies' | 'errors' | 'unreviewed') => {
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

  const goToRepertoire = (repertoire: IRepertoire, variantName?: string) => {
    navigate(`/repertoire/${repertoire._id}${variantName ? `?variantName=${variantName}` : ''}`);
  };

  const goToTrainRepertoire = (repertoire: IRepertoire, variantName?: string) => {
    navigate(`/repertoire/train/${repertoire._id}${variantName ? `?variantName=${variantName}` : ''}`);
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
      <nav className="flex gap-2 sm:gap-4 p-2 sm:p-4 bg-primary z-20 sticky top-0 border-b border-gray-800 overflow-x-auto">
        <button
          className={`flex-shrink-0 whitespace-nowrap px-3 py-1.5 sm:px-4 sm:py-2 rounded-md sm:rounded-l sm:rounded-t-none text-sm sm:text-base font-semibold focus:outline-none transition-colors duration-150 ring-0 focus:ring-2 focus:ring-blue-400 ${selectedSection === 'dashboard' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-800 text-gray-200 hover:bg-gray-700'}`}
          onClick={() => handleSectionChange('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={`flex-shrink-0 whitespace-nowrap px-3 py-1.5 sm:px-4 sm:py-2 rounded-md sm:rounded-l sm:rounded-t-none text-sm sm:text-base font-semibold focus:outline-none transition-colors duration-150 ring-0 focus:ring-2 focus:ring-blue-400 ${selectedSection === 'overview' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-800 text-gray-200 hover:bg-gray-700'}`}
          onClick={() => handleSectionChange('overview')}
        >
          Overview
        </button>
        <button
          className={`flex-shrink-0 whitespace-nowrap px-3 py-1.5 sm:px-4 sm:py-2 rounded-md sm:rounded-l sm:rounded-t-none text-sm sm:text-base font-semibold focus:outline-none transition-colors duration-150 ring-0 focus:ring-2 focus:ring-blue-400 ${selectedSection === 'repertoires' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-800 text-gray-200 hover:bg-gray-700'}`}
          onClick={() => handleSectionChange('repertoires')}
        >
          Repertoires
        </button>
        <button
          className={`flex-shrink-0 whitespace-nowrap px-3 py-1.5 sm:px-4 sm:py-2 rounded-md sm:rounded-l sm:rounded-t-none text-sm sm:text-base font-semibold focus:outline-none transition-colors duration-150 ring-0 focus:ring-2 focus:ring-blue-400 ${selectedSection === 'openings' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-800 text-gray-200 hover:bg-gray-700'}`}
          onClick={() => handleSectionChange('openings')}
        >
          Openings
        </button>
        <button
          className={`flex-shrink-0 whitespace-nowrap px-3 py-1.5 sm:px-4 sm:py-2 rounded-md sm:rounded-l sm:rounded-t-none text-sm sm:text-base font-semibold focus:outline-none transition-colors duration-150 ring-0 focus:ring-2 focus:ring-blue-400 ${selectedSection === 'studies' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-800 text-gray-200 hover:bg-gray-700'}`}
          onClick={() => handleSectionChange('studies')}
        >
          Studies
        </button>
        <button
          className={`flex-shrink-0 whitespace-nowrap px-3 py-1.5 sm:px-4 sm:py-2 rounded-md sm:rounded-l sm:rounded-t-none text-sm sm:text-base font-semibold focus:outline-none transition-colors duration-150 ring-0 focus:ring-2 focus:ring-blue-400 ${selectedSection === 'errors' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-800 text-gray-200 hover:bg-gray-700'}`}
          onClick={() => handleSectionChange('errors')}
        >
          Errors
        </button>
        <button
          className={`flex-shrink-0 whitespace-nowrap px-3 py-1.5 sm:px-4 sm:py-2 rounded-md sm:rounded-l sm:rounded-t-none text-sm sm:text-base font-semibold focus:outline-none transition-colors duration-150 ring-0 focus:ring-2 focus:ring-blue-400 ${selectedSection === 'unreviewed' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-800 text-gray-200 hover:bg-gray-700'}`}
          onClick={() => handleSectionChange('unreviewed')}
        >
          Unreviewed
        </button>
      </nav>
      <div className="sm:hidden flex items-center justify-center gap-1 px-3 py-1.5 bg-primary/90 border-b border-gray-800 text-[11px] uppercase tracking-wide text-gray-400">
        <ArrowsRightLeftIcon className="h-3.5 w-3.5 text-gray-500 animate-pulse" />
        <span>Swipe left/right for tabs</span>
      </div>
      <div className="flex-1 flex flex-col relative min-h-0">
        {selectedSection === 'dashboard' && (
          <DashboardSection
            repertoires={repertoires}
          />
        )}
        {selectedSection === 'overview' && (
          <OverviewSection
            repertoires={repertoires}
          />
        )}
        {selectedSection === 'repertoires' && (
          <RepertoiresSection
            orientationFilter={orientationFilter}
            setOrientationFilter={setOrientationFilter}
            repertoireNameFilter={repertoireNameFilter}
            setRepertoireNameFilter={setRepertoireNameFilter}
            nameFilteredRepertoires={nameFilteredRepertoires}
            goToRepertoire={goToRepertoire}
            goToTrainRepertoire={goToTrainRepertoire}
            getTrainVariants={getTrainVariants}
            getTrainVariantInfo={getTrainVariantInfo}
            updateRepertoires={updateRepertoires}
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
            goToTrainRepertoire={goToTrainRepertoire}
          />
        )}
        {selectedSection === 'studies' && (
          <StudiesSection />
        )}
        {selectedSection === 'errors' && (
          <ErrorsSection repertoires={repertoires} />
        )}
        {selectedSection === 'unreviewed' && (
          <UnreviewedSection repertoires={repertoires} />
        )}
      </div>
    </div>
  );
};
