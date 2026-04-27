import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import Navbar from '../components/Navbar';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [preview, setPreview] = useState(user?.avatar || null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');
      .font-bebas { font-family: 'Bebas Neue', cursive !important; }

      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-8px); }
      }
      @keyframes spin-slow {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      @keyframes ping-slow {
        0% { transform: scale(1); opacity: 0.6; }
        100% { transform: scale(2); opacity: 0; }
      }
      @keyframes shimmer {
        from { background-position: -200% center; }
        to { background-position: 200% center; }
      }
      @keyframes gradientBorder {
        0%, 100% { border-color: rgba(74,222,128,0.4); }
        50% { border-color: rgba(74,222,128,0.8); }
      }
      @keyframes blob {
        0% { transform: translate(0px, 0px) scale(1); }
        33% { transform: translate(30px, -50px) scale(1.1); }
        66% { transform: translate(-20px, 20px) scale(0.9); }
        100% { transform: translate(0px, 0px) scale(1); }
      }
      .animate-blob { animation: blob 7s infinite; }

      .animate-fadeUp-1 { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s forwards; opacity: 0; }
      .animate-fadeUp-2 { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.2s forwards; opacity: 0; }
      .animate-fadeUp-3 { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.3s forwards; opacity: 0; }
      .animate-fadeUp-4 { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.4s forwards; opacity: 0; }
      .animate-float { animation: float 4s ease-in-out infinite; }
      .animate-spin-slow { animation: spin-slow 12s linear infinite; }
      .animate-ping-slow { animation: ping-slow 2s ease-out infinite; }

      .shimmer-text {
        background: linear-gradient(90deg, var(--shimmer-color));
        background-size: 200% auto;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: shimmer 3s linear infinite;
      }

      .avatar-ring {
        animation: gradientBorder 3s ease-in-out infinite;
      }

      .grid-dots {
        background-image: radial-gradient(circle, var(--glass-05, rgba(255,255,255,0.05)) 1px, transparent 1px);
        background-size: 28px 28px;
      }

      .noise {
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
      }

      .info-card {
        background: var(--glass-02, rgba(255,255,255,0.02));
        backdrop-filter: blur(10px);
        border: 1px solid var(--glass-05, rgba(255,255,255,0.05));
        border-radius: 20px;
        padding: 18px 20px;
        transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
        position: relative;
        overflow: hidden;
      }
      .info-card::before {
        content: '';
        position: absolute;
        top: 0; left: -100%;
        width: 100%; height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent);
        transition: left 0.5s ease;
      }
      .info-card:hover::before { left: 100%; }
      .info-card:hover {
        background: var(--glass-04, rgba(255,255,255,0.04));
        border-color: rgba(74,222,128,0.3);
        transform: translateY(-2px) scale(1.02);
        box-shadow: 0 10px 30px -10px rgba(74,222,128,0.15);
      }

      .upload-zone {
        border: 2px dashed rgba(74,222,128,0.3);
        background: rgba(74,222,128,0.02);
        backdrop-filter: blur(8px);
        border-radius: 20px;
        transition: all 0.4s ease;
      }
      .upload-zone:hover {
        border-color: rgba(74,222,128,0.6);
        background: rgba(74,222,128,0.06);
        transform: scale(1.02);
        box-shadow: 0 0 30px rgba(74,222,128,0.15);
      }

      .save-btn {
        background: linear-gradient(135deg, #4ade80, #22c55e);
        color: black;
        font-weight: 700;
        border-radius: 14px;
        padding: 14px;
        width: 100%;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }
      .save-btn::before {
        content: '';
        position: absolute;
        top: 0; left: -100%;
        width: 100%; height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
        transition: left 0.5s ease;
      }
      .save-btn:hover::before { left: 100%; }
      .save-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(74,222,128,0.3); }
      .save-btn:disabled { opacity: 0.5; transform: none; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const { data } = await API.post('/upload/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser({ avatar: data.avatar });
      setMessage('Profile photo updated ✅');
      setFile(null);
    } catch {
      setError('Upload failed ❌');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = () => {
    if (user?.role === 'player') return { label: 'Player', emoji: '⚽', color: 'text-green-400 bg-green-400/10 border-green-400/20' };
    return { label: 'Ground Owner', emoji: '🏟️', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' };
  };

  const badge = getRoleBadge();

  return (
    <div className="min-h-screen bg-[#fcfcfc] dark:bg-[#060606] text-gray-900 dark:text-white relative overflow-hidden" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <div className="fixed inset-0 grid-dots pointer-events-none opacity-20" />
      <div className="fixed inset-0 noise pointer-events-none opacity-50" />
      
      {/* Background Orbs */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-green-500/20 rounded-full blur-[100px] animate-blob" />
        <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-blue-500/10 rounded-full blur-[100px] animate-blob" style={{ animationDelay: '2s', animationDuration: '8s' }} />
        <div className="absolute bottom-[-20%] left-[20%] w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] bg-emerald-500/10 rounded-full blur-[100px] animate-blob" style={{ animationDelay: '4s', animationDuration: '10s' }} />
      </div>
      
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none opacity-30 z-0">
        <div className="absolute inset-0 rounded-full border-[1px] border-dashed border-green-400/20 animate-spin-slow" />
        <div className="absolute inset-16 rounded-full border-[1px] border-green-400/10" style={{ animation: 'spin-slow 25s linear infinite reverse' }} />
      </div>

      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[500px] h-[1px] bg-gradient-to-r from-transparent via-green-400/50 to-transparent pointer-events-none z-10" />

      <Navbar />

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8 lg:py-12 mt-4">
        {/* <div className="animate-fadeUp-1 mb-10 text-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-green-400/10 border border-green-400/20 mb-4 shadow-[0_0_15px_rgba(74,222,128,0.1)]">
            <p className="text-green-400 text-xs font-bold uppercase tracking-[0.2em] m-0">User Account</p>
          </div>
          <h1 className="font-bebas text-6xl lg:text-7xl tracking-wide shimmer-text">MY PROFILE</h1>
        </div> */}

        <div className="animate-fadeUp-2 mb-8">
          <div className="relative bg-white/40 dark:bg-black/40 backdrop-blur-3xl border border-black/10 dark:border-white/10 rounded-[2rem] p-8 sm:p-10 shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-green-400/10 rounded-full blur-[80px] pointer-events-none opacity-50" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[60px] pointer-events-none opacity-30" />

            <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-8">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 rounded-full animate-spin-slow opacity-60"
                  style={{ background: 'conic-gradient(from 0deg, transparent 0%, #4ade80 50%, transparent 100%)', padding: '2px', borderRadius: '50%' }}
                />
                <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-[#060606]">
                  {preview ? (
                    <img src={preview} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-green-400/20 to-green-400/5 flex items-center justify-center">
                      <span className="font-bebas text-4xl text-green-400">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                <label
                  htmlFor="avatarInput"
                  className="absolute -bottom-1 -right-1 w-9 h-9 bg-green-400 hover:bg-green-300 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 shadow-lg hover:scale-110"
                >
                  <span className="text-base">📷</span>
                </label>
                <input id="avatarInput" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </div>

              <div className="text-center sm:text-left flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{user?.name}</h2>
                <p className="text-gray-500 text-sm mb-4">{user?.email}</p>

                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${badge.color}`}>
                    <span>{badge.emoji}</span>
                    {badge.label}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-black/10 dark:border-white/10 text-gray-600 dark:text-gray-400 bg-black/3 dark:bg-white/3">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-400" />
                    </span>
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {file && (
          <div className="animate-fadeUp-2 mb-8">
            <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-green-400/30 rounded-[1.5rem] p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_30px_rgba(74,222,128,0.1)]">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <img src={preview} alt="" className="w-14 h-14 rounded-2xl object-cover border-2 border-green-400/50 shadow-lg" />
                <div className="flex-1">
                  <p className="text-green-400 text-sm font-bold tracking-wide m-0">Ready to upload</p>
                  <p className="text-gray-600 dark:text-gray-400 text-xs truncate max-w-[200px] m-0">{file.name}</p>
                </div>
              </div>
              <button
                onClick={handleUpload}
                disabled={loading}
                className="save-btn sm:w-auto mt-2 sm:mt-0"
                style={{ padding: '12px 28px' }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Uploading...
                  </span>
                ) : 'Save Photo ✅'}
              </button>
            </div>
          </div>
        )}

        {message && (
          <div className="animate-fadeUp-2 mb-6">
            <div className="bg-green-400/8 border border-green-400/20 text-green-400 px-4 py-3 rounded-2xl text-sm flex items-center gap-2">
              <span>✅</span> {message}
            </div>
          </div>
        )}

        {error && (
          <div className="animate-fadeUp-2 mb-6">
            <div className="bg-red-400/8 border border-red-400/20 text-red-400 px-4 py-3 rounded-2xl text-sm flex items-center gap-2">
              <span>❌</span> {error}
            </div>
          </div>
        )}

        <div className="animate-fadeUp-3">
          <div className="flex items-center gap-4 mb-6 mt-4">
            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent flex-1" />
            <p className="text-gray-900/40 dark:text-white/40 text-xs font-bold uppercase tracking-[0.3em] m-0">Profile Details</p>
            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent flex-1" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Full Name', value: user?.name, icon: '👤' },
              { label: 'Email Address', value: user?.email, icon: '📧' },
              { label: 'Phone Number', value: user?.phone || 'Not added', icon: '📞' },
              { label: 'Account Role', value: user?.role === 'player' ? 'Player ⚽' : 'Ground Owner 🏟️', icon: '🎭' },
            ].map((item, i) => (
              <div key={i} className="info-card">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{item.icon}</span>
                  <div>
                    <p className="text-gray-600 text-xs uppercase tracking-wider mb-0.5">{item.label}</p>
                    <p className="text-gray-900 dark:text-white font-medium">{item.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* <div className="animate-fadeUp-4 mt-8">
          <div className="upload-zone p-6 text-center cursor-pointer" onClick={() => document.getElementById('avatarInput').click()}>
            <div className="text-3xl mb-3">📷</div>
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Click to change profile photo</p>
            <p className="text-gray-600 text-xs mt-1">JPG, PNG or WEBP — Max 5MB</p>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default ProfilePage;