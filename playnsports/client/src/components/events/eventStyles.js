// eventStyles.js — shared style injection for the Events feature.
// Reuses the same design tokens as the Groups page (g-card, g-input,
// g-btn-primary, g-tab, etc.) and adds a few event-specific extras.
import { GROUP_STYLES } from '../Groupstyles.js';

export const EVENT_STYLES = GROUP_STYLES + `

  /* ── Event-specific extras ── */

  .ev-banner {
    width: 100%;
    height: 140px;
    border-radius: 16px;
    object-fit: cover;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.06);
  }

  .ev-sport-chip {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 11px; font-weight: 600;
    padding: 4px 10px; border-radius: 100px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    color: #9ca3af;
    text-transform: capitalize;
  }

  .ev-badge-free {
    font-size: 11px; font-weight: 700;
    padding: 3px 10px; border-radius: 100px;
    background: rgba(74,222,128,0.1);
    border: 1px solid rgba(74,222,128,0.25);
    color: #4ade80;
  }
  .ev-badge-paid {
    font-size: 11px; font-weight: 700;
    padding: 3px 10px; border-radius: 100px;
    background: rgba(251,191,36,0.1);
    border: 1px solid rgba(251,191,36,0.25);
    color: #fbbf24;
  }
  .ev-badge-pending {
    font-size: 11px; font-weight: 700;
    padding: 3px 10px; border-radius: 100px;
    background: rgba(96,165,250,0.1);
    border: 1px solid rgba(96,165,250,0.25);
    color: #60a5fa;
  }
  .ev-badge-approved {
    font-size: 11px; font-weight: 700;
    padding: 3px 10px; border-radius: 100px;
    background: rgba(74,222,128,0.1);
    border: 1px solid rgba(74,222,128,0.25);
    color: #4ade80;
  }
  .ev-badge-rejected, .ev-badge-cancelled {
    font-size: 11px; font-weight: 700;
    padding: 3px 10px; border-radius: 100px;
    background: rgba(239,68,68,0.08);
    border: 1px solid rgba(239,68,68,0.2);
    color: #f87171;
  }

  .ev-participant-row {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 12px;
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.05);
    background: rgba(255,255,255,0.015);
  }

  .ev-empty {
    display: flex; flex-direction: column; align-items: center;
    gap: 10px; padding: 60px 20px; text-align: center;
    color: #6b7280;
  }

  .ev-progress-track { height: 6px; background: rgba(255,255,255,0.06); border-radius: 100px; overflow: hidden; }
  .ev-progress-fill { height: 100%; background: linear-gradient(90deg,#4ade80,#22c55e); border-radius: 100px; transition: width 0.5s; }
`;
