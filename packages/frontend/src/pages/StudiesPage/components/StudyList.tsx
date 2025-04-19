import React from "react";
import { Study } from "../models";

interface StudyListProps {
  studies: Study[];
  onSelectStudy: (study: Study) => void;
}

const StudyList: React.FC<StudyListProps> = ({ studies, onSelectStudy }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
    {studies.map((study) => (
      <div
        key={study.id}
        className="bg-slate-800 rounded-lg shadow p-3 cursor-pointer hover:shadow-lg transition animate-fade-in w-full"
        onClick={() => onSelectStudy(study)}
      >
        <h3 className="font-semibold text-lg text-white mb-2 truncate">{study.name}</h3>
        <div className="flex flex-wrap gap-1 mb-2">
          {study.tags.map((tag) => (
            <span key={tag} className="bg-blue-700 text-white px-2 py-0.5 rounded text-xs">{tag}</span>
          ))}
        </div>
        <div className="text-xs text-slate-400">{study.entries.length} entries</div>
      </div>
    ))}
    {studies.length === 0 && (
      <div className="text-slate-400 text-sm col-span-full">No studies found.</div>
    )}
  </div>
);

export default StudyList;
