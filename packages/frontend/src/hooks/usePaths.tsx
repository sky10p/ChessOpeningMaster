import { useCallback, useState } from "react";
import { fetchPath, deleteVariantFromPath } from "../repository/paths/paths";
import { Path, PathCategory } from "@chess-opening-master/common";

export function usePaths() {
  const [path, setPath] = useState<Path | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<PathCategory | undefined>(undefined);

  const loadPath = useCallback(async (selectedCategory?: PathCategory) => {
    setLoading(true);
    setError(null);
    
    const categoryToUse = selectedCategory !== undefined ? selectedCategory : category;
    
    try {
      if (selectedCategory !== undefined) {
        setCategory(selectedCategory);
      }
      
      const data = await fetchPath(categoryToUse);
      setPath(data);
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : "Failed to load path");
    } finally {
      setLoading(false);
    }
  }, [category]);

  const removeVariantFromPath = useCallback(async (variantId: string) => {
    if (!variantId) {
      console.warn("removeVariantFromPath called with a falsy variantId");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      await deleteVariantFromPath(variantId);
      await loadPath(); // Reload path data after removal
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : "Failed to remove variant from path");
    } finally {
      setLoading(false);
    }
  }, [loadPath]);

  return { path, loading, error, loadPath, removeVariantFromPath, category, setCategory };
}
