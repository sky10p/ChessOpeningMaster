import { useCallback, useEffect, useState } from "react";
import { IRepertoire } from "@chess-opening-master/common";
import { getRepertoire } from "../../../repository/repertoires/repertoires";

interface UseRepertoirePageDataResult {
  repertoire?: IRepertoire;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useRepertoirePageData = (
  repertoireId?: string
): UseRepertoirePageDataResult => {
  const [repertoire, setRepertoire] = useState<IRepertoire | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRepertoire = useCallback(async () => {
    if (!repertoireId) {
      setLoading(false);
      setError(null);
      setRepertoire(undefined);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fetchedRepertoire = await getRepertoire(repertoireId);
      setRepertoire(fetchedRepertoire);
    } catch (fetchError) {
      setError("Failed to fetch repertoire. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [repertoireId]);

  useEffect(() => {
    fetchRepertoire();
  }, [fetchRepertoire]);

  return {
    repertoire,
    loading,
    error,
    refetch: fetchRepertoire,
  };
};
