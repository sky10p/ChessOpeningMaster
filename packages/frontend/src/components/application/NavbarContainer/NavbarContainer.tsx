import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

import { IRepertoire } from "../../../../../common/src/types/Repertoire";
import { useNavbarContext } from "../../../contexts/NavbarContext";
import {
  deleteRepertoire,
  duplicateRepertoire,
  putRepertoireName,
  putRepertoireOrderUp,
} from "../../../repository/repertoires/repertoires";
import { useDialogContext } from "../../../contexts/DialogContext";

import { useMenuContext } from "../../../contexts/MenuContext";
import { Navbar } from "../../design/Navbar/Navbar.tailwind";
import { API_URL } from "../../../repository/constants";



const NavbarContainer: React.FC = () => {
  const { open, setOpen, repertoires, updateRepertoires } = useNavbarContext();
  const { showConfirmDialog, showTextDialog } = useDialogContext();
  const { showMenu } = useMenuContext();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  useEffect(() => {
    updateRepertoires();
  }, []);

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

  return <Navbar open={open} setOpen={setOpen}
  mainActions={[
    {id: "download_repertoires", name: "Download Repertoires", url: `${API_URL}/repertoires/download`, icon: <FileDownloadIcon />},
    { id: "create_repertoire", name: "Create Repertoire", url: "/create-repertoire", icon: <AddIcon /> },
  ]}
  secondaryActions={repertoires.map((repertoire) => ({
    id: repertoire._id,
    name: repertoire.name,
    url: `/repertoire/${repertoire._id}`,
    onActionClick: (event) =>
      showMenu(event.currentTarget, [
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
