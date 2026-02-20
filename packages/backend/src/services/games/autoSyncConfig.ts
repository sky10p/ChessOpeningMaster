export const getAutoSyncDueHours = (): number => {
  const value = Number(process.env.GAMES_AUTO_SYNC_DUE_HOURS || 24);
  if (!Number.isFinite(value) || value <= 0) {
    return 24;
  }
  return value;
};
