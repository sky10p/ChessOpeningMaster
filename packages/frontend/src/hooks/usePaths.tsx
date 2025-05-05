import { useCallback, useState } from "react";
import { fetchPath, deleteVariantFromPath } from "../repository/paths/paths";
import { Path } from "../models/Path";

export function usePaths() {
  const [path, setPath] = useState<Path | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPath = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPath();
      setPath(data);
    } catch (err: any) {
      setError(err.message || "Failed to load path");
    } finally {
      setLoading(false);
    }
  }, []);

  const removeVariantFromPath = useCallback(async (variantId: string) => {
    if (!variantId) return;
    
    setLoading(true);
    setError(null);
    try {
      await deleteVariantFromPath(variantId);
      await loadPath(); // Reload path data after removal
    } catch (err: any) {
      setError(err.message || "Failed to remove variant from path");
    } finally {
      setLoading(false);
    }
  }, [loadPath]);

  return { path, loading, error, loadPath, removeVariantFromPath };
}
