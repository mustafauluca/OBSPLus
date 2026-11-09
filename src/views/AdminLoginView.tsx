import React, { useState } from 'react';
import { useElearn } from '../context/ElearnContext';
import { ShieldCheck, Lock, User, AlertCircle, ArrowLeft } from 'lucide-react';

interface AdminLoginViewProps {
  setCurrentView: (view: string) => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({ setCurrentView }) => {
  const { loginAdmin } = useElearn();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Admin@2026!');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const res = loginAdmin(username, password);
    if (res.success) {
      setCurrentView('admin_dashboard');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-slate-950">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-8 shadow-2xl text-white space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-teal-500/20 text-teal-400 border border-teal-500/30 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white">E-LEARN Yönetici Girişi</h2>
          <p className="text-xs text-slate-400">
            Platform yönetimi, ziyaretçi ve öğrenci denetim logları
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-950/40 border border-red-800 text-red-300 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Yönetici Kullanıcı Adı
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Yönetici Şifresi
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-colors cursor-pointer"
          >
            Güvenli Giriş Yap
          </button>
        </form>

       

        <div className="text-center">
          <button
            onClick={() => setCurrentView('home')}
            className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1.5 mx-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Ana Sayfaya Dön
          </button>
        </div>
      </div>
    </div>
  );
};
