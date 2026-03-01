import React from "react";
import { GlobalFilterState } from "../types";
import { Input, Select } from "../../../components/ui";

type GamesFiltersFieldsProps = {
  filtersDraft: GlobalFilterState;
  setFiltersDraft: React.Dispatch<React.SetStateAction<GlobalFilterState>>;
};

const GamesFiltersFields: React.FC<GamesFiltersFieldsProps> = ({ filtersDraft, setFiltersDraft }) => (
  <>
    <Select value={filtersDraft.source} onChange={(event) => setFiltersDraft((prev) => ({ ...prev, source: event.target.value as GlobalFilterState["source"] }))}>
      <option value="all">All sources</option>
      <option value="lichess">Lichess</option>
      <option value="chesscom">Chess.com</option>
      <option value="manual">Manual PGN</option>
    </Select>
    <Select value={filtersDraft.color} onChange={(event) => setFiltersDraft((prev) => ({ ...prev, color: event.target.value as GlobalFilterState["color"] }))}>
      <option value="all">All colors</option>
      <option value="white">White</option>
      <option value="black">Black</option>
    </Select>
    <Select value={filtersDraft.timeControlBucket} onChange={(event) => setFiltersDraft((prev) => ({ ...prev, timeControlBucket: event.target.value as GlobalFilterState["timeControlBucket"] }))}>
      <option value="all">All speeds</option>
      <option value="bullet">Bullet</option>
      <option value="blitz">Blitz</option>
      <option value="rapid">Rapid</option>
      <option value="classical">Classical</option>
    </Select>
    <Select value={filtersDraft.mapped} onChange={(event) => setFiltersDraft((prev) => ({ ...prev, mapped: event.target.value as GlobalFilterState["mapped"] }))}>
      <option value="all">Mapped + unmapped</option>
      <option value="mapped">Mapped only</option>
      <option value="unmapped">Unmapped only</option>
    </Select>
    <Input type="date" value={filtersDraft.dateFrom} onChange={(event) => setFiltersDraft((prev) => ({ ...prev, dateFrom: event.target.value }))} />
    <Input type="date" value={filtersDraft.dateTo} onChange={(event) => setFiltersDraft((prev) => ({ ...prev, dateTo: event.target.value }))} />
    <Input value={filtersDraft.openingQuery} onChange={(event) => setFiltersDraft((prev) => ({ ...prev, openingQuery: event.target.value }))} placeholder="Opening or variant..." />
  </>
);

export default GamesFiltersFields;
