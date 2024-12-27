import React, { useEffect, useState } from "react";
import { createRepertoire } from "../../repository/repertoires/repertoires";
import { useNavigate } from "react-router-dom";
import { useNavbarDispatch } from "../../contexts/NavbarContext";

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-textLight">
      <div className="max-w-md w-full p-8 bg-gray-800 rounded shadow-md">
        <h1 className="text-2xl font-bold text-center mb-4">Crear nuevo repertorio</h1>
        <p className="text-center mb-4">Ingresa el nombre de tu nuevo repertorio de aperturas personalizado.</p>
        <input
          type="text"
          className="w-full p-2 mb-4 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-accent"
          placeholder="Nombre del repertorio"
          value={repertoireName}
          onChange={handleChange}
        />
        <div className="flex justify-center">
          <button
            className="px-4 py-2 bg-accent text-black font-medium rounded hover:bg-yellow-500"
            onClick={handleCreateRepertoire}
          >
            Crear repertorio
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateRepertoire;
