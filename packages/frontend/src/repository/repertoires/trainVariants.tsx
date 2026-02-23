import {
  TrainVariantInfo,
  VariantMistake,
  VariantMistakeReviewInput,
  VariantReviewInput,
} from "@chess-opening-master/common";
import { API_URL } from "../constants";
import { apiFetch } from "../apiClient";

export const saveTrainVariantInfo = async (
  trainVariantInfo: Omit<TrainVariantInfo, "lastDate">
) => {
  const response = await apiFetch(
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
  const response = await apiFetch(`${API_URL}/repertoires/${repertoireId}/variantsInfo`);
  if (!response.ok) {
    throw new Error("Failed to get train variant info");
  }
  const data = await response.json();
  return data.map((info: TrainVariantInfo) => ({
    ...info,
    lastDate: new Date(info.lastDate),
    dueAt: info.dueAt ? new Date(info.dueAt) : undefined,
    lastReviewedAt: info.lastReviewedAt ? new Date(info.lastReviewedAt) : undefined,
    suspendedUntil: info.suspendedUntil ? new Date(info.suspendedUntil) : undefined,
    masteryUpdatedAt: info.masteryUpdatedAt ? new Date(info.masteryUpdatedAt) : undefined,
  }));
};

export const saveVariantReview = async (
  repertoireId: string,
  payload: VariantReviewInput
) => {
  const response = await apiFetch(`${API_URL}/repertoires/${repertoireId}/variant-reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error("Failed to save variant review");
  }
  return response.json();
};

export const getVariantMistakes = async (
  repertoireId: string,
  options?: { openingName?: string; dueOnly?: boolean }
): Promise<VariantMistake[]> => {
  const params = new URLSearchParams();
  if (options?.openingName?.trim()) {
    params.set("openingName", options.openingName.trim());
  }
  if (typeof options?.dueOnly === "boolean") {
    params.set("dueOnly", options.dueOnly ? "true" : "false");
  }
  const query = params.toString();
  const response = await apiFetch(
    `${API_URL}/repertoires/${repertoireId}/mistakes${query ? `?${query}` : ""}`
  );
  if (!response.ok) {
    throw new Error("Failed to get variant mistakes");
  }
  const data = (await response.json()) as VariantMistake[];
  return data.map((mistake) => ({
    ...mistake,
    dueAt: new Date(mistake.dueAt),
    lastReviewedAt: mistake.lastReviewedAt
      ? new Date(mistake.lastReviewedAt)
      : undefined,
    createdAt: mistake.createdAt ? new Date(mistake.createdAt) : undefined,
    updatedAt: mistake.updatedAt ? new Date(mistake.updatedAt) : undefined,
    archivedAt: mistake.archivedAt ? new Date(mistake.archivedAt) : undefined,
  }));
};

export const saveVariantMistakeReview = async (
  repertoireId: string,
  payload: VariantMistakeReviewInput
): Promise<VariantMistake> => {
  const response = await apiFetch(
    `${API_URL}/repertoires/${repertoireId}/mistake-reviews`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );
  if (!response.ok) {
    throw new Error("Failed to save mistake review");
  }
  const data = (await response.json()) as VariantMistake;
  return {
    ...data,
    dueAt: new Date(data.dueAt),
    lastReviewedAt: data.lastReviewedAt ? new Date(data.lastReviewedAt) : undefined,
    createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
    updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
    archivedAt: data.archivedAt ? new Date(data.archivedAt) : undefined,
  };
};
