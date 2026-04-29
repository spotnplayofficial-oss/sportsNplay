import { useState, useEffect } from 'react';
import API from '../api/axios';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const StreakCalendar = () => {
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStreak();
  }, []);

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

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const todayStr = today.toISOString().split('T')[0];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const blanks = Array(firstDay).fill(null);
  const dayNums = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const pad = (n) => String(n).padStart(2, '0');
  const toDateStr = (day) => `${year}-${pad(month + 1)}-${pad(day)}`;

  const getDayState = (day) => {
    const d = toDateStr(day);
    const isBooked = streak?.bookedDays?.includes(d);
    const isLogin = streak?.activeDays?.includes(d);
    const isToday = d === todayStr;
    const isFuture = d > todayStr;
    return { isBooked, isLogin, isToday, isFuture, d };
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
      <div style={{ width: 28, height: 28, border: '2px solid rgba(74,222,128,0.2)', borderTop: '2px solid #4ade80', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  if (!streak) return null;

  return (
    <>
      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes popIn { from{transform:scale(0.7);opacity:0} to{transform:scale(1);opacity:1} }
        @keyframes shimmer { from{background-position:-200% center} to{background-position:200% center} }

        .streak-day {
          aspect-ratio: 1;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 600;
          position: relative;
          transition: all 0.2s;
          cursor: default;
          flex-direction: column;
          gap: 1px;
        }
        .streak-day:hover { transform: scale(1.12); z-index: 2; }

        .day-future {
          background: rgba(255,255,255,0.02);
          color: rgba(255,255,255,0.12);
          border: 1px solid transparent;
        }
        .day-empty {
          background: rgba(255,255,255,0.02);
          color: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.04);
        }
        .day-login {
          background: rgba(74,222,128,0.1);
          color: #4ade80;
          border: 1px solid rgba(74,222,128,0.2);
        }
        .day-booked {
          background: linear-gradient(135deg, rgba(251,191,36,0.15), rgba(245,158,11,0.1));
          color: #fbbf24;
          border: 1px solid rgba(251,191,36,0.3);
          box-shadow: 0 0 12px rgba(251,191,36,0.1);
        }
        .day-today-base {
          box-shadow: 0 0 0 2px rgba(74,222,128,0.6), 0 0 16px rgba(74,222,128,0.2);
        }
        .day-today-booked {
          box-shadow: 0 0 0 2px rgba(251,191,36,0.8), 0 0 20px rgba(251,191,36,0.25);
        }

        .streak-icon { font-size: 14px; line-height: 1; animation: popIn 0.3s ease forwards; }

        .stat-pill {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 14px 10px;
          flex: 1;
          gap: 4px;
          transition: all 0.2s;
        }
        .stat-pill:hover { border-color: rgba(74,222,128,0.2); background: rgba(74,222,128,0.04); }

        .legend-dot {
          width: 10px; height: 10px; border-radius: 4px; flex-shrink: 0;
        }

        .shimmer-streak {
          background: linear-gradient(90deg,#fbbf24,#f59e0b,#fde68a,#fbbf24);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 2s linear infinite;
        }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── Stat Pills ── */}
        <div style={{ display: 'flex', gap: 10 }}>
          {[
            {
              icon: streak.bookedToday ? '⭐' : streak.loggedInToday ? '🔥' : '💤',
              label: 'Current Streak',
              value: streak.loginStreak,
              suffix: 'days',
              color: streak.bookedToday ? '#fbbf24' : '#4ade80',
            },
            {
              icon: '🏆',
              label: 'Best Streak',
              value: streak.longestStreak,
              suffix: 'days',
              color: '#a78bfa',
            },
            {
              icon: '📅',
              label: 'Active Days',
              value: streak.activeDays?.length || 0,
              suffix: 'total',
              color: '#60a5fa',
            },
            {
              icon: '⭐',
              label: 'Booked Days',
              value: streak.bookedDays?.length || 0,
              suffix: 'total',
              color: '#fbbf24',
            },
          ].map((s, i) => (
            <div key={i} className="stat-pill">
              <span style={{ fontSize: 20 }}>{s.icon}</span>
              <span style={{
                fontFamily: 'Bebas Neue, cursive',
                fontSize: 26,
                color: s.color,
                lineHeight: 1,
              }}>{s.value}</span>
              <span style={{ fontSize: 10, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* ── Today banner ── */}
        {(streak.loggedInToday || streak.bookedToday) && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 16px',
            borderRadius: 14,
            background: streak.bookedToday
              ? 'linear-gradient(135deg, rgba(251,191,36,0.1), rgba(245,158,11,0.06))'
              : 'rgba(74,222,128,0.06)',
            border: `1px solid ${streak.bookedToday ? 'rgba(251,191,36,0.25)' : 'rgba(74,222,128,0.15)'}`,
          }}>
            <span style={{ fontSize: 22 }}>{streak.bookedToday ? '⭐' : '🔥'}</span>
            <div>
              <p style={{
                fontSize: 13,
                fontWeight: 700,
                color: streak.bookedToday ? '#fbbf24' : '#4ade80',
              }}>
                {streak.bookedToday
                  ? 'Ground booked today — Star day! ⭐'
                  : `${streak.loginStreak} day streak — keep it up! 🔥`}
              </p>
              <p style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                {streak.bookedToday
                  ? 'You logged in and booked a ground today'
                  : 'Log in every day to grow your streak'}
              </p>
            </div>
          </div>
        )}

        {/* ── Month Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{
            fontFamily: 'Bebas Neue, cursive',
            fontSize: 18,
            letterSpacing: '0.08em',
            color: '#f1f5f9',
          }}>
            {MONTHS[month].toUpperCase()} {year}
          </p>
          {/* Legend */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {[
              { color: 'rgba(74,222,128,0.3)', label: 'Logged in' },
              { color: 'rgba(251,191,36,0.4)', label: 'Booked' },
            ].map((l, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div className="legend-dot" style={{ background: l.color, border: `1px solid ${l.color}` }} />
                <span style={{ fontSize: 10, color: '#6b7280' }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Day Labels ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {DAYS.map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: 10, color: '#4b5563', fontWeight: 700, paddingBottom: 4, letterSpacing: '0.05em' }}>
              {d}
            </div>
          ))}

          {/* Blank cells */}
          {blanks.map((_, i) => <div key={`b${i}`} />)}

          {/* Day cells */}
          {dayNums.map(day => {
            const { isBooked, isLogin, isToday, isFuture } = getDayState(day);

            let className = 'streak-day ';
            if (isFuture) className += 'day-future';
            else if (isBooked) className += 'day-booked';
            else if (isLogin) className += 'day-login';
            else className += 'day-empty';

            if (isToday && isBooked) className += ' day-today-booked';
            else if (isToday) className += ' day-today-base';

            const icon = isBooked ? '⭐' : isLogin ? '🔥' : null;

            return (
              <div
                key={day}
                className={className}
                title={
                  isBooked ? 'Booked a ground ⭐' :
                  isLogin  ? 'Logged in 🔥' :
                  isFuture ? '' : 'No activity'
                }
              >
                <span style={{ fontSize: icon ? 10 : 13, opacity: isFuture ? 0.3 : 1 }}>{day}</span>
                {icon && <span className="streak-icon" style={{ fontSize: 10 }}>{icon}</span>}
              </div>
            );
          })}
        </div>

        {/* ── Footer note ── */}
        <p style={{ fontSize: 11, color: '#374151', textAlign: 'center' }}>
          🔥 = logged in that day &nbsp;·&nbsp; ⭐ = booked a ground that day
        </p>
      </div>
    </>
  );
};

export default StreakCalendar;