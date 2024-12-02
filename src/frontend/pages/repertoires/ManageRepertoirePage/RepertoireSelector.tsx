import React, { useState } from "react";
import { Select, MenuItem, Box } from "@mui/material";
import { IRepertoire } from "../../../../common/types/Repertoire";
import ManageVariant from "./ManageVariant";
import { getRepertoire } from "../../../repository/repertoires/repertoires";
import { Variant } from "../../../models/chess.models";
import { deleteVariant } from "../../../repository/repertoires/variants";
import { useDialogContext } from "../../../contexts/DialogContext";

interface RepertoireSelectorProps {
  repertoires: IRepertoire[];
}

const RepertoireSelector: React.FC<RepertoireSelectorProps> = ({ repertoires }) => {
  const [selectedRepertoire, setSelectedRepertoire] = useState<IRepertoire | undefined>(undefined);
  const { showConfirmDialog } = useDialogContext();

  const handleSelectRepertoire = async (id: string) => {
    const repertoire = await getRepertoire(id);
    setSelectedRepertoire(repertoire);
  };

  const handleDeleteVariant = async (variant: Variant) => {
    if (!selectedRepertoire) return;
    showConfirmDialog({
      title: "Delete variant of a repertoire",
      contentText: `Are you sure you want to delete ${variant.fullName}?`,
      onConfirm: async () => {
        await deleteVariant(selectedRepertoire, variant);
        const repertoire = await getRepertoire(selectedRepertoire._id);
        setSelectedRepertoire(repertoire);
      },
    });
  };

  return (
    <Box p={2} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Select
        fullWidth
        value={selectedRepertoire?._id || ""}
        onChange={(e) => handleSelectRepertoire(e.target.value)}
      >
        {repertoires.map((rep) => (
          <MenuItem key={rep._id} value={rep._id}>
            {rep.name}
          </MenuItem>
        ))}
      </Select>
      <Box flexGrow={1} mt={2} style={{ overflow: 'auto' }}>
        <ManageVariant repertoire={selectedRepertoire} onDeleteRepertoire={handleDeleteVariant} />
      </Box>
    </Box>
  );
};

export default RepertoireSelector;