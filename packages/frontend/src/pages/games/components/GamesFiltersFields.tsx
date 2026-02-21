import React from "react";
import { GlobalFilterState } from "../types";

type GamesFiltersFieldsProps = {
  filtersDraft: GlobalFilterState;
  setFiltersDraft: React.Dispatch<React.SetStateAction<GlobalFilterState>>;
};

const selectClassName = "bg-slate-800 p-2 rounded text-sm text-slate-100 border border-slate-700";

const GamesFiltersFields: React.FC<GamesFiltersFieldsProps> = ({ filtersDraft, setFiltersDraft }) => (
  <>
    <select value={filtersDraft.source} onChange={(event) => setFiltersDraft((prev) => ({ ...prev, source: event.target.value as GlobalFilterState["source"] }))} className={selectClassName}>
      <option value="all">All sources</option>
      <option value="lichess">Lichess</option>
      <option value="chesscom">Chess.com</option>
      <option value="manual">Manual PGN</option>
    </select>
    <select value={filtersDraft.color} onChange={(event) => setFiltersDraft((prev) => ({ ...prev, color: event.target.value as GlobalFilterState["color"] }))} className={selectClassName}>
      <option value="all">All colors</option>
      <option value="white">White</option>
      <option value="black">Black</option>
    </select>
    <select value={filtersDraft.timeControlBucket} onChange={(event) => setFiltersDraft((prev) => ({ ...prev, timeControlBucket: event.target.value as GlobalFilterState["timeControlBucket"] }))} className={selectClassName}>
      <option value="all">All speeds</option>
      <option value="bullet">Bullet</option>
      <option value="blitz">Blitz</option>
      <option value="rapid">Rapid</option>
      <option value="classical">Classical</option>
    </select>
    <select value={filtersDraft.mapped} onChange={(event) => setFiltersDraft((prev) => ({ ...prev, mapped: event.target.value as GlobalFilterState["mapped"] }))} className={selectClassName}>
      <option value="all">Mapped + unmapped</option>
      <option value="mapped">Mapped only</option>
      <option value="unmapped">Unmapped only</option>
    </select>
    <input type="date" value={filtersDraft.dateFrom} onChange={(event) => setFiltersDraft((prev) => ({ ...prev, dateFrom: event.target.value }))} className={selectClassName} />
    <input type="date" value={filtersDraft.dateTo} onChange={(event) => setFiltersDraft((prev) => ({ ...prev, dateTo: event.target.value }))} className={selectClassName} />
    <input value={filtersDraft.openingQuery} onChange={(event) => setFiltersDraft((prev) => ({ ...prev, openingQuery: event.target.value }))} className={selectClassName} placeholder="Opening or variant..." />
  </>
);

export default GamesFiltersFields;
