import { useCallback, useState } from "react";
import { fetchPath } from "../repository/paths/paths";
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

  return { path, loading, error, loadPath };
}
