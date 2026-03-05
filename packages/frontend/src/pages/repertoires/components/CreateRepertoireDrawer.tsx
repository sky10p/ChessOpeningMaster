import React from "react";
import { useNavigate } from "react-router-dom";
import { createRepertoire } from "../../../repository/repertoires/repertoires";
import { Drawer, Button, Input } from "../../../components/ui";
import { useNavbarDispatch } from "../../../contexts/NavbarContext";

interface CreateRepertoireDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const CreateRepertoireDrawer: React.FC<CreateRepertoireDrawerProps> = ({
  open,
  onClose,
}) => {
  const navigate = useNavigate();
  const { updateRepertoires } = useNavbarDispatch();
  const [name, setName] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const handleClose = React.useCallback(() => {
    if (submitting) {
      return;
    }
    setName("");
    setError(null);
    onClose();
  }, [onClose, submitting]);

  const handleSubmit = React.useCallback(async () => {
    if (!name.trim()) {
      setError("Repertoire name is required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const createdRepertoire = await createRepertoire(name.trim());
      await updateRepertoires();
      handleClose();
      navigate(`/repertoire/${createdRepertoire.insertedId}`);
    } catch {
      setError("Unable to create repertoire right now.");
    } finally {
      setSubmitting(false);
    }
  }, [handleClose, name, navigate, updateRepertoires]);

  return (
    <Drawer
      open={open}
      title="Create repertoire"
      description="Start a new opening workspace without leaving the library."
      onClose={handleClose}
      footer={
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button intent="secondary" size="md" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button intent="primary" size="md" onClick={() => void handleSubmit()} loading={submitting}>
            Create repertoire
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Input
          label="Repertoire name"
          placeholder="e.g. White Repertoire"
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={Boolean(error)}
          errorMessage={error ?? undefined}
          size="lg"
        />
      </div>
    </Drawer>
  );
};
