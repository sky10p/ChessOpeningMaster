import React, { useEffect, useState } from "react";
import { createRepertoire } from "../../repository/repertoires/repertoires";
import { useNavigate } from "react-router-dom";
import { useNavbarDispatch } from "../../contexts/NavbarContext";
import { Button, Input } from "../../components/ui";

const CreateRepertoire: React.FC = () => {
  const [repertoireName, setRepertoireName] = useState("");
  const { setOpen, updateRepertoires } = useNavbarDispatch();
  const navigate = useNavigate();
  useEffect(() => {
    setOpen(false);
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRepertoireName(event.target.value);
  };

  const handleCreateRepertoire = async () => {
    const createdRepertoire = await createRepertoire(repertoireName);
    const id = createdRepertoire.insertedId;
    updateRepertoires();
    navigate(`/repertoire/${id}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-page text-text-base">
      <div className="max-w-md w-full p-8 bg-surface rounded-xl shadow-elevated">
        <h1 className="text-2xl font-bold text-center mb-4">Crear nuevo repertorio</h1>
        <p className="text-center mb-4 text-text-muted">Ingresa el nombre de tu nuevo repertorio de aperturas personalizado.</p>
        <Input
          type="text"
          className="mb-4"
          placeholder="Nombre del repertorio"
          value={repertoireName}
          onChange={handleChange}
        />
        <div className="flex justify-center">
          <Button
            intent="accent"
            size="md"
            onClick={handleCreateRepertoire}
          >
            Crear repertorio
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateRepertoire;
