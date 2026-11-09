import React, { useState } from 'react';
import { useElearn } from '../../context/ElearnContext';
import { Search, Download, ShieldCheck, ExternalLink, AlertTriangle } from 'lucide-react';

interface AdminLoginLogsTabProps {
  onSelectIp: (ip: string) => void;
}

export const AdminLoginLogsTab: React.FC<AdminLoginLogsTabProps> = ({ onSelectIp }) => {
  const { loginLogs, exportCsv } = useElearn();

  const [searchNo, setSearchNo] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const filtered = loginLogs.filter((l) => {
    const matchesNo = l.studentNo.includes(searchNo) || l.ipAddress.includes(searchNo);
    const matchesStatus = !filterStatus || l.status === filterStatus;
    return matchesNo && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const pagedLogs = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl flex items-center justify-between text-xs text-teal-900">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0" />
          <span>
            <strong>KVKK Uyum Bildirimi:</strong> Giriş denemelerinde girilen şifreler hiçbir koşulda loglanmaz veya açık metin saklanmaz. Yalnızca sonuç durumu ve güvenlik parametreleri kaydedilir.
          </span>
        </div>
      </div>

      {/* Filtreleme Çubuğu */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchNo}
              onChange={(e) => { setSearchNo(e.target.value); setPage(1); }}
              placeholder="Öğrenci no veya IP ara..."
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none"
          >
            <option value="">Tüm Durumlar</option>
            <option value="success">Başarılı Girişler</option>
            <option value="failed">Başarısız Denemeler</option>
          </select>
        </div>

        <button
          onClick={() => exportCsv('logins')}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" /> CSV Dışa Aktar
        </button>
      </div>

      {/* Tablo */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Öğrenci No</th>
                <th className="p-3">Adı Soyadı</th>
                <th className="p-3">IP Adresi</th>
                <th className="p-3">Cihaz / Tarayıcı</th>
                <th className="p-3">Durum</th>
                <th className="p-3">Başarısızlık Nedeni / Açıklama</th>
                <th className="p-3 text-right">Zaman</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pagedLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Kriterlere uygun giriş kaydı bulunamadı.
                  </td>
                </tr>
              ) : (
                pagedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-900">{log.studentNo}</td>
                    <td className="p-3 font-semibold text-slate-800">{log.fullNameEntered || '-'}</td>
                    <td className="p-3">
                      <button
                        onClick={() => onSelectIp(log.ipAddress)}
                        className="font-mono text-teal-600 hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" /> {log.ipAddress}
                      </button>
                    </td>
                    <td className="p-3 text-slate-500">{log.browser} ({log.deviceType})</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.status === 'success'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {log.status === 'success' ? 'BAŞARILI' : 'BAŞARISIZ'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">{log.failureReason || 'Normal Giriş'}</td>
                    <td className="p-3 text-right text-slate-500 font-mono">{log.createdAt}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500">Sayfa {page} / {totalPages}</span>
            <div className="flex gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded disabled:opacity-50 font-semibold"
              >
                Önceki
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded disabled:opacity-50 font-semibold"
              >
                Sonraki
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
