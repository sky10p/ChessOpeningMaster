import { Path, PathCategory } from "@chess-opening-master/common";
import { API_URL } from "../constants";

export async function fetchPath(category?: PathCategory): Promise<Path> {
  const res = await fetch(`${API_URL}/paths${category ? `?category=${category}` : ''}`);
  if (!res.ok) throw new Error("Failed to fetch path");
  return res.json();
}

export async function deleteVariantFromPath(variantId: string): Promise<void> {
  const res = await fetch(`${API_URL}/repertoires/${variantId}/variantsInfo`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error("Failed to remove variant from path");
}
