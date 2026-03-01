import React from "react";
import { FolderIcon } from "@heroicons/react/24/outline";
import { EmptyState } from "../../../components/ui";
import { Study } from "../models";
import StudyCard from "./display/StudyCard";

export interface StudyListProps {
  studies: Study[];
  onSelectStudy: (study: Study) => void;
  emptyAction?: React.ReactNode;
}

const StudyList = ({ studies, onSelectStudy, emptyAction }: StudyListProps): React.ReactElement => {
  if (studies.length === 0) {
    return (
      <EmptyState
        icon={FolderIcon}
        title="No studies found"
        description="Create a study or adjust your filters to see results in this group."
        action={emptyAction}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {studies.map((study) => (
        <StudyCard
          key={study.id}
          study={study}
          onClick={() => onSelectStudy(study)}
        />
      ))}
    </div>
  );
};

export default StudyList;
