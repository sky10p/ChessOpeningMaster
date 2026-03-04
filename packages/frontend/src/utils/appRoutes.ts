type QueryRecord = Record<string, string | undefined | null>;

const normalizeSearch = (search?: string): string => {
  if (!search) {
    return "";
  }
  return search.startsWith("?") ? search : `?${search}`;
};

const toSearchString = (query?: QueryRecord | URLSearchParams | string): string => {
  if (!query) {
    return "";
  }
  if (typeof query === "string") {
    return normalizeSearch(query);
  }
  if (query instanceof URLSearchParams) {
    const search = query.toString();
    return search ? `?${search}` : "";
  }
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (typeof value === "string" && value.trim()) {
      params.set(key, value);
    }
  });
  const search = params.toString();
  return search ? `?${search}` : "";
};

export const buildTrainExecutionSearch = (
  params: Record<string, string | undefined>
): string => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value && value.trim()) {
      searchParams.set(key, value);
    }
  });
  return toSearchString(searchParams);
};

export const getRepertoiresRoute = (search?: string): string =>
  `/repertoires${normalizeSearch(search)}`;

export const getRepertoireOpeningRoute = (
  repertoireId: string,
  openingName: string,
  search?: string
): string =>
  `/repertoires/${repertoireId}/openings/${encodeURIComponent(openingName)}${normalizeSearch(search)}`;

export const getTrainRepertoireRoute = (
  repertoireId: string,
  search?: string
): string => `/train/repertoires/${repertoireId}${normalizeSearch(search)}`;

export const getRepertoireEditorRoute = (
  repertoireId: string,
  query?: QueryRecord | URLSearchParams | string
): string => `/repertoire/${repertoireId}${toSearchString(query)}`;

export const getLegacyTrainExecutionRedirectTarget = (
  repertoireId: string,
  search?: string
): string => getTrainRepertoireRoute(repertoireId, search);

export const getLegacyTrainOpeningRedirectTarget = (
  repertoireId: string,
  openingName: string,
  search?: string
): string => getRepertoireOpeningRoute(repertoireId, openingName, search);
