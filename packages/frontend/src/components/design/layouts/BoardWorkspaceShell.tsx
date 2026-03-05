import React from "react";
import { cn } from "../../../utils/cn";

interface BoardWorkspaceShellProps {
  title: string;
  titleExtra?: React.ReactNode;
  board: React.ReactNode;
  boardActions?: React.ReactNode;
  mobilePanel: React.ReactNode;
  desktopPanel: React.ReactNode;
  className?: string;
}

export const BoardWorkspaceShell: React.FC<BoardWorkspaceShellProps> = ({
  title,
  titleExtra,
  board,
  boardActions,
  mobilePanel,
  desktopPanel,
  className,
}) => {
  return (
    <div className={cn("mx-auto flex h-full w-full max-w-[82rem] flex-col gap-3 px-2 py-3 sm:px-4 lg:px-5 xl:px-6", className)}>
      <div className="flex flex-col gap-2 rounded-2xl border border-border-subtle bg-surface px-4 py-3 shadow-surface sm:px-5 sm:py-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-subtle">Workspace</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="truncate text-[1.25rem] font-semibold leading-tight tracking-[-0.03em] text-text-base sm:text-[1.55rem] xl:text-[1.75rem]">
              {title}
            </h1>
            {titleExtra}
          </div>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_26rem] 2xl:grid-cols-[minmax(0,1fr)_28rem]">
        <section className="flex flex-col gap-3 rounded-2xl border border-border-subtle bg-surface px-3 py-3 shadow-surface sm:px-4 sm:py-4 xl:self-start">
          <div className="rounded-[1.25rem] bg-page-subtle px-2 py-3 sm:px-3 sm:py-4 xl:flex xl:items-start xl:justify-center">
            <div className="mx-auto w-full max-w-[21rem] sm:max-w-[28rem] lg:max-w-[32rem] xl:max-w-[38rem] 2xl:max-w-[40rem]">
              {board}
            </div>
          </div>
          {boardActions ? (
            <div className="flex items-center justify-center rounded-2xl border border-border-subtle bg-surface-raised px-3 py-2 sm:px-4">
              {boardActions}
            </div>
          ) : null}
          <div className="xl:hidden rounded-2xl border border-border-subtle bg-surface-raised p-3">
            {mobilePanel}
          </div>
        </section>

        <aside className="hidden min-h-0 overflow-y-auto rounded-2xl border border-border-subtle bg-surface shadow-surface xl:block">
          {desktopPanel}
        </aside>
      </div>
    </div>
  );
};
