import React, { useState } from 'react';
import { useElearn } from '../../context/ElearnContext';
import { Search, Download, Filter, ExternalLink, Globe } from 'lucide-react';

interface AdminVisitorsTabProps {
  onSelectIp: (ip: string) => void;
}

export const AdminVisitorsTab: React.FC<AdminVisitorsTabProps> = ({ onSelectIp }) => {
  const { visitorLogs, exportCsv } = useElearn();

  const [searchIp, setSearchIp] = useState('');
  const [filterDevice, setFilterDevice] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const filtered = visitorLogs.filter((l) => {
    const matchesIp = l.ipAddress.includes(searchIp) || l.pageUrl.toLowerCase().includes(searchIp.toLowerCase());
    const matchesDevice = !filterDevice || l.deviceType === filterDevice;
    return matchesIp && matchesDevice;
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const pagedLogs = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      {/* Filtreleme & Arama Çubuğu */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchIp}
              onChange={(e) => { setSearchIp(e.target.value); setPage(1); }}
              placeholder="IP veya sayfa URL ara..."
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <select
            value={filterDevice}
            onChange={(e) => { setFilterDevice(e.target.value); setPage(1); }}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none"
          >
            <option value="">Tüm Cihazlar</option>
            <option value="desktop">Masaüstü</option>
            <option value="mobile">Mobil</option>
            <option value="tablet">Tablet</option>
          </select>
        </div>

        <button
          onClick={() => exportCsv('visitors')}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" /> CSV Dışa Aktar
        </button>
      </div>

      {/* Tablo */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 font-semibold">
          <span>Toplam {filtered.length} Ziyaret Kaydı • IP adresine tıklayarak tüm geçmişini inceleyebilirsiniz</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">IP Adresi (Tıklanabilir)</th>
                <th className="p-3">Açılan Sayfa / URL</th>
                <th className="p-3">Tarayıcı & İşletim Sistemi</th>
                <th className="p-3">Cihaz</th>
                <th className="p-3 text-right">Ziyaret Zamanı</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pagedLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    Arama kriterlerine uygun ziyaret kaydı bulunamadı.
                  </td>
                </tr>
              ) : (
                pagedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3">
                      <button
                        onClick={() => onSelectIp(log.ipAddress)}
                        className="font-mono font-bold text-teal-600 hover:text-teal-800 flex items-center gap-1 hover:underline cursor-pointer"
                        title="Bu IP'nin tüm hareketlerini ve denetim loglarını aç"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {log.ipAddress}
                      </button>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-800">{log.pageTitle || 'Ana Sayfa'}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{log.pageUrl}</div>
                    </td>
                    <td className="p-3 text-slate-600">
                      <div>{log.browser}</div>
                      <div className="text-[10px] text-slate-400">{log.os}</div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 capitalize">
                        {log.deviceType}
                      </span>
                    </td>
                    <td className="p-3 text-right text-slate-500 font-mono">
                      {log.visitDate} {log.visitTime}
                    </td>
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
