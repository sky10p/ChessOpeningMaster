import React from "react";
import { CloudArrowDownIcon } from "@heroicons/react/24/outline";
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
  forceSyncAll: () => Promise<void>;
  disconnectAccount: (source: "lichess" | "chesscom") => Promise<void>;
  uploadPgnFile: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  runManualImport: () => Promise<void>;
};

type SyncTabProps = {
  state: SyncTabState;
  actions: SyncTabActions;
};

const inputCls = "w-full bg-surface-raised border border-border-default rounded-lg px-3 py-2 text-sm text-text-base placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors";

const SyncTab: React.FC<SyncTabProps> = ({ state, actions }) => (
  <div className="space-y-4">
    <div className="bg-surface rounded-xl border border-border-subtle p-4 space-y-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-text-subtle">Link an Account</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <select
          value={state.provider}
          onChange={(e) => actions.setProvider(e.target.value as "lichess" | "chesscom")}
          className={inputCls}
        >
          {state.providerOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <input value={state.username} onChange={(e) => actions.setUsername(e.target.value)} className={inputCls} placeholder="Username" />
        <input type="password" autoComplete="off" value={state.token} onChange={(e) => actions.setToken(e.target.value)} className={inputCls} placeholder="API token (optional)" />
      </div>
      <button
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors"
        onClick={() => { void actions.connectAccount(); }}
      >
        <CloudArrowDownIcon className="w-4 h-4" />
        Connect account
      </button>
      <button
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
        onClick={() => { void actions.forceSyncAll(); }}
      >
        <CloudArrowDownIcon className="w-4 h-4" />
        Force sync all
      </button>

      {state.accounts.length > 0 ? (
        <div className="space-y-2 pt-2 border-t border-border-subtle">
          <p className="text-xs font-semibold uppercase tracking-widest text-text-subtle">Connected</p>
          {state.accounts.map((account) => (
            <div key={account.id} className="rounded-lg border border-border-subtle p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-text-base capitalize">{account.provider} · {account.username}</p>
                  <p className="text-xs text-text-subtle mt-0.5">
                    Connected {formatDateTime(account.connectedAt)} · Status: {account.status}
                  </p>
                  {account.lastSyncAt ? (
                    <p className="text-xs text-text-subtle">Last sync {formatDateTime(account.lastSyncAt)}</p>
                  ) : null}
                  {account.nextSyncAt ? (
                    <p className="text-xs text-text-subtle">Next sync {formatDateTime(account.nextSyncAt)}</p>
                  ) : null}
                  {account.lastSyncFeedback ? (
                    <p className="text-xs text-text-subtle mt-0.5">
                      <span className="text-emerald-400">+{account.lastSyncFeedback.importedCount} imported</span>
                      {" · "}{account.lastSyncFeedback.duplicateCount} dup
                      {" · "}{account.lastSyncFeedback.failedCount} failed
                    </p>
                  ) : null}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors" onClick={() => { void actions.syncProvider(account.provider); }}>Sync now</button>
                  <button className="text-xs px-3 py-1.5 rounded-lg bg-surface-raised hover:bg-rose-900/60 text-rose-400 border border-border-default hover:border-rose-800 transition-colors" onClick={() => { void actions.disconnectAccount(account.provider); }}>Disconnect</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>

    <div className="bg-surface rounded-xl border border-border-subtle p-4 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-text-subtle">Manual PGN Import</p>
      <div className="grid sm:grid-cols-2 gap-3">
        <input value={state.tournamentGroup} onChange={(e) => actions.setTournamentGroup(e.target.value)} className={inputCls} placeholder="Tournament group (optional)" />
        <input value={state.tags} onChange={(e) => actions.setTags(e.target.value)} className={inputCls} placeholder="Tags (comma-separated)" />
      </div>
      <textarea
        value={state.manualPgn}
        onChange={(e) => actions.setManualPgn(e.target.value)}
        className={`${inputCls} min-h-[160px] resize-y font-mono text-xs`}
        placeholder="Paste PGN here…"
      />
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-xs text-text-subtle cursor-pointer">
          <span className="inline-block px-3 py-1.5 rounded-lg bg-surface-raised hover:bg-slate-700 border border-border-default transition-colors">Upload .pgn file</span>
          <input type="file" accept=".pgn" onChange={(e) => { void actions.uploadPgnFile(e); }} className="sr-only" />
        </label>
        <button className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors" onClick={() => { void actions.runManualImport(); }}>Import PGN</button>
      </div>
    </div>
  </div>
);

export default SyncTab;
