import { PositionError, BoardOrientation } from "@chess-opening-master/common";
import { API_URL } from "../constants";

export interface RecordPositionErrorParams {
  fen: string;
  repertoireId: string;
  variantName?: string;
  orientation?: BoardOrientation;
  wrongMove: string;
  expectedMoves: string[];
}

export const recordPositionError = async (
  params: RecordPositionErrorParams
): Promise<PositionError | null> => {
  try {
    const response = await fetch(`${API_URL}/position-errors`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error("Failed to record position error");
    }

    return await response.json();
  } catch (error) {
    console.error("Error recording position error:", error);
    return null;
  }
};

export const getPositionErrors = async (): Promise<PositionError[]> => {
  try {
    const response = await fetch(`${API_URL}/position-errors`);

    if (!response.ok) {
      throw new Error("Failed to fetch position errors");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching position errors:", error);
    return [];
  }
};

export const getPositionErrorsByRepertoire = async (
  repertoireId: string
): Promise<PositionError[]> => {
  try {
    const response = await fetch(
      `${API_URL}/position-errors/repertoire/${repertoireId}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch position errors");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching position errors:", error);
    return [];
  }
};

export const getTopPositionErrors = async (
  limit: number = 10,
  repertoireId?: string
): Promise<PositionError[]> => {
  try {
    const params = new URLSearchParams();
    params.append("limit", limit.toString());
    if (repertoireId) {
      params.append("repertoireId", repertoireId);
    }

    const response = await fetch(
      `${API_URL}/position-errors/top?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch top position errors");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching top position errors:", error);
    return [];
  }
};

export const deletePositionError = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/position-errors/${id}`, {
      method: "DELETE",
    });

    return response.ok;
  } catch (error) {
    console.error("Error deleting position error:", error);
    return false;
  }
};

export const resolvePositionError = async (
  id: string
): Promise<PositionError | null> => {
  try {
    const response = await fetch(`${API_URL}/position-errors/${id}/resolve`, {
      method: "PATCH",
    });

    if (!response.ok) {
      throw new Error("Failed to resolve position error");
    }

    return await response.json();
  } catch (error) {
    console.error("Error resolving position error:", error);
    return null;
  }
};
