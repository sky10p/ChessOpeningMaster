import React from "react";

export const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-3">{children}</p>
);

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`bg-surface rounded-xl border border-border-subtle p-4 ${className}`}>{children}</div>
);
