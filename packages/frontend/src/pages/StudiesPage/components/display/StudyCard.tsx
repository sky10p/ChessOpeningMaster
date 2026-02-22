import React from "react";
import { Study } from "../../models";
import TagDisplay from "../display/TagDisplay";

interface StudyCardProps {
  study: Study;
  onClick: () => void;
}


const StudyCard: React.FC<StudyCardProps> = ({ study, onClick }) => {
  return (
    <div
      className="bg-surface-raised rounded-lg shadow p-3 cursor-pointer hover:shadow-lg transition animate-fade-in w-full"
      onClick={onClick}
    >
      <h3 className="font-semibold text-lg text-text-base mb-2 truncate">{study.name}</h3>
      <TagDisplay tags={study.tags} />
      <div className="text-xs text-text-subtle">{study.entries.length} entries</div>
    </div>
  );
};

export default StudyCard;
