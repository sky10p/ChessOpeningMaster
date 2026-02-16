import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PlusIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";

import {
  deleteRepertoire,
  downloadRepertoiresBackup,
  duplicateRepertoire,
  putRepertoireName,
  putRepertoireOrderUp,
} from "../../../repository/repertoires/repertoires";
import { useDialogContext } from "../../../contexts/DialogContext";

import { useMenuContext } from "../../../contexts/MenuContext";
import { Navbar } from "../../design/Navbar/Navbar";
import { useNavbarDispatch, useNavbarState } from "../../../contexts/NavbarContext";
import { IRepertoire } from "@chess-opening-master/common";
import { logout } from "../../../repository/auth/auth";
import { useAlertContext } from "../../../contexts/AlertContext";


interface NavbarContainerProps {
  authEnabled: boolean;
  onLoggedOut: () => void;
}

const shouldShowDownloadRepertoires = process.env.SHOW_DOWNLOAD_REPERTOIRES !== "false";

const NavbarContainer: React.FC<NavbarContainerProps> = ({ authEnabled, onLoggedOut }) => {
  const { open, repertoires } = useNavbarState();
  const safeRepertoires = Array.isArray(repertoires) ? repertoires : [];
  const {setOpen, updateRepertoires} = useNavbarDispatch();
  const { showConfirmDialog, showTextDialog } = useDialogContext();
  const { showAlert } = useAlertContext();
  const { toggleMenu } = useMenuContext();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  useEffect(() => {
    updateRepertoires();
  }, [updateRepertoires]);

  const handleLogout = async () => {
    if (authEnabled) {
      await logout().catch(() => undefined);
    }
    onLoggedOut();
    navigate("/login");
  };

  const handleEdit = (repertoire: IRepertoire) => {
    showTextDialog({
      title: "Edit Repertoire",
      contentText: "Enter a new name for the repertoire",
      onTextConfirm: async (newName: string) => {
        await putRepertoireName(repertoire._id, newName);
        updateRepertoires();
        navigate(`/repertoire/${repertoire._id}`);
      },
    });
  };

  const handleDuplicate = (repertoire: IRepertoire) => {
    showTextDialog({
      title: "Duplicate Repertoire",
      contentText: "Enter a new name for the repertoire",
      onTextConfirm: async (newName: string) => {
        await duplicateRepertoire(repertoire._id, newName);
        updateRepertoires();
        navigate(`/repertoire/${repertoire._id}`);
      },
    });
  };

  const handleOrderUp = async (repertoire: IRepertoire) => {
    await putRepertoireOrderUp(repertoire._id);
    updateRepertoires();
  };

  const handleDelete = (repertoire: IRepertoire) => {
    showConfirmDialog({
      title: "Delete Repertoire",
      contentText: `Are you sure you want to delete ${repertoire.name}?`,
      onConfirm: async () => {
        await deleteRepertoire(repertoire._id);
        updateRepertoires();
        if (pathname.includes(repertoire._id)) {
          navigate(`/create-repertoire`);
        }
      },
    });
  };

  const handleDownloadRepertoires = async () => {
    try {
      await downloadRepertoiresBackup();
    } catch {
      showAlert("Unable to download repertoires for current user.", "error");
    }
  };

  return <Navbar open={open} setOpen={setOpen}
  mainActions={[
    ...(shouldShowDownloadRepertoires
      ? [{id: "download_repertoires", name: "Download Repertoires", url: "#", onClick: handleDownloadRepertoires, icon: <ArrowDownTrayIcon className="h-6 w-6 mr-2" />}]
      : []),
    { id: "create_repertoire", name: "Create Repertoire", url: "/create-repertoire", icon: <PlusIcon className="h-6 w-6 mr-2" /> },
    { id: "my_games", name: "My Games", url: "/games", icon: <ArrowDownTrayIcon className="h-6 w-6 mr-2" /> },
  ]}
  showLogout={authEnabled}
  onLogout={handleLogout}
  secondaryActions={safeRepertoires.map((repertoire) => ({
    id: repertoire._id,
    name: repertoire.name,
    url: `/repertoire/${repertoire._id}`,
    onActionClick: (event) =>
      toggleMenu(event.currentTarget, [
        {
          name: "Move to Up",
          action: () => handleOrderUp(repertoire),
        },
        {
          name: "Duplicate",
          action: () => handleDuplicate(repertoire),
        },
        { name: "Edit", action: () => handleEdit(repertoire) },
        { name: "Delete", action: () => handleDelete(repertoire) },
      ]),
  }))} />;
};

export default NavbarContainer;
