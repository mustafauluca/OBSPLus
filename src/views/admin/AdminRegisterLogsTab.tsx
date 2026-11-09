import React, { useState } from 'react';
import { useElearn } from '../../context/ElearnContext';
import { Download, Search, CheckCircle, XCircle } from 'lucide-react';

export const AdminRegisterLogsTab: React.FC = () => {
  const { registerLogs, exportCsv } = useElearn();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failed'>('all');

  const filteredLogs = registerLogs.filter((log) => {
    const matchesSearch =
      log.studentNo.toLowerCase().includes(search.toLowerCase()) ||
      log.fullName.toLowerCase().includes(search.toLowerCase()) ||
      log.ipAddress.includes(search);
    const isOk = log.status === 'success' || log.status === 'active';
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'success'
        ? isOk
        : !isOk;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Öğrenci Kayıt Denetim Logları</h2>
          <p className="text-sm text-slate-500">
            Yeni kayıt girişimleri, IP adresleri ve KVKK doğrulama durumu kayıtları
          </p>
        </div>
        <button
          onClick={() => exportCsv('registers')}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm cursor-pointer"
        >
          <Download className="w-4 h-4" /> CSV İndir
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Öğrenci no, ad soyad veya IP ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="all">Tüm Durumlar ({registerLogs.length})</option>
          <option value="success">Sadece Başarılı</option>
          <option value="failed">Sadece Başarısız</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Tarih</th>
                <th className="px-6 py-4">Öğrenci No</th>
                <th className="px-6 py-4">Ad Soyad</th>
                <th className="px-6 py-4">IP Adresi</th>
                <th className="px-6 py-4">Durum</th>
                <th className="px-6 py-4">KVKK & Doğrulama</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-xs">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 text-slate-500 font-sans">{log.createdAt}</td>
                  <td className="px-6 py-4 font-bold text-slate-800">{log.studentNo}</td>
                  <td className="px-6 py-4 font-sans text-slate-700 font-medium">{log.fullName}</td>
                  <td className="px-6 py-4 text-teal-600">{log.ipAddress}</td>
                  <td className="px-6 py-4 font-sans">
                    {log.status === 'success' || log.status === 'active' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle className="w-3.5 h-3.5" /> Başarılı
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        <XCircle className="w-3.5 h-3.5" /> Başarısız
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-sans text-slate-500">
                    {log.verificationStatus || 'Kayıt ve KVKK onayı tamamlandı'}
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-sans text-sm">
                    Kayıt logu bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
