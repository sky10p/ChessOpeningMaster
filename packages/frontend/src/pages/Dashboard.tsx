import React from "react";
import { useNavbarState } from "../contexts/NavbarContext";
import { EyeIcon, StarIcon, PlayIcon } from "@heroicons/react/24/solid"; // Import Heroicons
import { useNavigate } from "react-router-dom";
import { IRepertoire } from "@chess-opening-master/common";

export const Dashboard = () => {
    const { repertoires } = useNavbarState();
   const navigate = useNavigate();

    const goToRepertoire = (repertoire: IRepertoire) => {
        navigate(`/repertoire/${repertoire._id}`);
    }

    const goToTrainRepertoire = (repertoire: IRepertoire) => {
        navigate(`/repertoire/train/${repertoire._id}`);
    }

    return (
        <div className="container p-4 w-full h-full">
            <h1 className="text-2xl font-bold mb-4 text-white">Dashboard</h1>
            <div className="px-4 max-h-60 overflow-y-auto scrollbar-custom">
                <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {repertoires.map((repertoire) => (
                        <li key={repertoire._id} className="p-4 border rounded-lg  from-primary shadow-xl">
                            <h2 className="text-xl font-semibold mb-2 text-textLight">{repertoire.name}</h2>
                            <div className="flex space-x-2">
                                <button className="flex items-center px-3 py-1 bg-accent text-background rounded hover:bg-yellow-400 transition-colors" onClick={() => goToRepertoire(repertoire)}>
                                    <EyeIcon className="h-5 w-5 mr-1" />
                                    View
                                </button>
                               {/*  <button className="flex items-center px-3 py-1 bg-danger text-background rounded hover:bg-red-400 transition-colors">
                                    <StarIcon className="h-5 w-5 mr-1 text-accent" />
                                    <StarIcon className="h-5 w-5 mr-1" />
                                    Favorite
                                </button> */}
                                <button className="flex items-center px-3 py-1 bg-success text-background rounded hover:bg-green-400 transition-colors" onClick={() => goToTrainRepertoire(repertoire)}>
                                    <PlayIcon className="h-5 w-5 mr-1" />
                                    Train
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}