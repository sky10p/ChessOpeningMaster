import React from "react";
import { LinkedGameAccount } from "@chess-opening-master/common";
import { formatDateTime } from "../utils";

type SyncTabState = {
  provider: "lichess" | "chesscom";
  providerOptions: Array<{ value: "lichess" | "chesscom"; label: string }>;
  username: string;
  token: string;
  manualPgn: string;
  tags: string;
  tournamentGroup: string;
  accounts: LinkedGameAccount[];
};

type SyncTabActions = {
  setProvider: React.Dispatch<React.SetStateAction<"lichess" | "chesscom">>;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  setToken: React.Dispatch<React.SetStateAction<string>>;
  setManualPgn: React.Dispatch<React.SetStateAction<string>>;
  setTags: React.Dispatch<React.SetStateAction<string>>;
  setTournamentGroup: React.Dispatch<React.SetStateAction<string>>;
  connectAccount: () => Promise<void>;
  syncProvider: (source: "lichess" | "chesscom") => Promise<void>;
  disconnectAccount: (source: "lichess" | "chesscom") => Promise<void>;
  uploadPgnFile: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  runManualImport: () => Promise<void>;
};

type SyncTabProps = {
  state: SyncTabState;
  actions: SyncTabActions;
};

const SyncTab: React.FC<SyncTabProps> = ({ state, actions }) => (
  <>
    <section className="bg-slate-900 rounded-lg border border-slate-700 p-3 sm:p-4 space-y-3">
      <h2 className="text-lg font-semibold text-slate-100">Linked Accounts</h2>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
        <select value={state.provider} onChange={(event) => actions.setProvider(event.target.value as "lichess" | "chesscom")} className="bg-slate-800 p-2 rounded text-slate-100">
          {state.providerOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <input value={state.username} onChange={(event) => actions.setUsername(event.target.value)} className="bg-slate-800 p-2 rounded text-slate-100" placeholder="Username" />
        <input value={state.token} onChange={(event) => actions.setToken(event.target.value)} className="bg-slate-800 p-2 rounded text-slate-100" placeholder="Optional token" />
        <button className="bg-emerald-600 rounded p-2 hover:bg-emerald-500" onClick={() => { void actions.connectAccount(); }}>Connect</button>
      </div>
      <div className="space-y-2">
        {state.accounts.map((account) => (
          <div key={account.id} className="flex flex-wrap gap-2 items-center bg-slate-800/90 rounded p-2">
            <span className="font-medium text-slate-100">{account.provider} | {account.username}</span>
            <span className="text-xs text-slate-400">Connected: {formatDateTime(account.connectedAt)}</span>
            <span className="text-xs text-slate-400">Status: {account.status}</span>
            <span className="text-xs text-slate-400">Last sync: {formatDateTime(account.lastSyncAt)}</span>
            {account.lastSyncFeedback ? (
              <span className="text-xs text-slate-400">Last result +{account.lastSyncFeedback.importedCount} | dup {account.lastSyncFeedback.duplicateCount} | fail {account.lastSyncFeedback.failedCount}</span>
            ) : null}
            <button className="bg-blue-600 rounded px-2 py-1 text-sm hover:bg-blue-500" onClick={() => { void actions.syncProvider(account.provider); }}>Sync</button>
            <button className="bg-rose-700 rounded px-2 py-1 text-sm hover:bg-rose-600" onClick={() => { void actions.disconnectAccount(account.provider); }}>Disconnect</button>
          </div>
        ))}
      </div>
    </section>

    <section className="bg-slate-900 rounded-lg border border-slate-700 p-3 sm:p-4 space-y-3">
      <h2 className="text-lg font-semibold text-slate-100">Manual PGN Import</h2>
      <div className="grid sm:grid-cols-2 gap-2">
        <input value={state.tournamentGroup} onChange={(event) => actions.setTournamentGroup(event.target.value)} className="bg-slate-800 p-2 rounded text-slate-100" placeholder="Tournament group (optional)" />
        <input value={state.tags} onChange={(event) => actions.setTags(event.target.value)} className="bg-slate-800 p-2 rounded text-slate-100" placeholder="Tags (comma-separated)" />
      </div>
      <textarea value={state.manualPgn} onChange={(event) => actions.setManualPgn(event.target.value)} className="w-full min-h-[180px] bg-slate-800 p-2 rounded text-slate-100" placeholder="Paste PGN" />
      <div className="flex gap-2">
        <input type="file" accept=".pgn" onChange={(event) => { void actions.uploadPgnFile(event); }} className="text-sm text-slate-300" />
        <button className="bg-indigo-600 rounded px-3 py-2 hover:bg-indigo-500" onClick={() => { void actions.runManualImport(); }}>Import PGN</button>
      </div>
    </section>
  </>
);

export default SyncTab;
