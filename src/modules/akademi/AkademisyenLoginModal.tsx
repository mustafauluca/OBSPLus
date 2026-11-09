import React, { useState } from 'react';
import { X, Lock, Shield, UserCheck, AlertCircle, LogIn } from 'lucide-react';
import { CONSULTANTS_AND_STAFF } from '../../data/departmentsAndUniversities';
import { getStoredClientIp, logAuditEvent } from '../admin/auditService';

interface AkademisyenLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (advisorName: string, role: 'admin' | 'advisor') => void;
}

export const AkademisyenLoginModal: React.FC<AkademisyenLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [selectedStaff, setSelectedStaff] = useState<string>(CONSULTANTS_AND_STAFF[0].name);
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const clientIp = getStoredClientIp();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!password.trim()) {
      setErrorMsg('Lütfen akademik erişim şifrenizi giriniz.');
      return;
    }

    const staffMember = CONSULTANTS_AND_STAFF.find((s) => s.name === selectedStaff);
    const role = selectedStaff.includes('Murat DOĞAN') || selectedStaff.includes('Numan YILDIRIM') ? 'admin' : 'advisor';

    logAuditEvent(
      'login',
      { id: `usr-acad-${Date.now()}`, name: selectedStaff, role },
      `Akademisyen & Danışman Paneli girişi yapıldı. Görev: ${staffMember?.role || 'Akademik Danışman'}`,
      clientIp
    );

    onLoginSuccess(selectedStaff, role);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Akademisyen & Danışman Girişi</h3>
              <p className="text-[11px] text-slate-500">diplomatr.com Yönetim & İntibak Komisyonu</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Akademik Personel / Danışman Seçimi
            </label>
            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
            >
              {CONSULTANTS_AND_STAFF.map((staff) => (
                <option key={staff.name} value={staff.name}>
                  {staff.name} — {staff.role}
                </option>
              ))}
              <option value="Sistem Süper Yöneticisi (Admin)">
                Sistem Süper Yöneticisi (Admin)
              </option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Güvenlik Şifresi
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Personel Şifreniz"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex justify-between">
            <span>İstemci IP Adresi:</span>
            <span className="font-mono text-slate-700 font-semibold">{clientIp}</span>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            <LogIn className="w-4 h-4 text-amber-400" />
            <span>Akademik Panele Giriş Yap</span>
          </button>
        </form>
      </div>
    </div>
  );
};
