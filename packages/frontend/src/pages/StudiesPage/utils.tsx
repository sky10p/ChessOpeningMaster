// Utility functions extracted from StudiesPage.tsx

export const randomId = () => Math.random().toString(36).slice(2, 10);

export const parseManualTime = (input: string): number | null => {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return null;
  let match = trimmed.match(/^(\d+)\s*(?:h)?$/);
  if (match) return parseInt(match[1], 10) * 3600;
  match = trimmed.match(/^(\d+)\s*(?:m|min)?$/);
  if (match) return parseInt(match[1], 10) * 60;
  match = trimmed.match(/^(\d+)\s*(?:h)?[\s:]+(\d+)\s*(?:m|min)?$/);
  if (match) return parseInt(match[1], 10) * 3600 + parseInt(match[2], 10) * 60;
  match = trimmed.match(/^(\d+)$/);
  if (match) return parseInt(match[1], 10) * 3600;
  return null;
};

export function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [
    h > 0 && `${h}h`,
    m > 0 && `${m}m`,
    (s > 0 || (h === 0 && m === 0)) && `${s}s`,
  ].filter(Boolean).join(' ');
}
