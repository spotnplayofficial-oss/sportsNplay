import { useState, useEffect } from 'react';
import API from '../api/axios';
import { Flame, Star, Trophy, CalendarDays, ChevronLeft, ChevronRight, Moon } from 'lucide-react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

const StreakCalendar = () => {
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);

  const realToday = new Date();
  const [viewYear,  setViewYear]  = useState(realToday.getFullYear());
  const [viewMonth, setViewMonth] = useState(realToday.getMonth());

  useEffect(() => { fetchStreak(); }, []);

  const fetchStreak = async () => {
    try {
      const { data } = await API.get('/users/streak');
      setStreak(data);
    } catch {
      setStreak(null);
    } finally {
      setLoading(false);
    }
  };

  const todayStr = realToday.toISOString().split('T')[0];
  const pad = (n) => String(n).padStart(2, '0');
  const toDateStr = (day) => `${viewYear}-${pad(viewMonth + 1)}-${pad(day)}`;

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay    = new Date(viewYear, viewMonth, 1).getDay();
  const blanks      = Array(firstDay).fill(null);
  const dayNums     = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    const now = realToday;
    if (viewYear > now.getFullYear() || (viewYear === now.getFullYear() && viewMonth >= now.getMonth())) return;
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const isAtCurrentMonth =
    viewYear === realToday.getFullYear() && viewMonth === realToday.getMonth();

  const getDayState = (day) => {
    const d        = toDateStr(day);
    const isBooked = streak?.bookedDays?.includes(d);
    const isLogin  = streak?.activeDays?.includes(d);
    const isToday  = d === todayStr;
    const isFuture = d > todayStr;
    return { isBooked, isLogin, isToday, isFuture };
  };

  /* ── Loading ── */
  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', padding:'40px 0' }}>
      <div style={{
        width:32, height:32,
        border:'2px solid rgba(74,222,128,0.2)',
        borderTop:'2px solid #4ade80',
        borderRadius:'50%',
        animation:'sc-spin 1s linear infinite',
      }} />
    </div>
  );

  if (!streak) return null;

  return (
    <>
      <style>{`
        @keyframes sc-spin   { to { transform: rotate(360deg); } }
        @keyframes sc-pop    { from{transform:scale(0.6);opacity:0} to{transform:scale(1);opacity:1} }
        @keyframes sc-fadein { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }

        .sc-wrap { display:flex; flex-direction:column; gap:24px; animation: sc-fadein 0.4s ease forwards; }

        /* ── stat pills ── */
        .sc-pills { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; }
        .sc-pill {
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          gap:6px; padding:16px 8px; border-radius:16px;
          background:rgba(255,255,255,0.03);
          border:1px solid rgba(255,255,255,0.08);
          transition:all 0.2s;
        }
        .sc-pill:hover { transform:translateY(-2px); border-color:rgba(74,222,128,0.25); }
        .light .sc-pill {
          background:rgba(0,0,0,0.04);
          border-color:rgba(0,0,0,0.12);
        }
        .sc-pill-val {
          font-family:'Bebas Neue',cursive;
          font-size:32px;
          line-height:1;
        }
        .sc-pill-label {
          font-size:10px;
          text-transform:uppercase;
          letter-spacing:0.1em;
          color:#6b7280;
          text-align:center;
        }
        .light .sc-pill-label { color:#6b7280; }

        /* ── today banner ── */
        .sc-banner {
          display:flex; align-items:center; gap:12px;
          padding:14px 18px; border-radius:14px;
        }
        .sc-banner-title { font-size:14px; font-weight:700; margin-bottom:2px; }
        .sc-banner-sub   { font-size:11px; color:#6b7280; }
        .light .sc-banner-sub { color:#6b7280; }

        /* ── nav ── */
        .sc-nav {
          display:flex; align-items:center; justify-content:space-between;
        }
        .sc-nav-btn {
          width:34px; height:34px; border-radius:10px; border:none; cursor:pointer;
          display:flex; align-items:center; justify-content:center;
          background:rgba(255,255,255,0.05);
          color:#9ca3af;
          transition:all 0.2s;
        }
        .sc-nav-btn:hover:not(:disabled) { background:rgba(74,222,128,0.1); color:#4ade80; }
        .sc-nav-btn:disabled { opacity:0.25; cursor:not-allowed; }
        .light .sc-nav-btn {
          background:rgba(0,0,0,0.07);
          color:#374151;
        }
        .light .sc-nav-btn:hover:not(:disabled) {
          background:rgba(22,163,74,0.12);
          color:#16a34a;
        }

        /* Month label — critical fix for light mode */
        .sc-month-label {
          font-family:'Bebas Neue',cursive;
          font-size:20px;
          letter-spacing:0.08em;
          color:#f1f5f9;           /* bright in dark */
        }
        .light .sc-month-label {
          color:#111827 !important; /* very dark in light */
        }

        /* ── legend ── */
        .sc-legend { display:flex; gap:14px; align-items:center; }
        .sc-legend-dot { width:10px; height:10px; border-radius:4px; }
        .sc-legend-label { font-size:11px; color:#6b7280; }
        .light .sc-legend-label { color:#4b5563; }

        /* ── grid ── */
        .sc-grid {
          display:grid;
          grid-template-columns:repeat(7,1fr);
          gap:5px;
        }
        .sc-day-label {
          text-align:center;
          font-size:11px;
          font-weight:700;
          letter-spacing:0.06em;
          padding-bottom:6px;
          color:#6b7280;           /* visible in dark */
        }
        .light .sc-day-label {
          color:#374151;           /* dark in light */
        }

        /* ── day cells ── */
        .sc-day {
          aspect-ratio:1;
          border-radius:10px;
          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:center;
          gap:2px;
          transition:all 0.18s;
          cursor:default;
          position:relative;
          min-height:44px;
        }
        .sc-day:hover { transform:scale(1.08); z-index:3; }

        .sc-day-num {
          font-size:15px;
          font-weight:700;
          line-height:1;
        }
        .sc-day-ico {
          font-size:11px;
          line-height:1;
          animation: sc-pop 0.25s ease forwards;
        }

        /* ── FUTURE: visible but clearly dimmed ── */
        .sc-future {
          background:transparent;
          border:1px solid transparent;
        }
        .sc-future .sc-day-num {
          color:rgba(156,163,175,0.55);  /* was 0.2 — now much more readable */
        }
        .light .sc-future .sc-day-num {
          color:rgba(107,114,128,0.5);   /* dark enough to see on white */
        }

        /* ── EMPTY (past, no activity) ── */
        .sc-empty {
          background:rgba(255,255,255,0.04);
          border:1px solid rgba(255,255,255,0.07);
        }
        .sc-empty .sc-day-num { color:#9ca3af; }
        .light .sc-empty {
          background:rgba(0,0,0,0.04);
          border-color:rgba(0,0,0,0.1);
        }
        .light .sc-empty .sc-day-num { color:#374151; }  /* dark, clearly readable */

        /* ── LOGIN ── */
        .sc-login {
          background:rgba(74,222,128,0.1);
          border:1px solid rgba(74,222,128,0.25);
        }
        .sc-login .sc-day-num { color:#4ade80; }
        .light .sc-login {
          background:rgba(34,197,94,0.13);
          border-color:rgba(34,197,94,0.35);
        }
        .light .sc-login .sc-day-num { color:#15803d; }

        /* ── BOOKED ── */
        .sc-booked {
          background:linear-gradient(135deg,rgba(251,191,36,0.18),rgba(245,158,11,0.1));
          border:1px solid rgba(251,191,36,0.35);
          box-shadow:0 0 14px rgba(251,191,36,0.1);
        }
        .sc-booked .sc-day-num { color:#fbbf24; }
        .light .sc-booked {
          background:linear-gradient(135deg,rgba(251,191,36,0.2),rgba(245,158,11,0.13));
          border-color:rgba(217,119,6,0.45);
        }
        .light .sc-booked .sc-day-num { color:#92400e; }

        /* today ring */
        .sc-ring-green { box-shadow:0 0 0 2.5px #4ade80, 0 0 18px rgba(74,222,128,0.25); }
        .sc-ring-gold  { box-shadow:0 0 0 2.5px #fbbf24, 0 0 20px rgba(251,191,36,0.3); }
        .light .sc-ring-green { box-shadow:0 0 0 2.5px #16a34a, 0 0 12px rgba(22,163,74,0.2); }
        .light .sc-ring-gold  { box-shadow:0 0 0 2.5px #d97706, 0 0 14px rgba(217,119,6,0.2); }

        /* ── footer ── */
        .sc-footer {
          font-size:11px;
          text-align:center;
          color:#6b7280;
          display:flex;
          align-items:center;
          justify-content:center;
          gap:6px;
        }
        .light .sc-footer { color:#4b5563; }
      `}</style>

      <div className="sc-wrap">

        {/* ── Stat Pills ── */}
        <div className="sc-pills">
          {[
            {
              icon: streak.bookedToday ? '⭐' : streak.loggedInToday ? '🔥' : '🌙',
              label: 'Current Streak',
              value: streak.loginStreak || 0,
              color: streak.bookedToday ? '#fbbf24' : '#4ade80',
            },
            {
              icon: '🏆',
              label: 'Best Streak',
              value: streak.longestStreak || 0,
              color: '#a78bfa',
            },
            {
              icon: '📅',
              label: 'Active Days',
              value: streak.activeDays?.length || 0,
              color: '#60a5fa',
            },
            {
              icon: '⭐',
              label: 'Booked Days',
              value: streak.bookedDays?.length || 0,
              color: '#fbbf24',
            },
          ].map((s, i) => (
            <div key={i} className="sc-pill">
              <span style={{ fontSize: 20 }}>{s.icon}</span>
              <span className="sc-pill-val" style={{ color: s.color }}>{s.value}</span>
              <span className="sc-pill-label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* ── Today Banner ── */}
        {(streak.loggedInToday || streak.bookedToday) && (
          <div className="sc-banner" style={{
            background: streak.bookedToday
              ? 'linear-gradient(135deg,rgba(251,191,36,0.1),rgba(245,158,11,0.06))'
              : 'rgba(74,222,128,0.06)',
            border: `1px solid ${streak.bookedToday ? 'rgba(251,191,36,0.25)' : 'rgba(74,222,128,0.15)'}`,
          }}>
            <span style={{ fontSize: 24 }}>{streak.bookedToday ? '⭐' : '🔥'}</span>
            <div>
              <p className="sc-banner-title" style={{ color: streak.bookedToday ? '#fbbf24' : '#4ade80' }}>
                {streak.bookedToday
                  ? 'Ground booked today — Star day!'
                  : `${streak.loginStreak} day streak — keep it up!`}
              </p>
              <p className="sc-banner-sub">
                {streak.bookedToday
                  ? 'You logged in and booked a ground today'
                  : 'Log in every day to grow your streak'}
              </p>
            </div>
          </div>
        )}

        {/* ── Month Nav ── */}
        <div>
          <div className="sc-nav" style={{ marginBottom: 16 }}>
            <button className="sc-nav-btn" onClick={prevMonth}>
              <ChevronLeft size={18} />
            </button>

            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
              <span className="sc-month-label">{MONTHS[viewMonth]} {viewYear}</span>
              <div className="sc-legend">
                {[
                  { color:'rgba(74,222,128,0.5)', border:'rgba(74,222,128,0.4)', label:'Logged in' },
                  { color:'rgba(251,191,36,0.5)',  border:'rgba(251,191,36,0.4)',  label:'Booked' },
                ].map((l, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:5 }}>
                    <div className="sc-legend-dot" style={{ background:l.color, border:`1px solid ${l.border}` }} />
                    <span className="sc-legend-label">{l.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <button className="sc-nav-btn" onClick={nextMonth} disabled={isAtCurrentMonth}>
              <ChevronRight size={18} />
            </button>
          </div>

          {/* ── Day label row ── */}
          <div className="sc-grid">
            {DAYS.map(d => (
              <div key={d} className="sc-day-label">{d}</div>
            ))}

            {blanks.map((_, i) => <div key={`b${i}`} />)}

            {dayNums.map(day => {
              const { isBooked, isLogin, isToday, isFuture } = getDayState(day);

              let cls = 'sc-day ';
              if      (isFuture) cls += 'sc-future';
              else if (isBooked) cls += 'sc-booked';
              else if (isLogin)  cls += 'sc-login';
              else               cls += 'sc-empty';

              if      (isToday && isBooked) cls += ' sc-ring-gold';
              else if (isToday)             cls += ' sc-ring-green';

              return (
                <div
                  key={day}
                  className={cls}
                  title={
                    isBooked ? 'Booked a ground ⭐' :
                    isLogin  ? 'Logged in 🔥' :
                    isFuture ? '' : 'No activity'
                  }
                >
                  <span className="sc-day-num">{day}</span>
                  {isBooked && (
                    <span className="sc-day-ico" style={{ animation:'sc-pop 0.25s ease forwards' }}>⭐</span>
                  )}
                  {isLogin && !isBooked && (
                    <span className="sc-day-ico" style={{ animation:'sc-pop 0.25s ease forwards' }}>🔥</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="sc-footer">
          <span>🔥 = logged in</span>
          <span style={{ margin:'0 4px', opacity:0.4 }}>·</span>
          <span>⭐ = booked a ground</span>
        </div>

      </div>
    </>
  );
};

export default StreakCalendar;