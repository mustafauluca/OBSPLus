import React, { useState } from 'react';
import { useElearn } from '../../context/ElearnContext';
import {
  MousePointer,
  Search,
  Download,
  Filter,
  UserCheck,
  Globe,
  Tag,
  ExternalLink,
  Layers,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface AdminClicksTabProps {
  onSelectIp?: (ip: string) => void;
}

export const AdminClicksTab: React.FC<AdminClicksTabProps> = ({ onSelectIp }) => {
  const { clickLogs, exportCsv } = useElearn();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'guest' | 'admin'>('all');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const filteredClicks = clickLogs.filter((click) => {
    const matchesSearch =
      click.ipAddress.includes(searchTerm) ||
      (click.username && click.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      click.elementText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      click.pageTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      click.pageUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
      click.elementTag.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || click.userRole === roleFilter;

    return matchesSearch && matchesRole;
  });

  const totalPages = Math.ceil(filteredClicks.length / pageSize) || 1;
  const pagedClicks = filteredClicks.slice((page - 1) * pageSize, page * pageSize);

  // Quick statistics
  const totalClicksCount = clickLogs.length;
  const studentClicksCount = clickLogs.filter((c) => c.userRole === 'student').length;
  const guestClicksCount = clickLogs.filter((c) => c.userRole === 'guest').length;
  const uniqueIpsCount = new Set(clickLogs.map((c) => c.ipAddress)).size;

  return (
    <div className="space-y-6">
      {/* Üst Başlık & İstatistik Kartları */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <MousePointer className="w-5 h-5 text-indigo-600" />
              Ziyaretçi ve Kullanıcı Tıklama Takibi (Live Click Tracker)
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
              Canlı Akış
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Siteyi gezen her ziyaretçinin ve oturum açmış öğrencilerin tüm tıklamaları (IP, Kullanıcı Adı, Buton/Element ve Koordinatlar) anlık kaydedilmektedir.
          </p>
        </div>
        <button
          onClick={() => exportCsv('clicks')}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
        >
          <Download className="w-4 h-4" /> Tıklama Raporunu İndir (CSV)
        </button>
      </div>

      {/* 4 Özet Sayaç Kartı */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Toplam Kayıtlı Tıklama</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalClicksCount}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Sitedeki tüm etkileşimler</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Giriş Yapmış Öğrenci Tıklaması</div>
          <div className="text-2xl font-black text-teal-600 mt-1">{studentClicksCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Öğrenci No & İsim ile eşleşti</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Misafir Ziyaretçi Tıklaması</div>
          <div className="text-2xl font-black text-amber-600 mt-1">{guestClicksCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Yalnızca IP ile izlendi</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Benzersiz IP Sayısı</div>
          <div className="text-2xl font-black text-indigo-600 mt-1">{uniqueIpsCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Farklı ağ ve cihazlar</div>
        </div>
      </div>

      {/* Filtre ve Arama Alanı */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-grow w-full md:w-auto">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            placeholder="IP adresi, kullanıcı adı, tıklanan metin veya sayfa ara..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Filtrele:</span>
          {(['all', 'student', 'guest', 'admin'] as const).map((r) => (
            <button
              key={r}
              onClick={() => {
                setRoleFilter(r);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                roleFilter === r
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {r === 'all'
                ? 'Tümü'
                : r === 'student'
                ? 'Sadece Öğrenciler'
                : r === 'guest'
                ? 'Sadece Misafirler'
                : 'Yöneticiler'}
            </button>
          ))}
        </div>
      </div>

      {/* Tıklama Tablosu */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Zaman</th>
                <th className="px-5 py-3.5">Kullanıcı (Login/Misafir)</th>
                <th className="px-5 py-3.5">IP Adresi</th>
                <th className="px-5 py-3.5">Tıklanan Element & Metin</th>
                <th className="px-5 py-3.5">Bulunduğu Sayfa & URL</th>
                <th className="px-5 py-3.5 text-right">Koordinat (X, Y)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {pagedClicks.map((click) => {
                const isStudent = click.userRole === 'student';
                const isAdmin = click.userRole === 'admin';
                return (
                  <tr key={click.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Zaman */}
                    <td className="px-5 py-3 font-mono text-slate-500 whitespace-nowrap">
                      {click.createdAt}
                    </td>

                    {/* Kullanıcı */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isStudent
                              ? 'bg-teal-500'
                              : isAdmin
                              ? 'bg-amber-500'
                              : 'bg-slate-300'
                          }`}
                        />
                        <span
                          className={`font-semibold ${
                            isStudent
                              ? 'text-teal-900 font-bold'
                              : isAdmin
                              ? 'text-amber-800 font-bold'
                              : 'text-slate-600'
                          }`}
                        >
                          {click.username || 'Misafir (Ziyaretçi)'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 capitalize">
                        {isStudent ? 'Öğrenci Girişi Yapıldı' : isAdmin ? 'Admin Oturumu' : 'Anonim Ziyaret'}
                      </span>
                    </td>

                    {/* IP Adresi */}
                    <td className="px-5 py-3 font-mono">
                      <button
                        onClick={() => onSelectIp && onSelectIp(click.ipAddress)}
                        className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline"
                        title="Bu IP adresini filtrele"
                      >
                        {click.ipAddress}
                      </button>
                    </td>

                    {/* Tıklanan Element */}
                    <td className="px-5 py-3 max-w-xs">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 font-mono font-bold text-[10px] rounded">
                          &lt;{click.elementTag}&gt;
                        </span>
                        <span className="font-bold text-slate-900 truncate max-w-[200px]" title={click.elementText}>
                          "{click.elementText}"
                        </span>
                      </div>
                      {click.elementId && (
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          id: #{click.elementId}
                        </div>
                      )}
                    </td>

                    {/* Sayfa */}
                    <td className="px-5 py-3 max-w-xs">
                      <div className="font-semibold text-slate-800 truncate" title={click.pageTitle}>
                        {click.pageTitle}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono truncate" title={click.pageUrl}>
                        {click.pageUrl}
                      </div>
                    </td>

                    {/* Koordinat */}
                    <td className="px-5 py-3 text-right font-mono text-slate-400 whitespace-nowrap">
                      {click.clickX !== undefined && click.clickY !== undefined
                        ? `X: ${click.clickX}, Y: ${click.clickY}`
                        : '-'}
                    </td>
                  </tr>
                );
              })}

              {pagedClicks.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    Arama kriterine uygun tıklama kaydı bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Sayfalama */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>
              Toplam {filteredClicks.length} kayıttan {(page - 1) * pageSize + 1}-
              {Math.min(page * pageSize, filteredClicks.length)} arası gösteriliyor
            </div>
            <div className="flex items-center gap-1">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded border border-slate-200 disabled:opacity-50 hover:bg-slate-50"
              >
                Önceki
              </button>
              <span className="px-2 font-bold text-slate-700">
                {page} / {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 rounded border border-slate-200 disabled:opacity-50 hover:bg-slate-50"
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
