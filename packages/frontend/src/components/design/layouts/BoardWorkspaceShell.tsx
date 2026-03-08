import React from "react";
import { cn } from "../../../utils/cn";

interface BoardWorkspaceShellProps {
  title: string;
  titleExtra?: React.ReactNode;
  mobileActionRow?: React.ReactNode;
  board: React.ReactNode;
  boardActions?: React.ReactNode;
  mobilePanel: React.ReactNode;
  desktopPanel: React.ReactNode;
  className?: string;
}

export const BoardWorkspaceShell: React.FC<BoardWorkspaceShellProps> = ({
  title,
  titleExtra,
  mobileActionRow,
  board,
  boardActions,
  mobilePanel,
  desktopPanel,
  className,
}) => {
  return (
    <div className={cn("mx-auto flex h-full w-full max-w-[82rem] flex-col gap-2 px-1.5 py-2 sm:gap-3 sm:px-4 sm:py-3 lg:px-5 xl:px-6", className)}>
      <div className="flex flex-col gap-1 border-0 bg-transparent px-1 py-0 shadow-none sm:gap-2 sm:rounded-2xl sm:border sm:border-border-subtle sm:bg-surface sm:px-5 sm:py-4 sm:shadow-surface">
        <div className="min-w-0">
          <p className="hidden text-xs font-semibold uppercase tracking-[0.16em] text-text-subtle sm:block">Workspace</p>
          <div className="flex flex-wrap items-center gap-2 sm:mt-1.5 sm:gap-3">
            <h1 className="truncate text-lg font-semibold leading-tight tracking-[-0.03em] text-text-base sm:text-[1.55rem] xl:text-[1.75rem]">
              {title}
            </h1>
            {titleExtra}
          </div>
        </div>
        {mobileActionRow ? (
          <div className="grid grid-cols-3 gap-1 pt-0 sm:gap-2 sm:pt-1 xl:hidden">
            {mobileActionRow}
          </div>
        ) : null}
      </div>

      <div className="grid min-h-0 flex-1 items-start gap-4 overflow-x-hidden xl:grid-cols-[minmax(0,1fr)_26rem] 2xl:grid-cols-[minmax(0,1fr)_28rem]">
        <section className="flex min-w-0 flex-col gap-2 rounded-xl border border-border-subtle bg-surface px-2 py-2 shadow-surface sm:gap-3 sm:rounded-2xl sm:px-4 sm:py-4 xl:self-start">
          <div className="rounded-xl bg-page-subtle px-1 py-1.5 sm:rounded-[1.25rem] sm:px-3 sm:py-4 xl:flex xl:items-start xl:justify-center">
            <div className="mx-auto w-full min-w-0 max-w-[21rem] sm:max-w-[28rem] lg:max-w-[32rem] xl:max-w-[38rem] 2xl:max-w-[40rem]">
              {board}
            </div>
          </div>
          {boardActions ? (
            <div className="flex items-center justify-center rounded-xl border border-border-subtle bg-surface-raised px-3 py-2 sm:rounded-2xl sm:px-4">
              {boardActions}
            </div>
          ) : null}
          <div className="min-w-0 overflow-x-hidden xl:hidden rounded-xl border border-border-subtle bg-surface-raised p-2 sm:rounded-2xl sm:p-3">
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
