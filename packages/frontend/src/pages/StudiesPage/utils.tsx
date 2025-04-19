// Utility functions extracted from StudiesPage.tsx

// Generate a random ID string
export const randomId = () => Math.random().toString(36).slice(2, 10);

// Parse manual time input (e.g., '2h', '30m', '1:30', '2') to seconds
export const parseManualTime = (input: string): number | null => {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return null;
  // 2h, 2 h, 2 horas
  let match = trimmed.match(/^\d+\s*(h|hora|horas)?$/);
  if (match) return parseInt(match[0], 10) * 3600;
  // 2m, 2 m, 2min, 2 minutos
  match = trimmed.match(/^(\d+)\s*(m|min|minuto|minutos)$/);
  if (match) return parseInt(match[1], 10) * 60;
  // 2h 30m, 2 h 30 m, 2:30
  match = trimmed.match(/^(\d+)\s*(h|hora|horas)?[\s:]+(\d+)\s*(m|min|minuto|minutos)?$/);
  if (match) return parseInt(match[1], 10) * 3600 + parseInt(match[3], 10) * 60;
  // Solo número: por defecto horas
  match = trimmed.match(/^(\d+)$/);
  if (match) return parseInt(match[1], 10) * 3600;
  return null;
};

// Update selectedStudy after group/study changes
export function updateSelectedStudy<T extends { id: string }>(groups: any[], activeGroupId: string, selectedStudy: T | null): T | null {
  if (!selectedStudy) return null;
  const group = groups.find((g) => g.id === activeGroupId);
  if (!group) return null;
  const study = group.studies.find((s: T) => s.id === selectedStudy.id);
  return study || null;
}

// Format duration in seconds to '1h 2m 3s'
export function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [
    h > 0 ? `${h}h` : null,
    m > 0 ? `${m}m` : null,
    s > 0 || (h === 0 && m === 0) ? `${s}s` : null,
  ].filter(Boolean).join(' ');
}
