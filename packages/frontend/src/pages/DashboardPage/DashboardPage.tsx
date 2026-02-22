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
import { PathInsightsSection } from "./sections/PathInsightsSection";
import { ArrowsRightLeftIcon } from "@heroicons/react/24/solid";
import {
  Squares2X2Icon,
  ChartPieIcon,
  MapIcon,
  BookOpenIcon,
  FolderOpenIcon,
  AcademicCapIcon,
  ExclamationTriangleIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { Tabs, TabButton } from "../../components/ui";

const SECTION_ICONS: Record<string, React.ReactNode> = {
  dashboard:    <Squares2X2Icon className="w-4 h-4" />,
  overview:     <ChartPieIcon className="w-4 h-4" />,
  pathInsights: <MapIcon className="w-4 h-4" />,
  repertoires:  <BookOpenIcon className="w-4 h-4" />,
  openings:     <FolderOpenIcon className="w-4 h-4" />,
  studies:      <AcademicCapIcon className="w-4 h-4" />,
  errors:       <ExclamationTriangleIcon className="w-4 h-4" />,
  unreviewed:   <EyeIcon className="w-4 h-4" />,
};

export const DashboardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { repertoires, updateRepertoires } = useDashboard();
  const [orientationFilter, setOrientationFilter] = useState<
    "all" | "white" | "black"
  >("all");
  const [repertoireNameFilter, setRepertoireNameFilter] = useState<string>("");
  const [openingNameFilter, setOpeningNameFilter] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<
    "dashboard" | "pathInsights" | "overview" | "repertoires" | "openings" | "studies" | "errors" | "unreviewed"
  >("dashboard");

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const section = params.get("section");
    if (
      section === "dashboard" ||
      section === "pathInsights" ||
      section === "overview" ||
      section === "repertoires" ||
      section === "openings" ||
      section === "studies" ||
      section === "errors" ||
      section === "unreviewed"
    ) {
      setSelectedSection(section);
    }
  }, [location.search]);

  const handleSectionChange = (
    section: "dashboard" | "pathInsights" | "overview" | "repertoires" | "openings" | "studies" | "errors" | "unreviewed"
  ) => {
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
    <div className="w-full h-full min-h-0 self-stretch bg-page rounded-none sm:rounded-xl shadow-elevated flex flex-col overflow-hidden border border-border-subtle">
      <Tabs variant="pill" className="sticky top-0 z-20 gap-1 p-2 sm:p-4 bg-surface border-b border-border-subtle">
        {(
          [
            ["dashboard",    "Dashboard"],
            ["overview",     "Overview"],
            ["pathInsights", "Path Insights"],
            ["repertoires",  "Repertoires"],
            ["openings",     "Openings"],
            ["studies",      "Studies"],
            ["errors",       "Errors"],
            ["unreviewed",   "Unreviewed"],
          ] as const
        ).map(([id, label]) => (
          <TabButton
            key={id}
            variant="pill"
            active={selectedSection === id}
            onClick={() => handleSectionChange(id)}
          >
            {SECTION_ICONS[id]}
            {label}
          </TabButton>
        ))}
      </Tabs>
      <div className="sm:hidden flex items-center justify-center gap-1 px-3 py-1.5 bg-surface/90 border-b border-border-subtle text-[11px] uppercase tracking-wide text-text-subtle">
        <ArrowsRightLeftIcon className="h-3.5 w-3.5 text-text-subtle animate-pulse" />
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
        {selectedSection === 'pathInsights' && <PathInsightsSection />}
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
