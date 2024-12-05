import { TrainVariantInfo } from "../../models/chess.models";
import { API_URL } from "../constants";

export const saveTrainVariantInfo = async (
  trainVariantInfo: TrainVariantInfo
) => {
  const response = await fetch(
    `${API_URL}/repertoires/${trainVariantInfo.repertoireId}/variantsInfo`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(trainVariantInfo),
    }
  );
  if (!response.ok) {
    throw new Error("Failed to save train variant info");
  }
};

export const getTrainVariantInfo = async (
  repertoireId: string
): Promise<TrainVariantInfo[]> => {
  const response = await fetch(`${API_URL}/repertoires/${repertoireId}/variantsInfo`);
  if (!response.ok) {
    throw new Error("Failed to get train variant info");
  }
  return response.json();
};
