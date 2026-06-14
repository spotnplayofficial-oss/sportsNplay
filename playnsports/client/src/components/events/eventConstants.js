// Shared constants & small helpers for the Events feature.

export const SPORTS = [
  'football', 'cricket', 'basketball', 'tennis',
  'badminton', 'volleyball', 'box cricket', 'box football', 'other',
];

export const SPORT_EMOJI = {
  football: '⚽', cricket: '🏏', basketball: '🏀', tennis: '🎾',
  badminton: '🏸', volleyball: '🏐', boxing: '🥊',
  'box cricket': '🏏', 'box football': '⚽', other: '🏅',
};

export const sportLabel = (sport = '') =>
  sport.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

// 'YYYY-MM-DD' -> 'Mon, 16 Jun 2026'
export const formatEventDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
};

// '14:30' -> '2:30 PM'
export const formatEventTime = (timeStr) => {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
};

export const approvalColor = (status) => {
  if (status === 'approved') return 'ev-badge-approved';
  if (status === 'rejected') return 'ev-badge-rejected';
  return 'ev-badge-pending';
};
