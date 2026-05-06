import { useState, useEffect, useCallback } from 'react';
import API from '../api/axios';

const HOURS = Array.from({ length: 14 }, (_, i) => i + 6); // 6 AM to 7 PM
const DAYS_AHEAD = 14; // show next 14 days

const fmt = (h) => {
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:00 ${ampm}`;
};

const toTimeStr = (h) => `${String(h).padStart(2, '0')}:00`;

const getDates = () => {
  const dates = [];
  for (let i = 0; i < DAYS_AHEAD; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
};

const dayLabel = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((d - today) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
};

const SlotScheduler = ({ ground, onRefresh, showMessage }) => {
  const [selectedDate, setSelectedDate] = useState(getDates()[0]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(null); // hour being saved
  const [hovered, setHovered] = useState(null);
  const dates = getDates();

  // Build slot map for selected date
  useEffect(() => {
    if (!ground) return;
    const daySlots = (ground.slots || []).filter(s => s.date === selectedDate);
    setSlots(daySlots);
  }, [ground, selectedDate]);

  const getSlotForHour = useCallback((hour) => {
    return slots.find(s => {
      const sh = parseInt(s.startTime.split(':')[0]);
      return sh === hour;
    });
  }, [slots]);

  const getHourState = useCallback((hour) => {
    const slot = getSlotForHour(hour);
    if (!slot) return 'empty';
    if (slot.isBooked) return 'booked';
    return 'available';
  }, [getSlotForHour]);

  const handleHourClick = async (hour) => {
    if (!ground) return;
    const state = getHourState(hour);
    if (state === 'booked') return; // can't toggle booked slots

    setSaving(hour);
    try {
      if (state === 'available') {
        const slot = getSlotForHour(hour);
        if (!slot) { setSaving(null); return; }
        await API.delete(`/grounds/${ground._id}/slots/${slot._id}`);
        showMessage(`Slot ${fmt(hour)}–${fmt(hour + 1)} removed`);
        onRefresh();
        setSaving(null);
        return;
      }

      // state === 'empty' → add slot
      await API.post(`/grounds/${ground._id}/slots`, {
        slots: [{
          date: selectedDate,
          startTime: toTimeStr(hour),
          endTime: toTimeStr(hour + 1),
        }],
      });
      showMessage(`Slot ${fmt(hour)}–${fmt(hour + 1)} added ✅`);
      onRefresh();
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to update slot', 'error');
    } finally {
      setSaving(null);
    }
  };

  const handleBulkAdd = async (startH, endH) => {
    if (!ground) return;
    setSaving('bulk');
    const newSlots = [];
    for (let h = startH; h < endH; h++) {
      const state = getHourState(h);
      if (state === 'empty') {
        newSlots.push({ date: selectedDate, startTime: toTimeStr(h), endTime: toTimeStr(h + 1) });
      }
    }
    if (newSlots.length === 0) {
      showMessage('All slots in this range already exist', 'error');
      setSaving(null);
      return;
    }
    try {
      await API.post(`/grounds/${ground._id}/slots`, { slots: newSlots });
      showMessage(`${newSlots.length} slot(s) added ✅`);
      onRefresh();
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed', 'error');
    } finally {
      setSaving(null);
    }
  };

  const bookedCount = slots.filter(s => s.isBooked).length;
  const availCount = slots.filter(s => !s.isBooked).length;

  if (!ground) {
    return (
      <div style={{
        background: 'var(--glass-02, rgba(255,255,255,0.02))',
        border: '1px solid var(--glass-06, rgba(255,255,255,0.06))',
        borderRadius: 24,
        padding: 24,
        textAlign: 'center',
        paddingTop: 60,
        paddingBottom: 60,
      }}>
        <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>👈</span>
        <p style={{ color: 'var(--text-muted, #6b7280)', fontSize: 14 }}>Select a ground first to manage its slots</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontFamily: 'DM Sans, sans-serif' }}>
      {/* Ground Info + Stats */}
      <div style={{
        background: 'rgba(74,222,128,0.04)',
        border: '1px solid rgba(74,222,128,0.12)',
        borderRadius: 16,
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main, #111)', margin: 0 }}>{ground.name}</p>
          <p style={{ fontSize: 11, color: 'var(--text-muted, #6b7280)', margin: '2px 0 0' }}>Slot Scheduler · Click a time block to toggle</p>
        </div>
        <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
          <span style={{ color: '#4ade80', fontWeight: 600 }}>✅ {availCount} available</span>
          <span style={{ color: '#f87171', fontWeight: 600 }}>🔴 {bookedCount} booked</span>
          <span style={{ color: 'var(--text-muted, #6b7280)' }}>{HOURS.length - slots.length} unset</span>
        </div>
      </div>

      {/* Date Tabs */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
        {dates.map(d => (
          <button
            key={d}
            onClick={() => setSelectedDate(d)}
            style={{
              padding: '8px 16px',
              borderRadius: 12,
              fontSize: 12,
              fontWeight: 600,
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
              cursor: 'pointer',
              border: selectedDate === d ? '1px solid rgba(74,222,128,0.3)' : '1px solid var(--glass-06, rgba(255,255,255,0.06))',
              background: selectedDate === d ? 'rgba(74,222,128,0.1)' : 'var(--glass-02, rgba(255,255,255,0.02))',
              color: selectedDate === d ? '#4ade80' : 'var(--text-muted, #6b7280)',
            }}
          >
            {dayLabel(d)}
          </button>
        ))}
      </div>

      {/* Quick-add presets */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted, #6b7280)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Quick Add:</span>
        {[
          { label: 'Morning (6–12)', s: 6, e: 12 },
          { label: 'Afternoon (12–17)', s: 12, e: 17 },
          { label: 'Evening (17–20)', s: 17, e: 20 },
          { label: 'Full Day', s: 6, e: 20 },
        ].map(({ label, s, e }) => (
          <button
            key={label}
            onClick={() => handleBulkAdd(s, e)}
            disabled={saving === 'bulk'}
            style={{
              fontSize: 11,
              padding: '5px 12px',
              borderRadius: 100,
              border: '1px solid var(--glass-08, rgba(255,255,255,0.08))',
              background: 'var(--glass-04, rgba(255,255,255,0.04))',
              color: 'var(--text-muted, #6b7280)',
              cursor: saving === 'bulk' ? 'wait' : 'pointer',
              transition: 'all 0.2s',
              fontWeight: 500,
            }}
            onMouseEnter={e2 => { e2.target.style.background = 'rgba(74,222,128,0.08)'; e2.target.style.color = '#4ade80'; e2.target.style.borderColor = 'rgba(74,222,128,0.2)'; }}
            onMouseLeave={e2 => { e2.target.style.background = 'var(--glass-04, rgba(255,255,255,0.04))'; e2.target.style.color = 'var(--text-muted, #6b7280)'; e2.target.style.borderColor = 'var(--glass-08, rgba(255,255,255,0.08))'; }}
          >
            {saving === 'bulk' ? '⏳' : '+'} {label}
          </button>
        ))}
      </div>

      {/* Time Grid */}
      <div style={{
        background: 'var(--glass-02, rgba(255,255,255,0.02))',
        border: '1px solid var(--glass-06, rgba(255,255,255,0.06))',
        borderRadius: 20,
        padding: 20,
        overflowX: 'auto',
      }}>
        <p style={{ fontSize: 11, color: 'var(--text-muted, #6b7280)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16, marginTop: 0 }}>
          {dayLabel(selectedDate)} — {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 10 }}>
          {HOURS.map(hour => {
            const state = getHourState(hour);
            const isLoading = saving === hour;
            const slot = getSlotForHour(hour);
            const isHov = hovered === hour;

            let bg, border, color, cursor, label;
            if (state === 'booked') {
              bg = 'rgba(239,68,68,0.06)';
              border = '1px solid rgba(239,68,68,0.15)';
              color = 'rgba(239,68,68,0.7)';
              cursor = 'not-allowed';
              label = '🔴 Booked';
            } else if (state === 'available') {
              bg = isHov ? 'rgba(239,68,68,0.06)' : 'rgba(74,222,128,0.07)';
              border = isHov ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(74,222,128,0.18)';
              color = isHov ? 'rgba(239,68,68,0.7)' : '#4ade80';
              cursor = 'pointer';
              label = isHov ? '✕ Remove' : '✅ Available';
            } else {
              bg = isHov ? 'rgba(74,222,128,0.06)' : 'var(--glass-03, rgba(255,255,255,0.03))';
              border = isHov ? '1px solid rgba(74,222,128,0.2)' : '1px dashed var(--glass-08, rgba(255,255,255,0.08))';
              color = isHov ? '#4ade80' : 'var(--text-muted, #6b7280)';
              cursor = 'pointer';
              label = isHov ? '+ Add' : '—';
            }

            return (
              <div
                key={hour}
                onClick={() => handleHourClick(hour)}
                onMouseEnter={() => setHovered(hour)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  background: bg,
                  border,
                  borderRadius: 14,
                  padding: '12px 10px',
                  cursor,
                  transition: 'all 0.18s ease',
                  userSelect: 'none',
                  opacity: isLoading ? 0.6 : 1,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {isLoading && (
                  <div style={{
                    position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: 14,
                  }}>
                    <div style={{
                      width: 16, height: 16, border: '2px solid transparent',
                      borderTop: '2px solid #4ade80', borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                    }} />
                  </div>
                )}
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-main, #111)', margin: '0 0 4px', letterSpacing: '0.02em' }}>
                  {fmt(hour)}
                </p>
                <p style={{ fontSize: 10, color: 'var(--text-muted, #6b7280)', margin: '0 0 8px' }}>
                  to {fmt(hour + 1)}
                </p>
                <p style={{ fontSize: 11, fontWeight: 600, color, margin: 0, transition: 'color 0.18s' }}>
                  {label}
                </p>
                {state === 'booked' && slot?.bookedBy && (
                  <p style={{ fontSize: 9, color: 'rgba(239,68,68,0.5)', margin: '3px 0 0' }}>Player booked</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 20, marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--glass-05, rgba(255,255,255,0.05))' }}>
          {[
            { color: '#4ade80', border: 'rgba(74,222,128,0.18)', label: 'Available (click to remove)' },
            { color: 'rgba(239,68,68,0.7)', border: 'rgba(239,68,68,0.15)', label: 'Booked by player' },
            { color: 'var(--text-muted, #6b7280)', border: 'var(--glass-08)', label: 'Unset (click to add)' },
          ].map(({ color, border, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: color, opacity: 0.6 }} />
              <span style={{ fontSize: 10, color: 'var(--text-muted, #6b7280)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Slot list for this day */}
      {slots.length > 0 && (
        <div style={{
          background: 'var(--glass-02, rgba(255,255,255,0.02))',
          border: '1px solid var(--glass-06, rgba(255,255,255,0.06))',
          borderRadius: 16,
          padding: '16px 18px',
        }}>
          <p style={{ fontSize: 11, color: 'var(--text-muted, #6b7280)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12, marginTop: 0 }}>
            Slots for {dayLabel(selectedDate)}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {slots
              .slice()
              .sort((a, b) => a.startTime.localeCompare(b.startTime))
              .map((slot, i) => (
                <div key={i} style={{
                  padding: '5px 12px',
                  borderRadius: 100,
                  fontSize: 11,
                  fontWeight: 600,
                  border: slot.isBooked ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(74,222,128,0.2)',
                  background: slot.isBooked ? 'rgba(239,68,68,0.06)' : 'rgba(74,222,128,0.06)',
                  color: slot.isBooked ? '#f87171' : '#4ade80',
                }}>
                  {slot.startTime} – {slot.endTime} {slot.isBooked ? '🔴' : '🟢'}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SlotScheduler;