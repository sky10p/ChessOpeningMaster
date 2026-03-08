import React from "react";

export const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-text-subtle">{children}</p>
);

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`bg-surface rounded-xl border border-border-subtle p-4 ${className}`}>{children}</div>
);
