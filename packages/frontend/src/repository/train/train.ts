import {
  TrainOpeningResponse,
  TrainOverviewResponse,
  VariantMistake,
} from "@chess-opening-master/common";
import { API_URL } from "../constants";
import { apiFetch } from "../apiClient";

const parseMistakes = (mistakes: VariantMistake[]): VariantMistake[] =>
  mistakes.map((mistake) => ({
    ...mistake,
    dueAt: new Date(mistake.dueAt),
    lastReviewedAt: mistake.lastReviewedAt
      ? new Date(mistake.lastReviewedAt)
      : undefined,
    createdAt: mistake.createdAt ? new Date(mistake.createdAt) : undefined,
    updatedAt: mistake.updatedAt ? new Date(mistake.updatedAt) : undefined,
    archivedAt: mistake.archivedAt ? new Date(mistake.archivedAt) : undefined,
  }));

const parseTrainOpening = (payload: TrainOpeningResponse): TrainOpeningResponse => ({
  ...payload,
  variants: payload.variants.map((variant) => ({
    ...variant,
    dueAt: variant.dueAt ? new Date(variant.dueAt) : undefined,
  })),
  mistakes: parseMistakes(payload.mistakes),
});

const TRAIN_OVERVIEW_CACHE_TTL_MS = 30000;

let cachedTrainOverview:
  | {
      expiresAt: number;
      payload: TrainOverviewResponse;
    }
  | null = null;
let pendingTrainOverviewRequest: Promise<TrainOverviewResponse> | null = null;

export const getTrainOverview = async (): Promise<TrainOverviewResponse> => {
  const response = await apiFetch(`${API_URL}/train/overview`);
  if (!response.ok) {
    throw new Error("Failed to load train overview");
  }
  return response.json();
};

export const getCachedTrainOverview = async (): Promise<TrainOverviewResponse> => {
  const now = Date.now();

  if (cachedTrainOverview && cachedTrainOverview.expiresAt > now) {
    return cachedTrainOverview.payload;
  }

  if (!pendingTrainOverviewRequest) {
    pendingTrainOverviewRequest = getTrainOverview()
      .then((payload) => {
        cachedTrainOverview = {
          payload,
          expiresAt: Date.now() + TRAIN_OVERVIEW_CACHE_TTL_MS,
        };
        return payload;
      })
      .finally(() => {
        pendingTrainOverviewRequest = null;
      });
  }

  return pendingTrainOverviewRequest;
};

export const getTrainOpening = async (
  repertoireId: string,
  openingName: string
): Promise<TrainOpeningResponse> => {
  const encodedOpening = encodeURIComponent(openingName);
  const response = await apiFetch(
    `${API_URL}/train/repertoires/${repertoireId}/openings/${encodedOpening}`
  );
  if (!response.ok) {
    throw new Error("Failed to load train opening");
  }
  const payload = (await response.json()) as TrainOpeningResponse;
  return parseTrainOpening(payload);
};
