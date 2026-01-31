import React from "react";
import { IRepertoireDashboard } from "@chess-opening-master/common";

interface InvalidOrientationWarningProps {
  repertoires: IRepertoireDashboard[];
}

export const InvalidOrientationWarning: React.FC<InvalidOrientationWarningProps> = ({
  repertoires,
}) => {
  if (repertoires.length === 0) return null;

  return (
    <div className="text-yellow-400 text-xs mb-2">
      Warning: {repertoires.length} repertoire(s) have missing or invalid
      orientation and will only appear in "All".
      <br />
      <span className="block mt-1">Debug list:</span>
      <ul className="list-disc ml-4">
        {repertoires.map((r) => (
          <li key={r._id}>
            {r.name} (orientation: {String(r.orientation)})
          </li>
        ))}
      </ul>
    </div>
  );
};
