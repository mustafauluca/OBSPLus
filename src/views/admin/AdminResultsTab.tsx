import React, { useState } from 'react';
import { useElearn } from '../../context/ElearnContext';
import { Download, Search, CheckCircle, XCircle } from 'lucide-react';

export const AdminResultsTab: React.FC = () => {
  const { examAttempts } = useElearn();
  const [search, setSearch] = useState('');

  const filteredResults = examAttempts.filter((r) => {
    const title = (r.targetTitle || r.examTitle || '').toLowerCase();
    const sNo = (r.studentNo || '');
    return (
      r.studentName.toLowerCase().includes(search.toLowerCase()) ||
      sNo.includes(search) ||
      title.includes(search.toLowerCase())
    );
  });

  const exportCSV = () => {
    const headers = ['ID', 'Ogrenci No', 'Ogrenci Ad Soyad', 'Sinav/Test', 'Puan', 'Dogru', 'Yanlis', 'Bos', 'Durum', 'Tarih'];
    const rows = filteredResults.map((r) => [
      r.id,
      r.studentNo || '',
      `"${r.studentName}"`,
      `"${r.targetTitle || r.examTitle || 'Sınav'}"`,
      r.score,
      r.correctCount,
      r.wrongCount,
      r.emptyCount,
      r.passed ? 'Geçti' : 'Kaldı',
      `"${r.completedAt}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sinav_sonuclari_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Sınav ve Test Sonuçları</h2>
          <p className="text-sm text-slate-500">
            Öğrencilerin tamamladığı sınavlar, puanlar, doğru/yanlış analizleri ve durumları
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm cursor-pointer"
        >
          <Download className="w-4 h-4" /> Sonuçları CSV Olarak İndir
        </button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
        <input
          type="text"
          placeholder="Öğrenci adı, no veya sınav başlığı ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Öğrenci</th>
                <th className="px-6 py-4">Sınav / Test Başlığı</th>
                <th className="px-6 py-4">Tür</th>
                <th className="px-6 py-4">Doğru / Yanlış / Boş</th>
                <th className="px-6 py-4">Puan</th>
                <th className="px-6 py-4">Sonuç</th>
                <th className="px-6 py-4">Tarih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredResults.map((res) => (
                <tr key={res.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800">{res.studentName}</div>
                    <div className="text-xs text-slate-400 font-mono">No: {res.studentNo}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-700">{res.targetTitle || res.examTitle || 'Sınav Değerlendirmesi'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {res.examType === 'exam' ? 'Vize Sınavı' : 'Konu Testi'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="text-emerald-600 font-bold">{res.correctCount} D</span>
                      <span className="text-slate-300">/</span>
                      <span className="text-rose-600 font-bold">{res.wrongCount} Y</span>
                      <span className="text-slate-300">/</span>
                      <span className="text-slate-400">{res.emptyCount} B</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-base font-black text-teal-600">{res.score}</span>
                    <span className="text-xs text-slate-400"> / 100</span>
                  </td>
                  <td className="px-6 py-4">
                    {res.passed ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle className="w-3.5 h-3.5" /> Geçti
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        <XCircle className="w-3.5 h-3.5" /> Kaldı
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400 font-mono">
                    {res.completedAt}
                  </td>
                </tr>
              ))}
              {filteredResults.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-sm">
                    Sınav sonucu bulunamadı.
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
