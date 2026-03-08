import React from "react";
import { BoardWorkspaceShell } from "../../../components/design/layouts/BoardWorkspaceShell";

interface RepertoireWorkspaceLayoutProps {
  title: string;
  titleExtra?: React.ReactNode;
  mobileActionRow?: React.ReactNode;
  board: React.ReactNode;
  boardActions?: React.ReactNode;
  mobilePanel: React.ReactNode;
  desktopPanel: React.ReactNode;
}

export const RepertoireWorkspaceLayout: React.FC<
  RepertoireWorkspaceLayoutProps
> = ({ title, titleExtra, mobileActionRow, board, boardActions, mobilePanel, desktopPanel }) => {
  return (
    <div className="grid h-full w-full grid-cols-1 gap-4 bg-page text-text-base sm:grid-cols-12">
      <div className="col-span-12">
        <BoardWorkspaceShell
          title={title}
          titleExtra={titleExtra}
          mobileActionRow={mobileActionRow}
          board={board}
          boardActions={boardActions}
          mobilePanel={mobilePanel}
          desktopPanel={desktopPanel}
        />
      </div>
    </div>
  );
};
