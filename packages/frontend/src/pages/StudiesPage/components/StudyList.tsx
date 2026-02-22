import React from "react";
import { Study } from "../models";
import StudyCard from "./display/StudyCard";

export interface StudyListProps {
  studies: Study[];
  onSelectStudy: (study: Study) => void;
}

const StudyList = ({ studies, onSelectStudy }: StudyListProps): React.ReactElement => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
      {studies.map((study) => (
        <StudyCard 
          key={study.id} 
          study={study} 
          onClick={() => onSelectStudy(study)} 
        />
      ))}
      {studies.length === 0 && (
        <div className="text-text-subtle text-sm col-span-full">No studies found.</div>
      )}
    </div>
  );
};

export default React.memo(StudyList);
