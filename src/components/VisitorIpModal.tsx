import React from 'react';
import { useElearn } from '../context/ElearnContext';
import { X, Server, Clock, LogIn, UserPlus, ShieldAlert, ShieldCheck } from 'lucide-react';

interface VisitorIpModalProps {
  ipAddress: string | null;
  onClose: () => void;
}

export const VisitorIpModal: React.FC<VisitorIpModalProps> = ({ ipAddress, onClose }) => {
  const { visitorLogs, loginLogs, registerLogs } = useElearn();

  if (!ipAddress) return null;

  // Filtrelenmiş IP geçmişi
  const ipVisits = visitorLogs.filter((v) => v.ipAddress === ipAddress);
  const ipLogins = loginLogs.filter((l) => l.ipAddress === ipAddress);
  const ipRegisters = registerLogs.filter((r) => r.ipAddress === ipAddress);
  const failedCount = ipLogins.filter((l) => l.status === 'failed').length;
  const isSuspicious = failedCount >= 3;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Başlık */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-500/20 text-teal-400 rounded-lg">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-teal-400 font-bold uppercase tracking-wider">IP Denetim Analizi & Audit Trail</span>
              <h3 className="font-mono font-bold text-lg text-white">{ipAddress}</h3>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* İstatistik Kartları */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500">Toplam Ziyaret</span>
              <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">{ipVisits.length} Sayfa</div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500">Giriş Denemesi</span>
              <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">{ipLogins.length} İşlem</div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500">Kayıt Denemesi</span>
              <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">{ipRegisters.length} İşlem</div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500">Güvenlik Durumu</span>
              <div className={`text-xs font-bold mt-1 flex items-center justify-center gap-1 ${isSuspicious ? 'text-amber-600' : 'text-emerald-600'}`}>
                {isSuspicious ? (
                  <>
                    <ShieldAlert className="w-3.5 h-3.5" /> Şüpheli ({failedCount} Hata)
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" /> Güvenli
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Ziyaret Geçmişi */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-2.5">
              <Clock className="w-4 h-4 text-teal-600" /> Bu IP'nin Son Sayfa Ziyaretleri
            </h5>
            <div className="border border-slate-200 rounded-xl overflow-hidden max-h-40 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2">Saat</th>
                    <th className="p-2">URL</th>
                    <th className="p-2">Tarayıcı</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {ipVisits.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-3 text-center text-slate-400">Bu IP'ye ait ziyaret kaydı bulunmuyor.</td>
                    </tr>
                  ) : (
                    ipVisits.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-50">
                        <td className="p-2 text-slate-500">{v.visitTime}</td>
                        <td className="p-2 text-teal-700 font-semibold">{v.pageUrl}</td>
                        <td className="p-2 text-slate-600 font-sans">{v.browser}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Giriş Denemeleri */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-2.5">
              <LogIn className="w-4 h-4 text-amber-600" /> Bu IP'nin Giriş Denemeleri
            </h5>
            <div className="border border-slate-200 rounded-xl overflow-hidden max-h-40 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2">Zaman</th>
                    <th className="p-2">Öğrenci No</th>
                    <th className="p-2">Durum</th>
                    <th className="p-2">Açıklama</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ipLogins.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-3 text-center text-slate-400">Giriş denemesi yapılmadı.</td>
                    </tr>
                  ) : (
                    ipLogins.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-50">
                        <td className="p-2 text-slate-500 font-mono">{l.createdAt}</td>
                        <td className="p-2 font-mono font-bold">{l.studentNo}</td>
                        <td className="p-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${l.status === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                            {l.status === 'success' ? 'BAŞARILI' : 'BAŞARISIZ'}
                          </span>
                        </td>
                        <td className="p-2 text-slate-500 text-[11px]">{l.failureReason || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
