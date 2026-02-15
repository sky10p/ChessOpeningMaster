import {
  Path,
  PathAnalyticsSummary,
  PathCategory,
  PathPlanSummary,
  PathSelectionFilters,
} from "@chess-opening-master/common";
import { API_URL } from "../constants";
import { apiFetch } from "../apiClient";

export interface PathInsightsFilters extends PathSelectionFilters {
  dateFrom?: string;
  dateTo?: string;
  dailyNewLimit?: number;
}

function buildPathQuery(filters?: PathInsightsFilters, category?: PathCategory): string {
  const params = new URLSearchParams();
  if (category) {
    params.set("category", category);
  }
  if (filters?.orientation) {
    params.set("orientation", filters.orientation);
  }
  if (filters?.openingName?.trim()) {
    params.set("openingName", filters.openingName.trim());
  }
  if (filters?.fen?.trim()) {
    params.set("fen", filters.fen.trim());
  }
  if (filters?.dateFrom) {
    params.set("dateFrom", filters.dateFrom);
  }
  if (filters?.dateTo) {
    params.set("dateTo", filters.dateTo);
  }
  if (typeof filters?.dailyNewLimit === "number") {
    params.set("dailyNewLimit", String(filters.dailyNewLimit));
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function fetchPath(
  category?: PathCategory,
  filters?: PathInsightsFilters
): Promise<Path> {
  const res = await apiFetch(`${API_URL}/paths${buildPathQuery(filters, category)}`);
  if (!res.ok) throw new Error("Failed to fetch path");
  return res.json();
}

export async function fetchPathPlan(filters?: PathInsightsFilters): Promise<PathPlanSummary> {
  const res = await apiFetch(`${API_URL}/paths/plan${buildPathQuery(filters)}`);
  if (!res.ok) throw new Error("Failed to fetch path plan");
  return res.json();
}

export async function fetchPathAnalytics(filters?: PathInsightsFilters): Promise<PathAnalyticsSummary> {
  const res = await apiFetch(`${API_URL}/paths/analytics${buildPathQuery(filters)}`);
  if (!res.ok) throw new Error("Failed to fetch path analytics");
  return res.json();
}

export async function deleteVariantFromPath(variantId: string): Promise<void> {
  const res = await apiFetch(`${API_URL}/repertoires/${variantId}/variantsInfo`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error("Failed to remove variant from path");
}
