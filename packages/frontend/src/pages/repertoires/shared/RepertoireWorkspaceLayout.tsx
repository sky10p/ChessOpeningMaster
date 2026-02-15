import React from "react";

interface RepertoireWorkspaceLayoutProps {
  title: string;
  board: React.ReactNode;
  boardActions?: React.ReactNode;
  mobilePanel: React.ReactNode;
  desktopPanel: React.ReactNode;
}

export const RepertoireWorkspaceLayout: React.FC<
  RepertoireWorkspaceLayoutProps
> = ({ title, board, boardActions, mobilePanel, desktopPanel }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 h-full w-full bg-background text-textLight">
      <div className="col-span-12 sm:col-span-6 flex flex-col justify-center items-center">
        <div className="flex justify-center w-full p-1 sm:p-4">
          <h1 className="text-base sm:text-2xl font-bold">{title}</h1>
        </div>
        <div className="flex justify-center w-full sm:p-4 lg:max-h-[60vh] lg:max-w-[60vh]">
          {board}
        </div>
        {boardActions && (
          <div className="flex justify-center w-full p-1 sm:p-4">
            {boardActions}
          </div>
        )}
      </div>

      <div className="sm:hidden col-span-12 sm:col-span-6 flex flex-col items-start min-h-0 overflow-hidden border border-secondary rounded bg-gray-800">
        {mobilePanel}
      </div>

      <div className="hidden sm:flex sm:col-span-6 flex-col items-start overflow-auto border border-secondary rounded bg-gray-800">
        {desktopPanel}
      </div>
    </div>
  );
};
