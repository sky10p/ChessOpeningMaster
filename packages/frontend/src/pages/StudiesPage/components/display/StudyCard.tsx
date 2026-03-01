import React from "react";
import { Card } from "../../../../components/ui";
import { Study } from "../../models";
import TagDisplay from "../display/TagDisplay";

interface StudyCardProps {
  study: Study;
  onClick: () => void;
}

const StudyCard: React.FC<StudyCardProps> = ({ study, onClick }) => {
  const sessionsCount = study.sessions?.length || 0;

  return (
    <Card
      interactive
      padding="default"
      elevation="raised"
      className="group w-full bg-surface"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
    >
      <h3 className="mb-2 truncate text-base font-semibold text-text-base transition-colors group-hover:text-brand">
        {study.name}
      </h3>
      <TagDisplay tags={study.tags} />
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-text-muted">
        <span>{study.entries.length} {study.entries.length === 1 ? "entry" : "entries"}</span>
        <span>{sessionsCount} {sessionsCount === 1 ? "session" : "sessions"}</span>
      </div>
    </Card>
  );
};

export default StudyCard;
