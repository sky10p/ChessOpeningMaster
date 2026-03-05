import React from "react";

interface AuthPageShellProps {
  title: string;
  description: string;
  asideTitle: string;
  asideDescription: string;
  children: React.ReactNode;
}

const AuthPageShell: React.FC<AuthPageShellProps> = ({
  title,
  description,
  asideTitle,
  asideDescription,
  children,
}) => {
  return (
    <div className="flex min-h-screen w-full items-stretch bg-page">
      <div className="hidden flex-1 border-r border-border-subtle bg-page-subtle px-10 py-12 lg:flex lg:flex-col lg:justify-between">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-text-subtle">ChessKeep</p>
          <div className="space-y-3">
            <h1 className="max-w-lg text-[2.5rem] font-semibold leading-tight tracking-[-0.04em] text-text-base">
              {asideTitle}
            </h1>
            <p className="max-w-lg text-base leading-7 text-text-muted">{asideDescription}</p>
          </div>
        </div>
        <div className="grid max-w-xl gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border-subtle bg-surface px-5 py-4 shadow-sm">
            <p className="text-sm font-semibold text-text-base">Clear next actions</p>
            <p className="mt-2 text-sm leading-6 text-text-muted">
              Focus on due lessons, training plans, and opening upkeep without searching the app.
            </p>
          </div>
          <div className="rounded-2xl border border-border-subtle bg-surface px-5 py-4 shadow-sm">
            <p className="text-sm font-semibold text-text-base">Consistent workspace</p>
            <p className="mt-2 text-sm leading-6 text-text-muted">
              Move between repertoire editing, training, games, and studies with one system.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-lg rounded-[1.75rem] border border-border-subtle bg-surface shadow-elevated">
          <div className="border-b border-border-subtle px-6 py-6 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-subtle">Welcome</p>
            <h1 className="mt-2 text-[2rem] font-semibold leading-tight tracking-[-0.03em] text-text-base">
              {title}
            </h1>
            <p className="mt-2 text-sm leading-6 text-text-muted">{description}</p>
          </div>
          <div className="px-6 py-6 sm:px-8 sm:py-8">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default AuthPageShell;
